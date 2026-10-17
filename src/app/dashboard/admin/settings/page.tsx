import { SettingsEditor } from "@/app/dashboard/admin/settings/settings-editor";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Pengaturan situs" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Pengaturan situs"
        description="Semua konfigurasi website dapat diubah dari sini tanpa menyentuh kode."
      />
      <SettingsEditor values={settings} />
    </div>
  );
}
