import { eq } from "drizzle-orm";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSettingDef, settingDefaults } from "@/lib/settings-defs";

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const stored = Object.fromEntries(
    rows.map((row) => [row.key, row.value ?? ""]),
  );
  return { ...settingDefaults(), ...stored };
}

export async function getSetting(key: string): Promise<string> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return row?.value ?? getSettingDef(key)?.default ?? "";
}

export async function updateSettings(
  values: Record<string, string>,
): Promise<void> {
  const entries = Object.entries(values);
  for (const [key, value] of entries) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
}
