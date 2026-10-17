import Link from "next/link";
import { FileText } from "lucide-react";

import { updateTransaction } from "@/app/dashboard/admin/actions";
import { ConfirmButton } from "@/components/forms/confirm-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TRANSACTION_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { listAllTransactions } from "@/lib/queries";
import { formatDateTimeWIB } from "@/lib/time";

export const metadata = { title: "Transaksi" };

export default async function AdminTransactionsPage() {
  const rows = await listAllTransactions();

  return (
    <div>
      <PageHeader
        title="Transaksi"
        description="Verifikasi pembayaran dan kelola status langganan."
      />

      <Card className="shadow-none">
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ transaction, userName, userEmail, planName }) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.reference}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{userName ?? "-"}</p>
                        <p className="text-xs text-muted-foreground">
                          {userEmail ?? "-"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {planName ?? transaction.planCode}
                      </TableCell>
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
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/invoice/${transaction.reference}`}
                              target="_blank"
                            >
                              <FileText className="size-3.5" /> Invoice
                            </Link>
                          </Button>
                          {transaction.status !== "paid" ? (
                            <ConfirmButton
                              action={updateTransaction}
                              hidden={{ id: transaction.id, status: "paid" }}
                              label="Tandai lunas"
                              size="sm"
                              title="Tandai transaksi lunas?"
                              description="Status langganan pengguna akan langsung diperbarui."
                              confirmLabel="Ya, tandai lunas"
                            />
                          ) : null}
                          {transaction.status === "pending" ? (
                            <ConfirmButton
                              action={updateTransaction}
                              hidden={{ id: transaction.id, status: "failed" }}
                              label="Tolak"
                              variant="outline"
                              size="sm"
                              tone="warning"
                              title="Tolak transaksi ini?"
                              description="Transaksi akan berstatus gagal."
                              confirmLabel="Ya, tolak"
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
