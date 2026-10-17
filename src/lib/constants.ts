export const USER_ROLES = ["free", "premium", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  free: "Gratis",
  premium: "Premium",
  admin: "Admin",
};

export const INVITATION_CATEGORIES = [
  "pernikahan",
  "tunangan",
  "ulang_tahun",
  "khitanan",
  "aqiqah",
  "wisuda",
  "syukuran",
  "lainnya",
] as const;
export type InvitationCategory = (typeof INVITATION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<InvitationCategory, string> = {
  pernikahan: "Pernikahan",
  tunangan: "Tunangan",
  ulang_tahun: "Ulang Tahun",
  khitanan: "Khitanan",
  aqiqah: "Aqiqah",
  wisuda: "Wisuda",
  syukuran: "Syukuran",
  lainnya: "Lainnya",
};

export const GUEST_CATEGORIES = [
  "keluarga",
  "teman",
  "kolega",
  "tetangga",
  "vip",
  "lainnya",
] as const;
export type GuestCategory = (typeof GUEST_CATEGORIES)[number];

export const GUEST_CATEGORY_LABELS: Record<GuestCategory, string> = {
  keluarga: "Keluarga",
  teman: "Teman",
  kolega: "Kolega",
  tetangga: "Tetangga",
  vip: "VIP",
  lainnya: "Lainnya",
};

export const ATTENDANCE_OPTIONS = ["hadir", "ragu", "tidak_hadir"] as const;
export type Attendance = (typeof ATTENDANCE_OPTIONS)[number];

export const ATTENDANCE_LABELS: Record<Attendance, string> = {
  hadir: "Hadir",
  ragu: "Masih Ragu",
  tidak_hadir: "Tidak Hadir",
};

export const GIFT_TYPES = ["bank", "ewallet", "address"] as const;
export type GiftType = (typeof GIFT_TYPES)[number];

export const GIFT_TYPE_LABELS: Record<GiftType, string> = {
  bank: "Transfer Bank",
  ewallet: "E-Wallet",
  address: "Kirim Hadiah",
};

export const TRANSACTION_STATUSES = [
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Berhasil",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
};

export const PLAN_CODES = [
  "free",
  "premium_monthly",
  "premium_yearly",
] as const;
export type PlanCode = (typeof PLAN_CODES)[number];

export const SITE_SETTINGS_KEYS = {
  siteName: "site_name",
  tagline: "tagline",
  siteDescription: "site_description",
  appUrl: "app_url",
  logoUrl: "logo_url",
  faviconUrl: "favicon_url",
  timezone: "timezone",
  currency: "currency",
  primaryColor: "primary_color",
  accentColor: "accent_color",
  footerText: "footer_text",
  announcement: "announcement",
  watermarkEnabled: "watermark_enabled",
  watermarkText: "watermark_text",
  invitationBrandText: "invitation_brand_text",
  uploadMaxMb: "upload_max_mb",
  maintenanceMode: "maintenance_mode",
  registrationOpen: "registration_open",
  defaultRole: "default_role",
  contactEmail: "contact_email",
  contactWhatsapp: "contact_whatsapp",
  contactAddress: "contact_address",
  socialInstagram: "social_instagram",
  socialFacebook: "social_facebook",
  socialTiktok: "social_tiktok",
  socialYoutube: "social_youtube",
  bankName: "bank_name",
  bankAccountName: "bank_account_name",
  bankAccountNumber: "bank_account_number",
  aiEnabled: "ai_enabled",
  aiProvider: "ai_provider",
  aiBaseUrl: "ai_base_url",
  aiApiKey: "ai_api_key",
  aiModel: "ai_model",
  aiImageModel: "ai_image_model",
  mapsApiKey: "maps_api_key",
} as const;

export type SiteSettingKey =
  (typeof SITE_SETTINGS_KEYS)[keyof typeof SITE_SETTINGS_KEYS];

