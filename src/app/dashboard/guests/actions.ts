"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { guests, invitations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { getAccountLimits } from "@/lib/limits";
import { generateToken } from "@/lib/password";
import type { GuestCategory } from "@/lib/constants";

async function ownedInvitation(invitationId: number, userId: number) {
  const [row] = await db
    .select({ id: invitations.id, slug: invitations.slug })
    .from(invitations)
    .where(
      and(eq(invitations.id, invitationId), eq(invitations.userId, userId)),
    )
    .limit(1);
  return row ?? null;
}

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
};

export async function createGuest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const invitationId = Number(formData.get("invitationId"));
  const owned = await ownedInvitation(invitationId, user.id);
  if (!owned) return { error: "Pilih undangan yang valid." };

  const name = str(formData, "name");
  if (!name) return { error: "Nama tamu wajib diisi." };

  const limits = await getAccountLimits(user);
  const current = await db
    .select({ id: guests.id })
    .from(guests)
    .where(eq(guests.invitationId, invitationId));

  if (current.length >= limits.maxGuests) {
    return {
      error: `Paket ${limits.planName} mendukung hingga ${limits.maxGuests} tamu. Upgrade untuk menambah.`,
    };
  }

  const code = `${owned.slug.slice(0, 16)}-${generateToken(4)}`.toLowerCase();

  await db.insert(guests).values({
    invitationId,
    name,
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    address: str(formData, "address"),
    category: (str(formData, "category") ?? "lainnya") as GuestCategory,
    code,
    personalMessage: str(formData, "personalMessage"),
  });

  revalidatePath("/dashboard/guests");
  return { success: `Tamu ${name} ditambahkan.` };
}

export async function updateGuest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.id, id))
    .limit(1);
  if (!guest) return { error: "Tamu tidak ditemukan." };
  const owned = await ownedInvitation(guest.invitationId, user.id);
  if (!owned) return { error: "Akses ditolak." };

  await db
    .update(guests)
    .set({
      name: str(formData, "name") ?? guest.name,
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      address: str(formData, "address"),
      category: (str(formData, "category") ?? guest.category) as GuestCategory,
      personalMessage: str(formData, "personalMessage"),
    })
    .where(eq(guests.id, id));

  revalidatePath("/dashboard/guests");
  return { success: "Data tamu diperbarui." };
}

export async function markGuestSent(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const [guest] = await db.select().from(guests).where(eq(guests.id, id)).limit(1);
  if (!guest) return;
  const owned = await ownedInvitation(guest.invitationId, user.id);
  if (!owned) return;
  await db
    .update(guests)
    .set({ isSent: true, sentAt: new Date() })
    .where(eq(guests.id, id));
  revalidatePath("/dashboard/guests");
}

export async function deleteGuest(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const [guest] = await db.select().from(guests).where(eq(guests.id, id)).limit(1);
  if (!guest) return;
  const owned = await ownedInvitation(guest.invitationId, user.id);
  if (!owned) return;
  await db.delete(guests).where(eq(guests.id, id));
  revalidatePath("/dashboard/guests");
}

export async function deleteGuestsBulk(formData: FormData): Promise<void> {
  const user = await requireUser();
  const ids = formData
    .getAll("ids")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  if (ids.length === 0) return;

  const ownedIds = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.userId, user.id));
  const scope = ownedIds.map((row) => row.id);
  if (scope.length === 0) return;

  await db
    .delete(guests)
    .where(and(inArray(guests.id, ids), inArray(guests.invitationId, scope)));
  revalidatePath("/dashboard/guests");
}
