"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { plans, transactions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { generateToken } from "@/lib/password";

export async function requestUpgrade(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const planCode = String(formData.get("planCode") ?? "");
  if (!planCode) return { error: "Pilih paket terlebih dahulu." };

  const [plan] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.code, planCode as "premium_monthly"), eq(plans.isActive, true)))
    .limit(1);

  if (!plan) return { error: "Paket tidak tersedia." };

  const reference = `TRX-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${generateToken(3).toUpperCase()}`;

  await db.insert(transactions).values({
    userId: user.id,
    planId: plan.id,
    planCode: plan.code,
    amount: plan.price,
    status: "pending",
    method: "transfer_bank",
    reference,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  revalidatePath("/dashboard/billing");
  return {
    success: `Permintaan paket ${plan.name} dibuat. Kode referensi ${reference}.`,
  };
}

export async function cancelTransaction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));
  revalidatePath("/dashboard/billing");
}
