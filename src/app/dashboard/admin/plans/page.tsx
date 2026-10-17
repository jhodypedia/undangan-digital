import { PlansManager } from "@/app/dashboard/admin/plans/plans-manager";
import { PageHeader } from "@/components/dashboard/page-header";
import { listAllPlans } from "@/lib/queries";

export const metadata = { title: "Kelola paket" };

export default async function AdminPlansPage() {
  const plans = await listAllPlans();
  return (
    <div>
      <PageHeader
        title="Paket langganan"
        description="Atur harga, durasi, dan batas fitur tiap paket."
      />
      <PlansManager plans={plans} />
    </div>
  );
}
