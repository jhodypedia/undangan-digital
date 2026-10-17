"use client";

import { useState } from "react";
import {
  CheckCheck,
  Copy,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

import {
  deleteGuestsBulk,
  deleteGuest,
  markGuestSent,
} from "@/app/dashboard/guests/actions";
import { DeleteButton } from "@/components/forms/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GUEST_CATEGORY_LABELS,
  type GuestCategory,
} from "@/lib/constants";
import { formatDateTimeWIB } from "@/lib/time";

export type GuestRow = {
  id: number;
  name: string;
  phone: string | null;
  category: GuestCategory;
  code: string;
  isSent: boolean;
  openedAt: Date | null;
  visitCount: number;
  invitationId: number;
  invitationTitle: string;
  invitationSlug: string;
  createdAt: Date;
};

function BulkDeleteButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      disabled={pending || count === 0}
    >
      Hapus ({count})
    </Button>
  );
}

export function GuestsTable({ rows }: { rows: GuestRow[] }) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const copyLink = async (slug: string, code: string) => {
    const url = `${window.location.origin}/u/${slug}?to=${code}`;
    await navigator.clipboard.writeText(url);
    toast.success("Tautan tamu disalin.");
  };

  const waLink = (phone: string | null, name: string, slug: string, code: string) => {
    const number = (phone ?? "").replace(/[^0-9]/g, "").replace(/^0/, "62");
    const url = `${window.location.origin}/u/${slug}?to=${code}`;
    const text = encodeURIComponent(
      `Halo ${name}, kami mengundang Anda untuk hadir. Berikut undangan kami: ${url}`,
    );
    return `https://wa.me/${number}?text=${text}`;
  };

  return (
    <form action={deleteGuestsBulk} className="space-y-4">
      {selected.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {selected.length} dipilih dari {rows.length} tamu.
        </p>
        <BulkDeleteButton count={selected.length} />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={allSelected}
                  onChange={(event) =>
                    setSelected(event.target.checked ? rows.map((r) => r.id) : [])
                  }
                />
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Undangan</TableHead>
              <TableHead className="hidden lg:table-cell">Kategori</TableHead>
              <TableHead className="hidden xl:table-cell">Dibuka</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={selected.includes(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                </TableCell>
                <TableCell>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.phone ?? "-"}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {row.invitationTitle}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">
                    {GUEST_CATEGORY_LABELS[row.category]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                  {row.openedAt
                    ? `${formatDateTimeWIB(row.openedAt)} · ${row.visitCount}x`
                    : "Belum dibuka"}
                </TableCell>
                <TableCell>
                  {row.isSent ? (
                    <Badge variant="secondary">Terkirim</Badge>
                  ) : (
                    <Badge variant="outline">Belum</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyLink(row.invitationSlug, row.code)}
                      title="Salin tautan"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-sm"
                      title="Kirim WhatsApp"
                    >
                      <a
                        href={waLink(row.phone, row.name, row.invitationSlug, row.code)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-3.5" />
                      </a>
                    </Button>
                    <form action={markGuestSent}>
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        type="hidden"
                        name="invitationId"
                        value={row.invitationId}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        title="Tandai terkirim"
                      >
                        <CheckCheck className="size-3.5" />
                      </Button>
                    </form>
                    <DeleteButton
                      action={deleteGuest}
                      hidden={{ id: row.id }}
                      label=""
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </form>
  );
}
