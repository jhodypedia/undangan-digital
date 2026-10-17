import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: LayoutProps<"/dashboard/admin">) {
  await requireAdmin();
  return <>{children}</>;
}
