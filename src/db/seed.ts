import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { DEFAULT_TEMPLATE_CONFIG } from "../lib/template-config";
import { plans, settings, templates } from "./schema";

const sqlite = new Database(process.env.DATABASE_URL ?? "./sqlite.db");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

async function main() {
  console.log("Menyiapkan paket langganan...");
  const existingPlans = await db.select({ id: plans.id }).from(plans);
  if (existingPlans.length === 0) {
    await db.insert(plans).values([
      {
        code: "free",
        name: "Gratis",
        description: "Coba semua fitur dasar untuk undangan pertamamu.",
        price: 0,
        durationDays: 0,
        maxInvitations: 1,
        maxGuests: 50,
        maxGallery: 6,
        features: [
          "1 undangan aktif",
          "Maksimal 50 tamu",
          "6 foto galeri",
          "RSVP & buku ucapan",
          "Nama situs pada undangan",
        ],
        sortOrder: 1,
      },
      {
        code: "premium_monthly",
        name: "Premium Bulanan",
        description: "Semua fitur premium, ditagih setiap bulan.",
        price: 49000,
        durationDays: 30,
        maxInvitations: 10,
        maxGuests: 5000,
        maxGallery: 50,
        features: [
          "10 undangan aktif",
          "Tamu tanpa batas praktis",
          "50 foto galeri",
          "Musik latar & amplop digital",
          "Tanpa nama situs",
        ],
        sortOrder: 2,
      },
      {
        code: "premium_yearly",
        name: "Premium Tahunan",
        description: "Hemat 40% dengan paket tahunan.",
        price: 349000,
        durationDays: 365,
        maxInvitations: 50,
        maxGuests: 20000,
        maxGallery: 100,
        features: [
          "50 undangan aktif",
          "Tamu tanpa batas praktis",
          "100 foto galeri",
          "Semua fitur premium",
          "Prioritas dukungan",
        ],
        sortOrder: 3,
      },
    ]);
  } else {
    console.log("  Paket sudah ada, dilewati.");
  }

  console.log("Menyiapkan template awal...");
  const existingTemplates = await db.select({ id: templates.id }).from(templates);
  if (existingTemplates.length === 0) {
    await db.insert(templates).values([
      {
        code: "elegant-rose",
        name: "Elegant Rose",
        description: "Nuansa romantis dengan aksen rose gold.",
        primaryColor: "#3f1d2e",
        accentColor: "#c48b9f",
        category: "pernikahan",
        isPremium: false,
        source: "manual",
        config: {
          ...DEFAULT_TEMPLATE_CONFIG,
          layout: "floral",
          colors: {
            primary: "#3f1d2e",
            accent: "#c48b9f",
            background: "#fdf6f8",
            surface: "#ffffff",
            text: "#2f1622",
          },
          motif: "kelopak rose dan garis tipis",
        },
        sortOrder: 1,
      },
      {
        code: "royal-emerald",
        name: "Royal Emerald",
        description: "Hijau zamrud mewah untuk acara formal.",
        primaryColor: "#0b3d2e",
        accentColor: "#d4af37",
        category: "pernikahan",
        isPremium: true,
        source: "manual",
        config: {
          ...DEFAULT_TEMPLATE_CONFIG,
          layout: "royal",
          colors: {
            primary: "#0b3d2e",
            accent: "#d4af37",
            background: "#f7f3ea",
            surface: "#ffffff",
            text: "#17241d",
          },
          motif: "daun dan garis emas",
        },
        sortOrder: 2,
      },
      {
        code: "midnight-slate",
        name: "Midnight Slate",
        description: "Minimalis gelap dengan tipografi tegas.",
        primaryColor: "#0f172a",
        accentColor: "#38bdf8",
        category: "lainnya",
        isPremium: true,
        source: "manual",
        config: {
          ...DEFAULT_TEMPLATE_CONFIG,
          layout: "minimal",
          colors: {
            primary: "#0f172a",
            accent: "#38bdf8",
            background: "#0b1120",
            surface: "#111a2e",
            text: "#e2e8f0",
          },
          motif: "geometris minimal",
        },
        sortOrder: 3,
      },
    ]);
  } else {
    console.log("  Template sudah ada, dilewati.");
  }

  console.log("Menyiapkan pengaturan dasar...");
  const existingSettings = await db.select({ key: settings.key }).from(settings);
  if (existingSettings.length === 0) {
    await db.insert(settings).values([
      { key: "site_name", value: "UndanganKita" },
      {
        key: "tagline",
        value: "Undangan digital yang berkesan, dalam hitungan menit.",
      },
      { key: "contact_email", value: "halo@undangan.test" },
    ]);
  } else {
    console.log("  Pengaturan sudah ada, dilewati.");
  }

  console.log("Selesai. Tidak ada akun demo yang dibuat.");
  console.log("Silakan buka /register — akun pertama otomatis menjadi admin.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
