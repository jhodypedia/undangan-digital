"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { guests, invitations, rsvps, wishes } from "@/db/schema";
import type { FormState } from "@/lib/form-state";
import type { Attendance } from "@/lib/constants";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
};

export async function submitRsvp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const invitationId = Number(formData.get("invitationId"));
  const name = str(formData, "name");
  if (!invitationId || !name) {
    return { error: "Nama wajib diisi." };
  }

  const [invitation] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);
  if (!invitation) return { error: "Undangan tidak ditemukan." };

  const totalGuests = Number(formData.get("totalGuests") ?? 1);
  const attendance = (str(formData, "attendance") ?? "hadir") as Attendance;
  const guestId = Number(formData.get("guestId")) || null;

  await db.insert(rsvps).values({
    invitationId,
    guestId,
    name,
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    attendance,
    totalGuests: Number.isFinite(totalGuests) && totalGuests > 0 ? totalGuests : 1,
    message: str(formData, "message"),
  });

  revalidatePath("/dashboard/rsvp");
  return { success: "Terima kasih! Konfirmasi kehadiran Anda tercatat." };
}

export async function submitWish(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const invitationId = Number(formData.get("invitationId"));
  const name = str(formData, "name");
  const message = str(formData, "message");
  if (!invitationId || !name || !message) {
    return { error: "Nama dan ucapan wajib diisi." };
  }

  const guestId = Number(formData.get("guestId")) || null;
  await db.insert(wishes).values({ invitationId, guestId, name, message });

  revalidatePath("/dashboard/wishes");
  return { success: "Ucapan Anda terkirim. Terima kasih!" };
}

export async function trackOpen(slug: string, code?: string): Promise<void> {
  const [invitation] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);
  if (!invitation) return;

  await db
    .update(invitations)
    .set({ viewCount: sql`${invitations.viewCount} + 1` })
    .where(eq(invitations.id, invitation.id));

  if (code) {
    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.code, code))
      .limit(1);
    if (guest && guest.invitationId === invitation.id) {
      await db
        .update(guests)
        .set({
          openedAt: guest.openedAt ?? new Date(),
          visitCount: guest.visitCount + 1,
        })
        .where(eq(guests.id, guest.id));
    }
  }
}
