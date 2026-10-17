"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { invitations, rsvps } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function deleteRsvp(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const owned = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.userId, user.id));
  const scope = owned.map((row) => row.id);
  if (scope.length === 0) return;

  await db
    .delete(rsvps)
    .where(and(eq(rsvps.id, id), inArray(rsvps.invitationId, scope)));
  revalidatePath("/dashboard/rsvp");
}
