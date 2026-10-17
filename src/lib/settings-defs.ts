import { SITE_SETTINGS_KEYS, USER_ROLES } from "@/lib/constants";

export type SettingFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "color"
  | "email"
  | "url"
  | "select"
  | "password";

export type SettingDef = {
  key: string;
  label: string;
  group: SettingGroup;
  type: SettingFieldType;
  default: string;
  help?: string;
  options?: { value: string; label: string }[];
  secret?: boolean;
};

export const SETTING_GROUPS = [
  "identitas",
  "tampilan",
  "kontak",
  "sosial",
  "pendaftaran",
  "pembayaran",
  "peta",
  "ai",
] as const;
export type SettingGroup = (typeof SETTING_GROUPS)[number];

export const GROUP_LABELS: Record<SettingGroup, string> = {
  identitas: "Identitas situs",
  tampilan: "Tampilan",
  kontak: "Kontak",
  sosial: "Media sosial",
  pendaftaran: "Pendaftaran & sistem",
  pembayaran: "Pembayaran",
  peta: "Peta & lokasi",
  ai: "AI Template Generator",
};

export const SETTINGS_DEFS: SettingDef[] = [
  {
    key: SITE_SETTINGS_KEYS.siteName,
    label: "Nama situs",
    group: "identitas",
    type: "text",
    default: "UndanganKita",
  },
  {
    key: SITE_SETTINGS_KEYS.tagline,
    label: "Tagline",
    group: "identitas",
    type: "text",
    default: "Undangan digital yang berkesan, dalam hitungan menit.",
  },
  {
    key: SITE_SETTINGS_KEYS.siteDescription,
    label: "Deskripsi situs",
    group: "identitas",
    type: "textarea",
    default:
      "Buat undangan digital pernikahan dan acara dalam hitungan menit.",
  },
  {
    key: SITE_SETTINGS_KEYS.appUrl,
    label: "URL aplikasi",
    group: "identitas",
    type: "url",
    default: "https://undangan.hgitopup.web.id",
    help: "Dipakai untuk membentuk tautan undangan yang dibagikan.",
  },
  {
    key: SITE_SETTINGS_KEYS.logoUrl,
    label: "URL logo",
    group: "identitas",
    type: "url",
    default: "",
    help: "Kosongkan untuk memakai inisial nama situs.",
  },
  {
    key: SITE_SETTINGS_KEYS.faviconUrl,
    label: "URL favicon",
    group: "identitas",
    type: "url",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.footerText,
    label: "Teks footer",
    group: "identitas",
    type: "text",
    default: "© UndanganKita. Dibuat dengan tenang.",
  },
  {
    key: SITE_SETTINGS_KEYS.invitationBrandText,
    label: "Teks brand di undangan",
    group: "identitas",
    type: "text",
    default: "Dibuat dengan UndanganKita",
    help: "Muncul di bagian bawah halaman undangan publik.",
  },
  {
    key: SITE_SETTINGS_KEYS.primaryColor,
    label: "Warna utama",
    group: "tampilan",
    type: "color",
    default: "#0b3d2e",
  },
  {
    key: SITE_SETTINGS_KEYS.accentColor,
    label: "Warna aksen",
    group: "tampilan",
    type: "color",
    default: "#c9a24b",
  },
  {
    key: SITE_SETTINGS_KEYS.announcement,
    label: "Pengumuman dasbor",
    group: "tampilan",
    type: "textarea",
    default: "",
    help: "Kosongkan untuk menyembunyikan pengumuman.",
  },
  {
    key: SITE_SETTINGS_KEYS.watermarkEnabled,
    label: "Tampilkan nama situs di undangan",
    group: "tampilan",
    type: "boolean",
    default: "1",
    help: "Tanda nama situs pada undangan paket Gratis.",
  },
  {
    key: SITE_SETTINGS_KEYS.watermarkText,
    label: "Teks watermark",
    group: "tampilan",
    type: "text",
    default: "UndanganKita",
  },
  {
    key: SITE_SETTINGS_KEYS.uploadMaxMb,
    label: "Ukuran maksimal upload (MB)",
    group: "tampilan",
    type: "number",
    default: "5",
  },
  {
    key: SITE_SETTINGS_KEYS.contactEmail,
    label: "Email kontak",
    group: "kontak",
    type: "email",
    default: "halo@undangan.hgitopup.web.id",
  },
  {
    key: SITE_SETTINGS_KEYS.contactWhatsapp,
    label: "WhatsApp kontak",
    group: "kontak",
    type: "text",
    default: "6281200000000",
  },
  {
    key: SITE_SETTINGS_KEYS.contactAddress,
    label: "Alamat",
    group: "kontak",
    type: "textarea",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.socialInstagram,
    label: "Instagram",
    group: "sosial",
    type: "url",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.socialFacebook,
    label: "Facebook",
    group: "sosial",
    type: "url",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.socialTiktok,
    label: "TikTok",
    group: "sosial",
    type: "url",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.socialYoutube,
    label: "YouTube",
    group: "sosial",
    type: "url",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.registrationOpen,
    label: "Pendaftaran dibuka",
    group: "pendaftaran",
    type: "boolean",
    default: "1",
  },
  {
    key: SITE_SETTINGS_KEYS.maintenanceMode,
    label: "Mode pemeliharaan",
    group: "pendaftaran",
    type: "boolean",
    default: "0",
    help: "Saat aktif, hanya admin yang dapat mengakses situs.",
  },
  {
    key: SITE_SETTINGS_KEYS.defaultRole,
    label: "Role default pengguna baru",
    group: "pendaftaran",
    type: "select",
    default: "free",
    options: USER_ROLES.map((role) => ({ value: role, label: role })),
  },
  {
    key: SITE_SETTINGS_KEYS.timezone,
    label: "Zona waktu",
    group: "pendaftaran",
    type: "text",
    default: "Asia/Jakarta (WIB)",
  },
  {
    key: SITE_SETTINGS_KEYS.bankName,
    label: "Nama bank",
    group: "pembayaran",
    type: "text",
    default: "Bank Mandiri",
  },
  {
    key: SITE_SETTINGS_KEYS.bankAccountName,
    label: "Atas nama",
    group: "pembayaran",
    type: "text",
    default: "PT Undangan Kita Digital",
  },
  {
    key: SITE_SETTINGS_KEYS.bankAccountNumber,
    label: "Nomor rekening",
    group: "pembayaran",
    type: "text",
    default: "",
  },
  {
    key: SITE_SETTINGS_KEYS.aiEnabled,
    label: "Aktifkan generator AI",
    group: "ai",
    type: "boolean",
    default: "0",
  },
  {
    key: SITE_SETTINGS_KEYS.aiProvider,
    label: "Penyedia AI",
    group: "ai",
    type: "select",
    default: "openai",
    options: [
      { value: "openai", label: "OpenAI (kompatibel)" },
      { value: "custom", label: "Kustom / self-hosted" },
      { value: "none", label: "Nonaktif" },
    ],
  },
  {
    key: SITE_SETTINGS_KEYS.aiBaseUrl,
    label: "Base URL API",
    group: "ai",
    type: "url",
    default: "https://api.openai.com/v1",
    help: "Endpoint kompatibel OpenAI, mis. http://localhost:11434/v1.",
  },
  {
    key: SITE_SETTINGS_KEYS.aiApiKey,
    label: "API key",
    group: "ai",
    type: "password",
    default: "",
    secret: true,
  },
  {
    key: SITE_SETTINGS_KEYS.aiModel,
    label: "Model",
    group: "ai",
    type: "text",
    default: "gpt-4o-mini",
  },
  {
    key: SITE_SETTINGS_KEYS.aiImageModel,
    label: "Model gambar AI",
    group: "ai",
    type: "text",
    default: "gpt-image-1",
    help: "Model pembuat gambar, mis. gpt-image-1 atau dall-e-3.",
  },
  {
    key: SITE_SETTINGS_KEYS.mapsApiKey,
    label: "Google Maps API key",
    group: "peta",
    type: "password",
    default: "",
    secret: true,
    help: "Opsional. Isi API key (Maps Embed API) untuk peta resmi Google. Kosongkan untuk memakai peta embed gratis tanpa key.",
  },
];

export function settingDefaults(): Record<string, string> {
  return Object.fromEntries(SETTINGS_DEFS.map((def) => [def.key, def.default]));
}

export function getSettingDef(key: string): SettingDef | undefined {
  return SETTINGS_DEFS.find((def) => def.key === key);
}
