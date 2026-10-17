import {
  AdminUsersTable,
  type AdminUserRow,
} from "@/app/dashboard/admin/users/admin-users-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireAdmin } from "@/lib/auth";
import { listUsersWithCounts } from "@/lib/queries";

export const metadata = { title: "Kelola pengguna" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const rows = await listUsersWithCounts();

  const mapped: AdminUserRow[] = rows.map(({ user, invitationCount, transactionCount }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    premiumUntil: user.premiumUntil,
    invitationCount: Number(invitationCount),
    transactionCount: Number(transactionCount),
    createdAt: user.createdAt,
    isSelf: user.id === admin.id,
  }));

  return (
    <div>
      <PageHeader
        title="Pengguna"
        description="Atur role, status, dan langganan pengguna."
      />
      <AdminUsersTable rows={mapped} />
    </div>
  );
}
