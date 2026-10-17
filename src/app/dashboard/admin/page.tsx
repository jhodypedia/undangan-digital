import { Activity, Mail, Receipt, Users } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminSummary, listActivity, listAllTransactions } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeWIB } from "@/lib/time";

export const metadata = { title: "Ikhtisar admin" };

export default async function AdminOverviewPage() {
  const [summary, activity, transactions] = await Promise.all([
    getAdminSummary(),
    listActivity(8),
    listAllTransactions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Ikhtisar admin"
        description="Pantau kesehatan platform dan aktivitas terbaru."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Pengguna" value={summary.users} icon={Users} />
        <StatCard
          index={1}
          label="Premium aktif"
          value={summary.premium}
          hint={`${summary.admin} admin`}
          accent
        />
        <StatCard index={2} label="Undangan" value={summary.invitations} icon={Mail} />
        <StatCard
          index={3}
          label="Pendapatan"
          value={formatCurrency(summary.revenue)}
          hint={`${summary.pendingTransactions} menunggu`}
          icon={Receipt}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-lg">Transaksi terbaru</CardTitle>
            <CardDescription>Pembayaran yang masuk ke sistem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.slice(0, 6).map(
              ({ transaction, userName, planName }) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {userName ?? "Pengguna"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {planName ?? transaction.planCode} •{" "}
                      {formatDateTimeWIB(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "paid" ? "default" : "secondary"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Activity className="size-4" /> Aktivitas
            </CardTitle>
            <CardDescription>Jejak aktivitas terbaru pengguna.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.map(({ log, userName }) => (
              <div key={log.id} className="border-b pb-3 last:border-0 last:pb-0">
                <p className="text-sm">
                  <span className="font-medium">{userName ?? "Sistem"}</span>{" "}
                  <span className="text-muted-foreground">
                    {log.description ?? log.action}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTimeWIB(log.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
