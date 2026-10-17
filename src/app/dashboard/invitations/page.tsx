import Link from "next/link";
import { CalendarDays, Eye, Pencil, Users } from "lucide-react";

import {
  deleteInvitation,
  togglePublish,
} from "@/app/dashboard/invitations/actions";
import { CreateInvitationDialog } from "@/app/dashboard/invitations/create-invitation-dialog";
import { DeleteButton } from "@/components/forms/delete-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/constants";
import { getAccountLimits } from "@/lib/limits";
import { listInvitationsWithCounts } from "@/lib/queries";
import { formatDateTimeWIB } from "@/lib/time";

export const metadata = { title: "Undangan" };

export default async function InvitationsPage() {
  const user = await requireUser();
  const [invitations, limits] = await Promise.all([
    listInvitationsWithCounts(user.id),
    getAccountLimits(user),
  ]);
  const atLimit = invitations.length >= limits.maxInvitations;

  return (
    <div>
      <PageHeader
        title="Undangan"
        description={`Paket ${limits.planName} • ${invitations.length}/${limits.maxInvitations} undangan terpakai.`}
      >
        <CreateInvitationDialog disabled={atLimit} />
      </PageHeader>

      {invitations.length === 0 ? (
        <Empty className="border border-dashed py-16">
          <EmptyHeader>
            <EmptyTitle>Belum ada undangan</EmptyTitle>
            <EmptyDescription>
              Buat undangan pertama Anda dan bagikan melalui tautan pribadi.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="flex flex-col shadow-none">
              <CardContent className="flex flex-1 flex-col gap-4 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg">
                      {invitation.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      /u/{invitation.slug}
                    </p>
                  </div>
                  <Badge
                    variant={invitation.isPublished ? "default" : "secondary"}
                  >
                    {invitation.isPublished ? "Publik" : "Draf"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[invitation.category]}
                  </Badge>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {formatDateTimeWIB(invitation.eventDate)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
                  <div>
                    <p className="font-display text-lg">{invitation.guestCount}</p>
                    <p className="text-[11px] text-muted-foreground">tamu</p>
                  </div>
                  <div>
                    <p className="font-display text-lg">{invitation.rsvpCount}</p>
                    <p className="text-[11px] text-muted-foreground">rsvp</p>
                  </div>
                  <div>
                    <p className="font-display text-lg">{invitation.wishCount}</p>
                    <p className="text-[11px] text-muted-foreground">ucapan</p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/invitations/${invitation.id}`}>
                      <Pencil className="size-3.5" /> Kelola
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/u/${invitation.slug}`} target="_blank">
                      <Eye className="size-3.5" /> Lihat
                    </Link>
                  </Button>
                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={invitation.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      {invitation.isPublished ? "Jadikan draf" : "Publikasikan"}
                    </Button>
                  </form>
                  <DeleteButton
                    action={deleteInvitation}
                    hidden={{ id: invitation.id }}
                    label=""
                    confirmText={`Hapus undangan "${invitation.title}" beserta semua datanya?`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        <Users className="mr-1 inline size-3.5" />
        Batas tamu paket {limits.planName}: {limits.maxGuests} • galeri:{" "}
        {limits.maxGallery} foto.
      </p>
    </div>
  );
}
