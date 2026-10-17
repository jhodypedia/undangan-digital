"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  plans,
  templates,
  transactions,
  users,
} from "@/db/schema";
import { generateTemplate, type GeneratedTemplate } from "@/lib/ai";
import { requireAdmin } from "@/lib/auth";
import { purgeUserMedia } from "@/lib/media-cleanup";
import { updateSettings } from "@/lib/settings";
import { getSettingDef } from "@/lib/settings-defs";
import { normalizeTemplateConfig } from "@/lib/template-config";
import type { FormState } from "@/lib/form-state";
import type { PlanCode, UserRole } from "@/lib/constants";

const str = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
};

export async function updateUserRole(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const role = String(formData.get("role") ?? "free") as UserRole;
  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/dashboard/admin/users");
}

export async function updateUserStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") === "suspended" ? "suspended" : "active";
  await db.update(users).set({ status }).where(eq(users.id, id));
  revalidatePath("/dashboard/admin/users");
}

export async function grantPremium(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const days = Number(formData.get("days") ?? 30);
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await db
    .update(users)
    .set({ role: "premium", premiumUntil: until })
    .where(eq(users.id, id));
  revalidatePath("/dashboard/admin/users");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  if (id === admin.id) return;
  await purgeUserMedia(id);
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/dashboard/admin/users");
}

export async function savePlan(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const code = str(formData, "code");
  const name = str(formData, "name");
  if (!code || !name) return { error: "Kode dan nama paket wajib diisi." };

  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const values = {
    code: code as PlanCode,
    name,
    description: str(formData, "description"),
    price: Number(formData.get("price") ?? 0),
    durationDays: Number(formData.get("durationDays") ?? 0),
    maxInvitations: Number(formData.get("maxInvitations") ?? 1),
    maxGuests: Number(formData.get("maxGuests") ?? 50),
    maxGallery: Number(formData.get("maxGallery") ?? 6),
    features,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };

  const id = Number(formData.get("id"));
  if (id) {
    await db.update(plans).set(values).where(eq(plans.id, id));
  } else {
    await db.insert(plans).values(values);
  }
  revalidatePath("/dashboard/admin/plans");
  return { success: "Paket disimpan." };
}

export async function deletePlan(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(plans).where(eq(plans.id, Number(formData.get("id"))));
  revalidatePath("/dashboard/admin/plans");
}

export async function updateTransaction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "pending") as
    | "pending"
    | "paid"
    | "failed"
    | "expired"
    | "refunded";

  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);
  if (!transaction) return;

  await db
    .update(transactions)
    .set({
      status,
      paidAt: status === "paid" ? new Date() : transaction.paidAt,
    })
    .where(eq(transactions.id, id));

  if (status === "paid") {
    const [plan] = transaction.planId
      ? await db.select().from(plans).where(eq(plans.id, transaction.planId)).limit(1)
      : [];
    const days = plan?.durationDays && plan.durationDays > 0 ? plan.durationDays : 30;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, transaction.userId))
      .limit(1);
    const base =
      user?.premiumUntil && user.premiumUntil.getTime() > Date.now()
        ? user.premiumUntil.getTime()
        : Date.now();
    await db
      .update(users)
      .set({
        role: user?.role === "admin" ? "admin" : "premium",
        premiumUntil: new Date(base + days * 24 * 60 * 60 * 1000),
      })
      .where(eq(users.id, transaction.userId));
  }

  revalidatePath("/dashboard/admin/transactions");
  revalidatePath("/dashboard/admin/users");
}

export async function generateTemplateAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const prompt = str(formData, "prompt");
  if (!prompt) return { error: "Tulis deskripsi template terlebih dahulu." };

  const generated = await generateTemplate(prompt);
  await db.insert(templates).values({
    code: `ai-${Date.now().toString(36)}`,
    name: generated.name,
    description: generated.description,
    primaryColor: generated.config.colors.primary,
    accentColor: generated.config.colors.accent,
    source: generated.source,
    prompt: generated.prompt,
    config: generated.config,
    isPremium: true,
    isActive: true,
  });

  revalidatePath("/dashboard/admin/templates");
  return {
    success: `Template "${generated.name}" dibuat via ${generated.source === "ai" ? "AI" : "generator bawaan"}.`,
  };
}

export async function previewTemplateAction(
  prompt: string,
): Promise<{ generated?: GeneratedTemplate; error?: string }> {
  await requireAdmin();
  const value = prompt.trim();
  if (!value) return { error: "Tulis deskripsi template terlebih dahulu." };
  const generated = await generateTemplate(value);
  return { generated };
}

export async function saveGeneratedTemplateAction(
  generated: GeneratedTemplate,
): Promise<FormState> {
  await requireAdmin();
  if (!generated?.name || !generated.config) {
    return { error: "Data template tidak valid." };
  }

  await db.insert(templates).values({
    code: `ai-${Date.now().toString(36)}`,
    name: generated.name,
    description: generated.description,
    primaryColor: generated.config.colors.primary,
    accentColor: generated.config.colors.accent,
    source: generated.source,
    prompt: generated.prompt,
    config: normalizeTemplateConfig(generated.config),
    isPremium: true,
    isActive: true,
  });

  revalidatePath("/dashboard/admin/templates");
  return { success: `Template "${generated.name}" disimpan.` };
}

export async function saveTemplate(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const name = str(formData, "name");
  if (!name) return { error: "Nama template wajib diisi." };

  await db
    .update(templates)
    .set({
      name,
      description: str(formData, "description"),
      primaryColor: str(formData, "primaryColor") ?? "#0b3d2e",
      accentColor: str(formData, "accentColor") ?? "#c9a24b",
      isPremium: formData.get("isPremium") === "on",
      isActive: formData.get("isActive") === "on",
      config: normalizeTemplateConfig({
        layout: (str(formData, "layout") ??
          "classic") as ReturnType<typeof normalizeTemplateConfig>["layout"],
        colors: {
          primary: str(formData, "primaryColor") ?? "#0b3d2e",
          accent: str(formData, "accentColor") ?? "#c9a24b",
          background: str(formData, "backgroundColor") ?? "#f7f3ea",
          surface: str(formData, "surfaceColor") ?? "#ffffff",
          text: str(formData, "textColor") ?? "#17241d",
        },
      }),
    })
    .where(eq(templates.id, id));

  revalidatePath("/dashboard/admin/templates");
  return { success: "Template diperbarui." };
}

export async function toggleTemplate(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  await db.update(templates).set({ isActive: !active }).where(eq(templates.id, id));
  revalidatePath("/dashboard/admin/templates");
}

export async function deleteTemplate(formData: FormData): Promise<void> {
  await requireAdmin();
  await db.delete(templates).where(eq(templates.id, Number(formData.get("id"))));
  revalidatePath("/dashboard/admin/templates");
}

export async function saveSettingsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key.startsWith("$ACTION")) continue;
    const def = getSettingDef(key);
    if (def?.secret && value.trim() === "") continue;
    values[key] = value;
  }
  await updateSettings(values);
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/");
  return { success: "Pengaturan situs disimpan." };
}
