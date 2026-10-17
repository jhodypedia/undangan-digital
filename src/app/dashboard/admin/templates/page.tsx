import {
  TemplateGenerator,
  TemplatesManager,
} from "@/app/dashboard/admin/templates/templates-manager";
import { PageHeader } from "@/components/dashboard/page-header";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { listTemplates } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Template" };

export default async function AdminTemplatesPage() {
  const [templates, settings] = await Promise.all([
    listTemplates(),
    getSettings(),
  ]);

  const aiEnabled = settings[SITE_SETTINGS_KEYS.aiEnabled] === "1";
  const provider = settings[SITE_SETTINGS_KEYS.aiProvider] ?? "-";
  const model = settings[SITE_SETTINGS_KEYS.aiModel] ?? "-";

  return (
    <div>
      <PageHeader
        title="Template & generator"
        description={
          aiEnabled
            ? `AI aktif · ${provider} · ${model}. Buat, pratinjau, lalu simpan template.`
            : "AI belum aktif — generator bawaan dipakai. Atur API di Pengaturan → AI."
        }
      />
      <div className="space-y-6">
        <TemplateGenerator />
        <TemplatesManager templates={templates} />
      </div>
    </div>
  );
}
