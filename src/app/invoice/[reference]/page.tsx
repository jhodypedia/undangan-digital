import { notFound } from "next/navigation";

import { InvoiceActions } from "@/app/invoice/[reference]/invoice-actions";
import { getEffectiveRole, requireUser } from "@/lib/auth";
import { SITE_SETTINGS_KEYS, TRANSACTION_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getSettingsMap, getTransactionByReference } from "@/lib/queries";
import { formatDateID, formatDateTimeWIB } from "@/lib/time";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-400",
  pending: "bg-amber-500/12 text-amber-700 ring-amber-500/30 dark:text-amber-400",
  failed: "bg-rose-500/12 text-rose-700 ring-rose-500/30 dark:text-rose-400",
  expired: "bg-slate-500/12 text-slate-700 ring-slate-500/30 dark:text-slate-300",
  refunded: "bg-sky-500/12 text-sky-700 ring-sky-500/30 dark:text-sky-400",
};

const WATERMARK: Record<string, string> = {
  paid: "LUNAS",
  pending: "BELUM DIBAYAR",
  failed: "GAGAL",
  expired: "KEDALUWARSA",
  refunded: "DIKEMBALIKAN",
};

export async function generateMetadata(
  props: PageProps<"/invoice/[reference]">,
) {
  const { reference } = await props.params;
  return { title: `Invoice ${reference}` };
}

export default async function InvoicePage(
  props: PageProps<"/invoice/[reference]">,
) {
  const user = await requireUser();
  const { reference } = await props.params;
  const row = await getTransactionByReference(reference);
  if (!row) notFound();

  const { transaction, plan, user: owner } = row;
  const isAdmin = getEffectiveRole(user) === "admin";
  if (transaction.userId !== user.id && !isAdmin) notFound();

  const settings = await getSettingsMap();
  const siteName = settings[SITE_SETTINGS_KEYS.siteName] ?? "UndanganKita";
  const logoUrl = settings[SITE_SETTINGS_KEYS.logoUrl];
  const statusKey = transaction.status;
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.pending;
  const watermark = WATERMARK[statusKey] ?? "INVOICE";
  const durationLabel = plan
    ? plan.durationDays >= 365
      ? "12 bulan"
      : `${plan.durationDays} hari`
    : "-";

  const backHref =
    isAdmin && transaction.userId !== user.id
      ? "/dashboard/admin/transactions"
      : "/dashboard/billing";

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <InvoiceActions backHref={backHref} reference={transaction.reference} />

      <article className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-background shadow-xl ring-1 ring-foreground/10 print:max-w-none print:rounded-none print:shadow-none print:ring-0">
        <div className="h-2 w-full bg-gradient-to-r from-accent via-accent/60 to-transparent" />

        <div className="relative p-7 sm:p-10">
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rotate-[-24deg] font-display text-6xl font-black tracking-[0.3em] text-foreground/[0.04] sm:text-8xl print:text-foreground/[0.06]">
              {watermark}
            </span>
          </span>

          <header className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="size-12 rounded-xl object-cover ring-1 ring-foreground/10"
                />
              ) : (
                <span className="grid size-12 place-items-center rounded-xl bg-accent/15 font-display text-xl font-bold text-accent">
                  {siteName.charAt(0)}
                </span>
              )}
              <div>
                <p className="font-display text-lg font-semibold">{siteName}</p>
                <p className="text-xs text-muted-foreground">
                  {settings[SITE_SETTINGS_KEYS.tagline] ?? "Undangan digital"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-semibold tracking-tight">
                INVOICE
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {transaction.reference}
              </p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusStyle}`}
              >
                {TRANSACTION_STATUS_LABELS[statusKey]}
              </span>
            </div>
          </header>

          <div className="relative mt-8 grid gap-6 sm:grid-cols-3">
            <div className="space-y-1 text-sm">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Ditagih kepada
              </p>
              <p className="font-medium">{owner?.name ?? "-"}</p>
              <p className="text-muted-foreground">{owner?.email ?? "-"}</p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Diterbitkan
              </p>
              <p>{formatDateID(transaction.createdAt)}</p>
              {transaction.expiresAt ? (
                <>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Jatuh tempo
                  </p>
                  <p>{formatDateTimeWIB(transaction.expiresAt)}</p>
                </>
              ) : null}
            </div>
            <div className="space-y-1 text-sm sm:text-right">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Metode
              </p>
              <p className="capitalize">
                {(transaction.method ?? "transfer_bank").replace(/_/g, " ")}
              </p>
              {transaction.paidAt ? (
                <>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Dibayar
                  </p>
                  <p>{formatDateTimeWIB(transaction.paidAt)}</p>
                </>
              ) : null}
            </div>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Deskripsi</th>
                  <th className="px-4 py-3 text-center font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Harga</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-foreground/10">
                  <td className="px-4 py-4">
                    <p className="font-medium">
                      {plan?.name ?? transaction.planCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Langganan {durationLabel}
                      {plan?.description ? ` · ${plan.description}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">1</td>
                  <td className="px-4 py-4 text-right">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="relative mt-6 grid gap-6 sm:grid-cols-[1fr_auto]">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
                <p className="font-medium">Instruksi pembayaran</p>
                {statusKey === "pending" ? (
                  <dl className="mt-2 grid gap-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Bank</dt>
                      <dd className="font-medium">
                        {settings[SITE_SETTINGS_KEYS.bankName] || "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Atas nama</dt>
                      <dd className="font-medium">
                        {settings[SITE_SETTINGS_KEYS.bankAccountName] || "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Nomor rekening</dt>
                      <dd className="font-mono font-medium">
                        {settings[SITE_SETTINGS_KEYS.bankAccountNumber] || "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Nominal</dt>
                      <dd className="font-semibold text-accent">
                        {formatCurrency(transaction.amount)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {statusKey === "paid"
                      ? `Terima kasih, pembayaran telah diterima pada ${formatDateTimeWIB(transaction.paidAt)}.`
                      : "Hubungi admin bila Anda merasa status ini keliru."}
                  </p>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Cantumkan nomor invoice{" "}
                <span className="font-mono text-foreground">
                  {transaction.reference}
                </span>{" "}
                pada berita transfer. Verifikasi manual maksimal 1×24 jam kerja.
              </p>
            </div>

            <dl className="w-full space-y-2 self-start rounded-xl bg-muted/40 p-4 text-sm sm:w-64">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCurrency(transaction.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Diskon</dt>
                <dd>{formatCurrency(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pajak</dt>
                <dd>{formatCurrency(0)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-foreground/10 pt-3 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="font-display font-semibold text-accent">
                  {formatCurrency(transaction.amount)}
                </dd>
              </div>
            </dl>
          </div>

          {transaction.notes ? (
            <p className="relative mt-6 rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Catatan: </span>
              {transaction.notes}
            </p>
          ) : null}

          <footer className="relative mt-10 border-t border-foreground/10 pt-5 text-xs text-muted-foreground">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">{siteName}</p>
                {settings[SITE_SETTINGS_KEYS.contactAddress] ? (
                  <p>{settings[SITE_SETTINGS_KEYS.contactAddress]}</p>
                ) : null}
              </div>
              <div className="space-y-0.5 sm:text-right">
                {settings[SITE_SETTINGS_KEYS.contactEmail] ? (
                  <p>{settings[SITE_SETTINGS_KEYS.contactEmail]}</p>
                ) : null}
                {settings[SITE_SETTINGS_KEYS.contactWhatsapp] ? (
                  <p>{settings[SITE_SETTINGS_KEYS.contactWhatsapp]}</p>
                ) : null}
                {settings[SITE_SETTINGS_KEYS.appUrl] ? (
                  <p>{settings[SITE_SETTINGS_KEYS.appUrl]}</p>
                ) : null}
              </div>
            </div>
            <p className="mt-4 text-center text-[11px]">
              Invoice ini dibuat otomatis oleh sistem {siteName} dan sah tanpa
              tanda tangan.
            </p>
          </footer>
        </div>
      </article>
    </main>
  );
}
