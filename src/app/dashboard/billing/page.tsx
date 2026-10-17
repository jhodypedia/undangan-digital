import Link from "next/link";
import { Check, Crown, FileText } from "lucide-react";

import { cancelTransaction } from "@/app/dashboard/billing/actions";
import { UpgradeForm } from "@/app/dashboard/billing/upgrade-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEffectiveRole, requireUser } from "@/lib/auth";
import { SITE_SETTINGS_KEYS, TRANSACTION_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getAccountLimits } from "@/lib/limits";
import {
  getSettingsMap,
  listActivePlans,
  listUserTransactions,
} from "@/lib/queries";
import { formatDateTimeWIB } from "@/lib/time";

export const metadata = { title: "Langganan" };

export default async function BillingPage() {
  const user = await requireUser();
  const [plans, transactions, settings, limits] = await Promise.all([
    listActivePlans(),
    listUserTransactions(user.id),
    getSettingsMap(),
    getAccountLimits(user),
  ]);

  const role = getEffectiveRole(user);
  const premiumPlans = plans.filter((plan) => plan.code.startsWith("premium"));
  const hasPending = transactions.some(
    ({ transaction }) => transaction.status === "pending",
  );

  return (
    <div>
      <PageHeader
        title="Langganan & pembayaran"
        description="Kelola paket dan lihat riwayat transaksi Anda."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Crown className="size-4 text-accent" /> Paket saat ini
            </CardTitle>
            <CardDescription>{limits.planName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={role === "free" ? "secondary" : "default"}>
                {role === "free" ? "Gratis" : "Premium"}
              </Badge>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Batas undangan</span>
              <span>{limits.maxInvitations}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Batas tamu</span>
              <span>{limits.maxGuests}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted-foreground">Batas galeri</span>
              <span>{limits.maxGallery} foto</span>
            </p>
            {user.premiumUntil ? (
              <p className="flex justify-between">
                <span className="text-muted-foreground">Aktif hingga</span>
                <span>{formatDateTimeWIB(user.premiumUntil)}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>

        {premiumPlans.map((plan) => (
          <Card key={plan.id} className="flex flex-col shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="pt-2 font-display text-3xl">
                {formatCurrency(plan.price)}
                <span className="text-sm font-normal text-muted-foreground">
                  {plan.durationDays >= 365 ? " / tahun" : " / bulan"}
                </span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <UpgradeForm
                  planCode={plan.code}
                  label={
                    hasPending ? "Menunggu verifikasi" : `Pilih ${plan.name}`
                  }
                  disabled={hasPending}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-none">
        <CardHeader>
          <CardTitle className="font-display text-lg">Instruksi pembayaran</CardTitle>
          <CardDescription>
            Transfer ke rekening berikut, lalu admin akan memverifikasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Bank</p>
            <p className="font-medium">
              {settings[SITE_SETTINGS_KEYS.bankName] ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Atas nama</p>
            <p className="font-medium">
              {settings[SITE_SETTINGS_KEYS.bankAccountName] ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Nomor rekening</p>
            <p className="font-medium">
              {settings[SITE_SETTINGS_KEYS.bankAccountNumber] ?? "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-none">
        <CardHeader>
          <CardTitle className="font-display text-lg">Riwayat transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(({ transaction, planName }) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.reference}
                      </TableCell>
                      <TableCell>{planName ?? transaction.planCode}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "paid" ? "default" : "secondary"
                          }
                        >
                          {TRANSACTION_STATUS_LABELS[transaction.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                        {formatDateTimeWIB(transaction.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/invoice/${transaction.reference}`}
                              target="_blank"
                            >
                              <FileText className="size-3.5" /> Invoice
                            </Link>
                          </Button>
                          {transaction.status === "pending" ? (
                            <DeleteButton
                              action={cancelTransaction}
                              hidden={{ id: transaction.id }}
                              label="Batalkan"
                              confirmText="Batalkan transaksi ini?"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
