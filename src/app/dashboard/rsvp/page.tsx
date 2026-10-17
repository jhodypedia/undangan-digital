import { deleteRsvp } from "@/app/dashboard/rsvp/actions";
import { DeleteButton } from "@/components/forms/delete-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { ATTENDANCE_LABELS } from "@/lib/constants";
import { listRsvps } from "@/lib/queries";
import { formatDateTimeWIB } from "@/lib/time";
import { CalendarCheck, CalendarX, HelpCircle } from "lucide-react";

export const metadata = { title: "RSVP" };

export default async function RsvpPage() {
  const user = await requireUser();
  const rows = await listRsvps(user.id);

  const hadir = rows.filter(({ rsvp }) => rsvp.attendance === "hadir");
  const ragu = rows.filter(({ rsvp }) => rsvp.attendance === "ragu");
  const tidak = rows.filter(({ rsvp }) => rsvp.attendance === "tidak_hadir");
  const totalSeats = hadir.reduce((sum, { rsvp }) => sum + rsvp.totalGuests, 0);

  return (
    <div>
      <PageHeader
        title="Konfirmasi kehadiran"
        description="Pantau RSVP dari seluruh undangan Anda. Waktu dicatat dalam WIB."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Hadir" value={hadir.length} icon={CalendarCheck} accent />
        <StatCard index={1} label="Total kursi" value={totalSeats} />
        <StatCard index={2} label="Masih ragu" value={ragu.length} icon={HelpCircle} />
        <StatCard index={3} label="Tidak hadir" value={tidak.length} icon={CalendarX} />
      </div>

      {rows.length === 0 ? (
        <Empty className="border border-dashed py-16">
          <EmptyHeader>
            <EmptyTitle>Belum ada konfirmasi</EmptyTitle>
            <EmptyDescription>
              Konfirmasi dari tamu akan muncul di sini setelah undangan
              dibagikan.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Undangan</TableHead>
                    <TableHead>Kehadiran</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="hidden lg:table-cell">Pesan</TableHead>
                    <TableHead className="hidden md:table-cell">Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ rsvp, invitationTitle }) => (
                    <TableRow key={rsvp.id}>
                      <TableCell>
                        <p className="font-medium">{rsvp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rsvp.phone ?? "-"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{invitationTitle}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rsvp.attendance === "hadir"
                              ? "default"
                              : rsvp.attendance === "ragu"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {ATTENDANCE_LABELS[rsvp.attendance]}
                        </Badge>
                      </TableCell>
                      <TableCell>{rsvp.totalGuests} orang</TableCell>
                      <TableCell className="hidden max-w-xs lg:table-cell">
                        <span className="line-clamp-2 text-sm text-muted-foreground">
                          {rsvp.message ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                        {formatDateTimeWIB(rsvp.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton
                          action={deleteRsvp}
                          hidden={{ id: rsvp.id }}
                          label=""
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
