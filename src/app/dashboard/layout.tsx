import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  const settings = await getSettings();
  const brand = settings[SITE_SETTINGS_KEYS.siteName] ?? "UndanganKita";

  return (
    <DashboardShell
      brand={brand}
      logoUrl={settings[SITE_SETTINGS_KEYS.logoUrl] || null}
      announcement={settings[SITE_SETTINGS_KEYS.announcement] || undefined}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        premiumUntil: user.premiumUntil,
      }}
    >
      {children}
    </DashboardShell>
  );
}
