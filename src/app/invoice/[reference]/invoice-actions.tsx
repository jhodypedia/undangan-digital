"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function InvoiceActions({
  backHref,
  reference,
}: {
  backHref: string;
  reference: string;
}) {
  return (
    <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 print:hidden">
      <Button asChild variant="ghost" size="sm">
        <Link href={backHref}>
          <ArrowLeft className="size-4" /> Kembali
        </Link>
      </Button>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard
              .writeText(reference)
              .then(() => toast.success("Nomor invoice disalin."))
              .catch(() => toast.error("Gagal menyalin."));
          }}
        >
          <Copy className="size-4" /> Salin nomor
        </Button>
        <Button type="button" size="sm" onClick={() => window.print()}>
          <Printer className="size-4" /> Cetak / Simpan PDF
        </Button>
      </div>
    </div>
  );
}
