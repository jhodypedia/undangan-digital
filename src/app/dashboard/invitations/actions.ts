"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  albums,
  events,
  galleries,
  gifts,
  invitations,
  stories,
} from "@/db/schema";
import { getAccountLimits } from "@/lib/limits";
import { isPremiumActive, requireUser } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { slugify } from "@/lib/format";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import {
  generateImage,
  generateTemplate,
  isAiConfigured,
  AI_MAINTENANCE_MESSAGE,
  type GeneratedTemplate,
} from "@/lib/ai";
import { normalizeTemplateConfig } from "@/lib/template-config";
import { purgeInvitationMedia } from "@/lib/media-cleanup";
import { removeUploadedFile, removeUploadedFiles, saveImage } from "@/lib/upload";
import { parseWIBInput } from "@/lib/time";
import { resolveLatLng } from "@/lib/maps";
import type { GiftType, InvitationCategory } from "@/lib/constants";

async function ownedInvitation(invitationId: number, userId: number) {
  const [row] = await db
    .select()
    .from(invitations)
    .where(
      and(eq(invitations.id, invitationId), eq(invitations.userId, userId)),
    )
    .limit(1);
  return row ?? null;
}

async function uniqueSlug(base: string, excludeId?: number) {
  const root = slugify(base) || "undangan";
  let candidate = root;
  let counter = 1;
  while (true) {
    const [existing] = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(eq(invitations.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    counter += 1;
    candidate = `${root}-${counter}`;
  }
}

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
};

export async function createInvitation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const limits = await getAccountLimits(user);

  const title = str(formData, "title");
  if (!title) return { error: "Judul undangan wajib diisi." };

  const existing = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.userId, user.id));

  if (existing.length >= limits.maxInvitations) {
    return {
      error: `Paket ${limits.planName} hanya mendukung ${limits.maxInvitations} undangan. Upgrade untuk menambah.`,
    };
  }

  const slug = await uniqueSlug(str(formData, "slug") ?? title);
  const [created] = await db
    .insert(invitations)
    .values({
      userId: user.id,
      slug,
      title,
      category: (str(formData, "category") ?? "pernikahan") as InvitationCategory,
      groomName: str(formData, "groomName"),
      brideName: str(formData, "brideName"),
      eventDate: parseWIBInput(str(formData, "eventDate")),
    })
    .returning();

  await db.insert(events).values({
    invitationId: created.id,
    name: "Acara Utama",
    date: created.eventDate,
    startTime: "09:00",
    endTime: "12:00",
    sortOrder: 1,
  });

  revalidatePath("/dashboard/invitations");
  return { success: "Undangan dibuat." };
}

export async function updateInvitation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const owned = await ownedInvitation(id, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const title = str(formData, "title");
  if (!title) return { error: "Judul undangan wajib diisi." };

  const slug =
    str(formData, "slug") && str(formData, "slug") !== owned.slug
      ? await uniqueSlug(str(formData, "slug") ?? title, id)
      : owned.slug;

  const coverImage = str(formData, "coverImage");
  const coverPhoto = str(formData, "coverPhoto");
  const groomPhoto = str(formData, "groomPhoto");
  const bridePhoto = str(formData, "bridePhoto");

  const mapsUrl = str(formData, "mapsUrl");
  const coords = resolveLatLng(
    str(formData, "latitude"),
    str(formData, "longitude"),
    mapsUrl,
  );

  await db
    .update(invitations)
    .set({
      title,
      slug,
      category: (str(formData, "category") ?? owned.category) as InvitationCategory,
      groomName: str(formData, "groomName"),
      groomFullName: str(formData, "groomFullName"),
      groomParents: str(formData, "groomParents"),
      groomOrder: str(formData, "groomOrder"),
      groomInstagram: str(formData, "groomInstagram"),
      groomPhoto,
      brideName: str(formData, "brideName"),
      brideFullName: str(formData, "brideFullName"),
      brideParents: str(formData, "brideParents"),
      brideOrder: str(formData, "brideOrder"),
      brideInstagram: str(formData, "brideInstagram"),
      bridePhoto,
      quote: str(formData, "quote"),
      quoteSource: str(formData, "quoteSource"),
      greeting: str(formData, "greeting"),
      closing: str(formData, "closing"),
      coverImage,
      coverPhoto,
      musicUrl: str(formData, "musicUrl"),
      themeColor: str(formData, "themeColor") ?? owned.themeColor,
      accentColor: str(formData, "accentColor") ?? owned.accentColor,
      eventDate: parseWIBInput(str(formData, "eventDate")),
      rsvpDeadline: parseWIBInput(str(formData, "rsvpDeadline")),
      locationName: str(formData, "locationName"),
      address: str(formData, "address"),
      mapsUrl,
      latitude: coords ? String(coords.lat) : null,
      longitude: coords ? String(coords.lng) : null,
      liveStreamUrl: str(formData, "liveStreamUrl"),
    })
    .where(eq(invitations.id, id));

  await removeUploadedFiles([
    coverImage !== owned.coverImage ? owned.coverImage : null,
    coverPhoto !== owned.coverPhoto ? owned.coverPhoto : null,
    groomPhoto !== owned.groomPhoto ? owned.groomPhoto : null,
    bridePhoto !== owned.bridePhoto ? owned.bridePhoto : null,
  ]);

  revalidatePath(`/dashboard/invitations/${id}`);
  revalidatePath(`/u/${slug}`);
  return { success: "Perubahan disimpan." };
}

export async function togglePublish(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const owned = await ownedInvitation(id, user.id);
  if (!owned) return;
  await db
    .update(invitations)
    .set({ isPublished: !owned.isPublished })
    .where(eq(invitations.id, id));
  revalidatePath("/dashboard/invitations");
  revalidatePath(`/dashboard/invitations/${id}`);
}

export async function deleteInvitation(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const owned = await ownedInvitation(id, user.id);
  if (!owned) return;
  await purgeInvitationMedia([id]);
  await db.delete(invitations).where(eq(invitations.id, id));
  revalidatePath("/dashboard/invitations");
}

export async function saveEvent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const name = str(formData, "name");
  if (!name) return { error: "Nama acara wajib diisi." };

  const mapsUrl = str(formData, "mapsUrl");
  const coords = resolveLatLng(
    str(formData, "latitude"),
    str(formData, "longitude"),
    mapsUrl,
  );

  const values = {
    invitationId,
    name,
    date: parseWIBInput(str(formData, "date")),
    startTime: str(formData, "startTime"),
    endTime: str(formData, "endTime"),
    venue: str(formData, "venue"),
    address: str(formData, "address"),
    mapsUrl,
    latitude: coords ? String(coords.lat) : null,
    longitude: coords ? String(coords.lng) : null,
    note: str(formData, "note"),
  };

  const id = Number(formData.get("id"));
  if (id) {
    await db.update(events).set(values).where(eq(events.id, id));
  } else {
    await db.insert(events).values(values);
  }
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: "Acara disimpan." };
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return;
  await db.delete(events).where(eq(events.id, Number(formData.get("id"))));
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
}

export async function saveStory(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const title = str(formData, "title");
  if (!title) return { error: "Judul cerita wajib diisi." };

  const values = {
    invitationId,
    title,
    storyDate: parseWIBInput(str(formData, "storyDate")),
    description: str(formData, "description"),
    photoUrl: str(formData, "photoUrl"),
  };

  const id = Number(formData.get("id"));
  if (id) {
    await db.update(stories).set(values).where(eq(stories.id, id));
  } else {
    await db.insert(stories).values(values);
  }
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: "Cerita disimpan." };
}

export async function deleteStory(formData: FormData): Promise<void> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return;
  const id = Number(formData.get("id"));
  const [row] = await db
    .select({ url: stories.photoUrl })
    .from(stories)
    .where(and(eq(stories.id, id), eq(stories.invitationId, invitationId)));
  await db.delete(stories).where(and(eq(stories.id, id), eq(stories.invitationId, invitationId)));
  await removeUploadedFile(row?.url);
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
}

export async function addGallery(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const limits = await getAccountLimits(user);
  const current = await db
    .select({ id: galleries.id })
    .from(galleries)
    .where(eq(galleries.invitationId, invitationId));
  if (current.length >= limits.maxGallery) {
    return {
      error: `Paket ${limits.planName} mendukung hingga ${limits.maxGallery} foto.`,
    };
  }

  const rawUrls = formData.getAll("imageUrl").map(String);
  const urls = rawUrls
    .filter((value) => value.length > 0)
    .slice(0, limits.maxGallery - current.length);
  if (urls.length === 0) return { error: "URL gambar wajib diisi." };

  const albumId = Number(formData.get("albumId")) || null;
  const caption = str(formData, "caption");

  await db.insert(galleries).values(
    urls.map((imageUrl, index) => ({
      invitationId,
      albumId,
      imageUrl,
      caption,
      sortOrder: current.length + index + 1,
    })),
  );
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return {
    success:
      urls.length > 1
        ? `${urls.length} foto ditambahkan.`
        : "Foto ditambahkan.",
  };
}

export async function saveAlbum(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const name = str(formData, "name");
  if (!name) return { error: "Nama album wajib diisi." };

  const id = Number(formData.get("id")) || null;
  const values = {
    name,
    description: str(formData, "description"),
    coverImage: str(formData, "coverImage"),
    isPublic: formData.getAll("isPublic").some((value) => value === "1"),
  };

  if (id) {
    await db
      .update(albums)
      .set(values)
      .where(and(eq(albums.id, id), eq(albums.invitationId, invitationId)));
  } else {
    const existing = await db
      .select({ id: albums.id })
      .from(albums)
      .where(eq(albums.invitationId, invitationId));
    await db.insert(albums).values({
      invitationId,
      ...values,
      sortOrder: existing.length + 1,
    });
  }

  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: id ? "Album diperbarui." : "Album ditambahkan." };
}

export async function deleteAlbum(formData: FormData): Promise<void> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return;
  const id = Number(formData.get("id"));
  const [row] = await db
    .select({ url: albums.coverImage })
    .from(albums)
    .where(and(eq(albums.id, id), eq(albums.invitationId, invitationId)));
  await db
    .delete(albums)
    .where(and(eq(albums.id, id), eq(albums.invitationId, invitationId)));
  await removeUploadedFile(row?.url);
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
}

export async function deleteGallery(formData: FormData): Promise<void> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return;
  const id = Number(formData.get("id"));
  const [row] = await db
    .select({ url: galleries.imageUrl })
    .from(galleries)
    .where(and(eq(galleries.id, id), eq(galleries.invitationId, invitationId)));
  await db
    .delete(galleries)
    .where(and(eq(galleries.id, id), eq(galleries.invitationId, invitationId)));
  await removeUploadedFile(row?.url);
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
}

export async function saveGift(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const type = (str(formData, "type") ?? "bank") as GiftType;
  const values = {
    invitationId,
    type,
    provider: str(formData, "provider"),
    accountName: str(formData, "accountName"),
    accountNumber: str(formData, "accountNumber"),
    address: str(formData, "address"),
    note: str(formData, "note"),
    isPublic: formData.get("isPublic") === "on",
  };

  const id = Number(formData.get("id"));
  if (id) {
    await db.update(gifts).set(values).where(eq(gifts.id, id));
  } else {
    await db.insert(gifts).values(values);
  }
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: "Info hadiah disimpan." };
}

export async function deleteGift(formData: FormData): Promise<void> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return;
  await db.delete(gifts).where(eq(gifts.id, Number(formData.get("id"))));
  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
}

export async function uploadImageAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Berkas tidak valid." };

  const settings = await getSettings();
  const maxMb = Number(settings[SITE_SETTINGS_KEYS.uploadMaxMb] ?? "5") || 5;

  const result = await saveImage(file, maxMb);
  if (!result.ok) return { error: result.error };
  return { success: result.url };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export async function updateInvitationDesign(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const owned = await ownedInvitation(id, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  const backgroundImage = str(formData, "backgroundImage");
  const backgroundOverlay = clamp(
    Number(formData.get("backgroundOverlay")) || 0,
    0,
    90,
  );
  const backgroundBlur = clamp(
    Number(formData.get("backgroundBlur")) || 0,
    0,
    24,
  );

  await db
    .update(invitations)
    .set({ backgroundImage, backgroundOverlay, backgroundBlur })
    .where(eq(invitations.id, id));

  await removeUploadedFiles([
    backgroundImage !== owned.backgroundImage ? owned.backgroundImage : null,
  ]);

  revalidatePath(`/dashboard/invitations/${id}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: "Latar undangan disimpan." };
}

export async function generateBackgroundAction(
  invitationId: number,
  prompt: string,
): Promise<{ url?: string; error?: string }> {
  const user = await requireUser();
  if (!isPremiumActive(user)) {
    return { error: "Fitur AI khusus pengguna premium." };
  }
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  if (!(await isAiConfigured())) return { error: AI_MAINTENANCE_MESSAGE };

  const value = prompt.trim();
  if (!value) return { error: "Tulis deskripsi latar terlebih dahulu." };

  const settings = await getSettings();
  const maxMb = Number(settings[SITE_SETTINGS_KEYS.uploadMaxMb] ?? "5") || 5;

  const image = await generateImage(
    `Latar belakang untuk undangan digital, ${value}. Tanpa teks atau tulisan, tanpa wajah, komposisi elegan dan lembut, pencahayaan bagus, resolusi tinggi, orientasi potret.`,
  );
  if (!image.ok) return { error: image.error };

  const file = new File([new Uint8Array(image.buffer)], "latar-ai.png", {
    type: image.mime,
  });
  const saved = await saveImage(file, maxMb);
  if (!saved.ok) return { error: saved.error };

  const previous = owned.backgroundImage;
  await db
    .update(invitations)
    .set({ backgroundImage: saved.url })
    .where(eq(invitations.id, invitationId));
  await removeUploadedFiles([previous !== saved.url ? previous : null]);

  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { url: saved.url };
}

export async function previewInvitationLookAction(
  invitationId: number,
  prompt: string,
): Promise<{ generated?: GeneratedTemplate; error?: string }> {
  const user = await requireUser();
  if (!isPremiumActive(user)) {
    return { error: "Fitur AI khusus pengguna premium." };
  }
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  if (!(await isAiConfigured())) return { error: AI_MAINTENANCE_MESSAGE };

  const value = prompt.trim();
  if (!value) return { error: "Tulis deskripsi tampilan terlebih dahulu." };

  const generated = await generateTemplate(value);
  return { generated };
}

export async function applyInvitationLookAction(
  invitationId: number,
  generated: GeneratedTemplate,
): Promise<FormState> {
  const user = await requireUser();
  if (!isPremiumActive(user)) {
    return { error: "Fitur AI khusus pengguna premium." };
  }
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };
  if (!generated?.config) return { error: "Data tampilan tidak valid." };

  const config = normalizeTemplateConfig(generated.config);
  await db
    .update(invitations)
    .set({
      customConfig: config,
      themeColor: config.colors.primary,
      accentColor: config.colors.accent,
    })
    .where(eq(invitations.id, invitationId));

  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: `Tampilan "${generated.name}" diterapkan.` };
}

export async function clearInvitationLookAction(
  invitationId: number,
): Promise<FormState> {
  const user = await requireUser();
  if (!isPremiumActive(user)) {
    return { error: "Fitur AI khusus pengguna premium." };
  }
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Undangan tidak ditemukan." };

  await db
    .update(invitations)
    .set({ customConfig: null })
    .where(eq(invitations.id, invitationId));

  revalidatePath(`/dashboard/invitations/${invitationId}`);
  revalidatePath(`/u/${owned.slug}`);
  return { success: "Tampilan AI dihapus." };
}
