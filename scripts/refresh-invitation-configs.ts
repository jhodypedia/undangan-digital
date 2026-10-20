/**
 * Menyegarkan `customConfig` undangan lama dari config template aktifnya.
 *
 * Latar: desain undangan dibaca dari `invitations.custom_config` bila terisi,
 * jadi undangan yang dibuat sebelum template diperbarui tidak ikut berubah.
 * Script ini membandingkan customConfig tiap undangan dengan config template
 * yang sedang aktif untuknya.
 *
 * Mode default adalah --dry-run (hanya laporan, tidak menulis). Tulis sungguhan
 * hanya bila diberi flag --apply:
 *   npx tsx scripts/refresh-invitation-configs.ts            # dry-run
 *   npx tsx scripts/refresh-invitation-configs.ts --apply    # tulis
 *
 * Undangan tanpa customConfig sudah mengikuti template secara langsung dan
 * tidak diubah. Undangan tanpa template aktif dilewati.
 */
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { normalizeTemplateConfig } from "../src/lib/template-config";
import { invitations, templates } from "../src/db/schema";

const apply = process.argv.includes("--apply");

/** Stringify stabil (kunci terurut) untuk membandingkan config JSON. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1));
  return `{${entries
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
    .join(",")}}`;
}

const sqlite = new Database(process.env.DATABASE_URL ?? "./sqlite.db");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

async function main() {
  console.log(
    apply
      ? "Mode: --apply (perubahan ditulis ke database)"
      : "Mode: dry-run (tidak ada perubahan ditulis; pakai --apply untuk menulis)",
  );

  const templateRows = await db.select().from(templates);
  const templateById = new Map(templateRows.map((row) => [row.id, row]));
  const invitationRows = await db.select().from(invitations);

  let following = 0;
  let inSync = 0;
  let noTemplate = 0;
  const stale: Array<{ id: number; slug: string; templateName: string }> = [];

  for (const invitation of invitationRows) {
    if (!invitation.customConfig) {
      following += 1;
      continue;
    }
    const template = invitation.templateId
      ? templateById.get(invitation.templateId)
      : undefined;
    if (!template) {
      noTemplate += 1;
      console.log(
        `  [lewati] /u/${invitation.slug} — punya customConfig tapi tidak ada template aktif.`,
      );
      continue;
    }
    const differs =
      stableStringify(normalizeTemplateConfig(invitation.customConfig)) !==
      stableStringify(normalizeTemplateConfig(template.config));
    if (!differs) {
      inSync += 1;
      continue;
    }
    stale.push({
      id: invitation.id,
      slug: invitation.slug,
      templateName: template.name,
    });
    console.log(
      `  [berbeda] /u/${invitation.slug} — customConfig != template "${template.name}".`,
    );

    if (apply) {
      await db
        .update(invitations)
        .set({
          customConfig: normalizeTemplateConfig(template.config),
          themeColor: template.primaryColor,
          accentColor: template.accentColor,
        })
        .where(eq(invitations.id, invitation.id));
    }
  }

  console.log("");
  console.log(`Total undangan        : ${invitationRows.length}`);
  console.log(`Mengikuti template    : ${following} (tanpa customConfig)`);
  console.log(`CustomConfig selaras  : ${inSync}`);
  console.log(`Tanpa template aktif  : ${noTemplate}`);
  console.log(
    `Perlu disegarkan      : ${stale.length}${apply ? " — sudah ditulis ulang dari template." : " — jalankan dengan --apply untuk menulis."}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
