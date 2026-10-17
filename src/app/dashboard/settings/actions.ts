"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { hashPassword, verifyPassword } from "@/lib/password";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
};

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const name = str(formData, "name");
  if (!name || name.length < 3) return { error: "Nama minimal 3 karakter." };

  await db
    .update(users)
    .set({
      name,
      phone: str(formData, "phone"),
      companyName: str(formData, "companyName"),
      avatarUrl: str(formData, "avatarUrl"),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard/settings");
  return { success: "Profil diperbarui." };
}

export async function changePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!verifyPassword(current, user.passwordHash)) {
    return { error: "Kata sandi saat ini salah." };
  }
  if (next.length < 8) return { error: "Kata sandi baru minimal 8 karakter." };
  if (next !== confirm) return { error: "Konfirmasi kata sandi tidak sama." };

  await db
    .update(users)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(users.id, user.id));

  return { success: "Kata sandi diperbarui." };
}
