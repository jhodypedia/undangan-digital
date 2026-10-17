import { AddGuestDialog } from "@/app/dashboard/guests/add-guest-dialog";
import { GuestsTable, type GuestRow } from "@/app/dashboard/guests/guests-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { requireUser } from "@/lib/auth";
import { getAccountLimits } from "@/lib/limits";
import { listGuests, listInvitationsWithCounts } from "@/lib/queries";

export const metadata = { title: "Tamu" };

export default async function GuestsPage() {
  const user = await requireUser();
  const [guestRows, invitations, limits] = await Promise.all([
    listGuests(user.id),
    listInvitationsWithCounts(user.id),
    getAccountLimits(user),
  ]);

  const rows: GuestRow[] = guestRows.map(({ guest, invitationTitle, invitationSlug }) => ({
    id: guest.id,
    name: guest.name,
    phone: guest.phone,
    category: guest.category,
    code: guest.code,
    isSent: guest.isSent,
    openedAt: guest.openedAt,
    visitCount: guest.visitCount,
    invitationId: guest.invitationId,
    invitationTitle,
    invitationSlug,
    createdAt: guest.createdAt,
  }));

  return (
    <div>
      <PageHeader
        title="Tamu"
        description={`Kelola daftar tamu dan kirim undangan pribadi. Batas paket ${limits.planName}: ${limits.maxGuests} tamu.`}
      >
        <AddGuestDialog
          invitations={invitations.map((item) => ({
            id: item.id,
            title: item.title,
          }))}
        />
      </PageHeader>

      {rows.length === 0 ? (
        <Empty className="border border-dashed py-16">
          <EmptyHeader>
            <EmptyTitle>Belum ada tamu</EmptyTitle>
            <EmptyDescription>
              Tambahkan tamu untuk membuat tautan undangan pribadi dan daftar
              konfirmasi kehadiran.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <GuestsTable rows={rows} />
      )}
    </div>
  );
}
