"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { invitations, wishes } from "@/db/schema";
import { requireUser } from "@/lib/auth";

async function scopeIds(userId: number) {
  const owned = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.userId, userId));
  return owned.map((row) => row.id);
}

export async function toggleWish(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const approved = formData.get("approved") === "true";
  const scope = await scopeIds(user.id);
  if (scope.length === 0) return;

  await db
    .update(wishes)
    .set({ isApproved: !approved })
    .where(and(eq(wishes.id, id), inArray(wishes.invitationId, scope)));
  revalidatePath("/dashboard/wishes");
}

export async function deleteWish(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const scope = await scopeIds(user.id);
  if (scope.length === 0) return;

  await db
    .delete(wishes)
    .where(and(eq(wishes.id, id), inArray(wishes.invitationId, scope)));
  revalidatePath("/dashboard/wishes");
}
