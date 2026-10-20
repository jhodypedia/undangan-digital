import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

import type { InvitationCategory } from "../lib/constants";
import {
  DEFAULT_TEMPLATE_CONFIG,
  type TemplateConfig,
} from "../lib/template-config";
import { plans, settings, templates } from "./schema";

type SeedTemplate = {
  code: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  category: InvitationCategory;
  isPremium: boolean;
  source: "manual";
  config: TemplateConfig;
  sortOrder: number;
};

function theme(options: {
  layout: TemplateConfig["layout"];
  coverStyle: TemplateConfig["coverStyle"];
  frameStyle: TemplateConfig["frameStyle"];
  fontDisplay: string;
  fontBody?: string;
  fontScript?: string;
  fontAccent?: string;
  motif: string;
  ornament: NonNullable<TemplateConfig["ornament"]>;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    surface?: string;
  };
}): TemplateConfig {
  return {
    ...DEFAULT_TEMPLATE_CONFIG,
    layout: options.layout,
    coverStyle: options.coverStyle,
    frameStyle: options.frameStyle,
    fontDisplay: options.fontDisplay,
    fontBody: options.fontBody ?? "Plus Jakarta Sans",
    fontScript: options.fontScript,
    fontAccent: options.fontAccent,
    motif: options.motif,
    ornament: options.ornament,
    colors: {
      primary: options.colors.primary,
      accent: options.colors.accent,
      background: options.colors.background,
      surface: options.colors.surface ?? "#ffffff",
      text: options.colors.text,
    },
  };
}

const SEED_TEMPLATES: SeedTemplate[] = [
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
      coverStyle: "framed",
      frameStyle: "arch",
      colors: {
        primary: "#3f1d2e",
        accent: "#c48b9f",
        background: "#fdf6f8",
        surface: "#ffffff",
        text: "#2f1622",
      },
      motif: "kelopak rose dan garis tipis",
      ornament: "rose",
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
      coverStyle: "framed",
      frameStyle: "arch",
      colors: {
        primary: "#0b3d2e",
        accent: "#d4af37",
        background: "#f7f3ea",
        surface: "#ffffff",
        text: "#17241d",
      },
      motif: "daun dan garis emas",
      ornament: "daun-emas",
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
      coverStyle: "full",
      frameStyle: "square",
      colors: {
        primary: "#0f172a",
        accent: "#38bdf8",
        background: "#0b1120",
        surface: "#111a2e",
        text: "#e2e8f0",
      },
      motif: "geometris minimal",
      ornament: "geometris-minimal",
    },
    sortOrder: 3,
  },
  {
    code: "jawa-biru",
    name: "Jawa Biru Modern",
    description:
      "Mega mendung biru dengan aksen emas, sentuhan Jawa yang modern dan berkelas.",
    primaryColor: "#16295e",
    accentColor: "#c9a24b",
    category: "pernikahan",
    isPremium: false,
    source: "manual",
    config: theme({
      layout: "javanese",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "mega-mendung",
      ornament: "mega-mendung",
      colors: {
        primary: "#16295e",
        accent: "#c9a24b",
        background: "#eef2fb",
        text: "#1c2440",
      },
    }),
    sortOrder: 4,
  },
  {
    code: "jawa-merah",
    name: "Jawa Merah Klasik",
    description:
      "Merah marun dan emas dengan pola parang, nuansa klasik keraton Jawa.",
    primaryColor: "#7f1d1d",
    accentColor: "#d4af37",
    category: "pernikahan",
    isPremium: false,
    source: "manual",
    config: theme({
      layout: "javanese",
      coverStyle: "full",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "parang",
      ornament: "parang",
      colors: {
        primary: "#7f1d1d",
        accent: "#d4af37",
        background: "#fdf3ec",
        text: "#3a1d17",
      },
    }),
    sortOrder: 5,
  },
  {
    code: "jawa-hitam",
    name: "Art Jawa Hitam",
    description:
      "Hitam pekat, marun, dan emas dengan gunungan wayang serta parang halus — megah dan sakral.",
    primaryColor: "#17130c",
    accentColor: "#c9a24b",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "javanese",
      coverStyle: "full",
      frameStyle: "arch",
      fontDisplay: "Playfair Display",
      fontBody: "Poppins",
      fontScript: "Pinyon Script",
      fontAccent: "Cormorant Garamond",
      motif: "gunungan dan parang",
      ornament: "gunungan",
      colors: {
        primary: "#17130c",
        accent: "#c9a24b",
        background: "#0b0a08",
        text: "#f4efe4",
        surface: "#14110d",
      },
    }),
    sortOrder: 6,
  },
  {
    code: "art-jawa",
    name: "Art Jawa Coklat",
    description:
      "Cokelat tanah dan emas dengan motif kawung, hangat dan sarat makna Jawa.",
    primaryColor: "#4a2f1b",
    accentColor: "#b98a44",
    category: "pernikahan",
    isPremium: false,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "full",
      frameStyle: "arch",
      fontDisplay: "Fraunces",
      motif: "kawung",
      ornament: "kawung",
      colors: {
        primary: "#4a2f1b",
        accent: "#b98a44",
        background: "#f7efe3",
        text: "#332416",
      },
    }),
    sortOrder: 7,
  },
  {
    code: "bali",
    name: "Art Bali",
    description:
      "Gapura candi bentar dan bunga kamboja dalam palet terakota khas Bali.",
    primaryColor: "#7c2d12",
    accentColor: "#e0a526",
    category: "pernikahan",
    isPremium: false,
    source: "manual",
    config: theme({
      layout: "floral",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cormorant Garamond",
      motif: "candi-bentar",
      ornament: "candi-bentar",
      colors: {
        primary: "#7c2d12",
        accent: "#e0a526",
        background: "#fdf6ea",
        text: "#3a2414",
      },
    }),
    sortOrder: 8,
  },
  {
    code: "palembang",
    name: "Art Palembang Songket",
    description:
      "Kemewahan songket Palembang dalam marun dan emas yang megah.",
    primaryColor: "#6d0f1b",
    accentColor: "#d4af37",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "royal",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "songket",
      ornament: "songket",
      colors: {
        primary: "#6d0f1b",
        accent: "#d4af37",
        background: "#fbf1e8",
        text: "#2f1518",
      },
    }),
    sortOrder: 9,
  },
  {
    code: "banjar",
    name: "Art Banjar",
    description:
      "Hijau zamrud dan kuning songket, perpaduan adat Banjar yang segar.",
    primaryColor: "#065f46",
    accentColor: "#f59e0b",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "full",
      frameStyle: "arch",
      fontDisplay: "Fraunces",
      motif: "songket",
      ornament: "songket",
      colors: {
        primary: "#065f46",
        accent: "#f59e0b",
        background: "#eefaf3",
        text: "#123329",
      },
    }),
    sortOrder: 10,
  },
  {
    code: "batak",
    name: "Art Batak Ulos",
    description:
      "Merah dan hitam tegas dengan pola ulos, mencerminkan keberanian dan restu adat Batak.",
    primaryColor: "#991b1b",
    accentColor: "#171717",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "full",
      frameStyle: "square",
      fontDisplay: "Fraunces",
      motif: "ulos",
      ornament: "ulos",
      colors: {
        primary: "#991b1b",
        accent: "#171717",
        background: "#fdf6ec",
        text: "#3a1d1d",
      },
    }),
    sortOrder: 11,
  },
  {
    code: "batak-karo",
    name: "Batak Karo",
    description:
      "Merah menyala dan kuning emas dengan motif ulos Karo yang bersemangat.",
    primaryColor: "#b91c1c",
    accentColor: "#facc15",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "full",
      frameStyle: "square",
      fontDisplay: "Fraunces",
      motif: "ulos",
      ornament: "ulos",
      colors: {
        primary: "#b91c1c",
        accent: "#facc15",
        background: "#fdf6ec",
        text: "#3a1d1d",
      },
    }),
    sortOrder: 12,
  },
  {
    code: "mandailing",
    name: "Art Mandailing",
    description:
      "Cokelat tua dan emas dengan ulos Mandailing yang anggun dan sakral.",
    primaryColor: "#78350f",
    accentColor: "#d4af37",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Fraunces",
      motif: "ulos",
      ornament: "ulos",
      colors: {
        primary: "#78350f",
        accent: "#d4af37",
        background: "#f9f1e3",
        text: "#33250f",
      },
    }),
    sortOrder: 13,
  },
  {
    code: "chinese",
    name: "Art Chinese",
    description:
      "Merah keberuntungan dengan peony dan lampion, nuansa Tionghoa yang hangat.",
    primaryColor: "#b91c1c",
    accentColor: "#f5c542",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "royal",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "peony-lampion",
      ornament: "peony-lampion",
      colors: {
        primary: "#b91c1c",
        accent: "#f5c542",
        background: "#fff7e6",
        text: "#3a1a1a",
      },
    }),
    sortOrder: 14,
  },
  {
    code: "minang",
    name: "Art Minang Marawa",
    description:
      "Marawa merah-kuning-hitam dalam komposisi royal Minangkabau.",
    primaryColor: "#7f1d1d",
    accentColor: "#eab308",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "royal",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "marawa",
      ornament: "marawa",
      colors: {
        primary: "#7f1d1d",
        accent: "#eab308",
        background: "#fdf8ec",
        text: "#3a1d1d",
      },
    }),
    sortOrder: 15,
  },
  {
    code: "toraja",
    name: "Art Toraja",
    description:
      "Siluet tongkonan dan merah bara, menghadirkan keagungan tanah Toraja.",
    primaryColor: "#451a03",
    accentColor: "#dc2626",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "full",
      frameStyle: "square",
      fontDisplay: "Fraunces",
      motif: "tongkonan",
      ornament: "tongkonan",
      colors: {
        primary: "#451a03",
        accent: "#dc2626",
        background: "#f8efe2",
        text: "#33210f",
      },
    }),
    sortOrder: 16,
  },
  {
    code: "melayu",
    name: "Art Melayu",
    description:
      "Hijau dan kuning songket, kelembutan adat Melayu yang mewah.",
    primaryColor: "#166534",
    accentColor: "#facc15",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "royal",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "songket",
      ornament: "songket",
      colors: {
        primary: "#166534",
        accent: "#facc15",
        background: "#f2f9ee",
        text: "#17331f",
      },
    }),
    sortOrder: 17,
  },
  {
    code: "lampung",
    name: "Art Lampung Tapis",
    description:
      "Pola tapis Lampung dalam terakota dan emas yang penuh detail.",
    primaryColor: "#7c2d12",
    accentColor: "#d4af37",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "full",
      frameStyle: "square",
      fontDisplay: "Fraunces",
      motif: "tapis",
      ornament: "tapis",
      colors: {
        primary: "#7c2d12",
        accent: "#d4af37",
        background: "#faf1e6",
        text: "#33200f",
      },
    }),
    sortOrder: 18,
  },
  {
    code: "sunda",
    name: "Art Sunda Maroon",
    description:
      "Marun lembut dengan kawung dan sentuhan floral, Sunda yang romantis.",
    primaryColor: "#881337",
    accentColor: "#c9a24b",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "floral",
      coverStyle: "split",
      frameStyle: "arch",
      fontDisplay: "Cormorant Garamond",
      motif: "kawung",
      ornament: "kawung",
      colors: {
        primary: "#881337",
        accent: "#c9a24b",
        background: "#fdf2f4",
        text: "#3a1a26",
      },
    }),
    sortOrder: 19,
  },
  {
    code: "bugis",
    name: "Art Bugis",
    description:
      "Merah dan emas dengan songket Bugis, simbol kehormatan dan kemegahan.",
    primaryColor: "#991b1b",
    accentColor: "#d4af37",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "royal",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Cinzel",
      motif: "songket",
      ornament: "songket",
      colors: {
        primary: "#991b1b",
        accent: "#d4af37",
        background: "#fbf3e4",
        text: "#3a1d1d",
      },
    }),
    sortOrder: 20,
  },
  {
    code: "aceh",
    name: "Art Aceh",
    description:
      "Hijau tua dan emas dengan motif pintu Aceh, kental nuansa serambi Mekah.",
    primaryColor: "#14532d",
    accentColor: "#d4af37",
    category: "pernikahan",
    isPremium: true,
    source: "manual",
    config: theme({
      layout: "classic",
      coverStyle: "framed",
      frameStyle: "arch",
      fontDisplay: "Fraunces",
      motif: "pintu-aceh",
      ornament: "pintu-aceh",
      colors: {
        primary: "#14532d",
        accent: "#d4af37",
        background: "#f0f7ee",
        text: "#173322",
      },
    }),
    sortOrder: 21,
  },
];

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

  console.log("Menyiapkan template awal & tema adat...");
  const existingTemplates = await db
    .select({
      id: templates.id,
      code: templates.code,
      name: templates.name,
      config: templates.config,
    })
    .from(templates);
  const existingCodes = new Set(existingTemplates.map((row) => row.code));
  const missingTemplates = SEED_TEMPLATES.filter(
    (template) => !existingCodes.has(template.code),
  );
  if (missingTemplates.length > 0) {
    await db.insert(templates).values(missingTemplates);
    console.log(`  ${missingTemplates.length} template ditambahkan.`);
  }

  // Migrasi satu kali untuk tema Jawa Hitam lama -> Art Jawa Hitam
  // (dark ceremonial). Setelah nama/config berubah, blok ini tidak berjalan lagi.
  const ceremonial = SEED_TEMPLATES.find(
    (template) => template.code === "jawa-hitam",
  );
  const ceremonialRow = existingTemplates.find(
    (row) => row.code === "jawa-hitam",
  );
  const ceremonialConfig = ceremonialRow?.config as TemplateConfig | null;
  const refineCeremonial =
    Boolean(ceremonial && ceremonialRow) &&
    (ceremonialRow?.name !== ceremonial?.name ||
      ceremonialConfig?.coverStyle !== ceremonial?.config.coverStyle ||
      ceremonialConfig?.fontScript !== ceremonial?.config.fontScript);
  if (ceremonial && ceremonialRow && refineCeremonial) {
    await db
      .update(templates)
      .set({
        name: ceremonial.name,
        description: ceremonial.description,
        primaryColor: ceremonial.primaryColor,
        accentColor: ceremonial.accentColor,
        config: ceremonial.config,
      })
      .where(eq(templates.id, ceremonialRow.id));
    console.log("  Tema Art Jawa Hitam diselaraskan dengan gaya ceremonial terbaru.");
  }

  console.log(`  Total template tersedia: ${existingTemplates.length + missingTemplates.length}.`);

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
