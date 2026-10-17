import { MessageSquareHeart } from "lucide-react";

import { deleteWish, toggleWish } from "@/app/dashboard/wishes/actions";
import { DeleteButton } from "@/components/forms/delete-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { requireUser } from "@/lib/auth";
import { listWishes } from "@/lib/queries";
import { formatDateTimeWIB } from "@/lib/time";

export const metadata = { title: "Ucapan" };

export default async function WishesPage() {
  const user = await requireUser();
  const rows = await listWishes(user.id);

  return (
    <div>
      <PageHeader
        title="Buku ucapan"
        description="Kumpulan doa dan pesan dari tamu. Sembunyikan yang tidak ingin ditampilkan."
      />

      {rows.length === 0 ? (
        <Empty className="border border-dashed py-16">
          <EmptyHeader>
            <EmptyTitle>Belum ada ucapan</EmptyTitle>
            <EmptyDescription>
              Ucapan dari tamu akan tampil di sini dan pada undangan publik.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ wish, invitationTitle }) => (
            <Card key={wish.id} className="shadow-none">
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquareHeart className="size-4 text-accent" />
                    <p className="font-medium">{wish.name}</p>
                  </div>
                  <Badge variant={wish.isApproved ? "default" : "secondary"}>
                    {wish.isApproved ? "Tampil" : "Disembunyikan"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{wish.message}</p>
                <p className="text-xs text-muted-foreground">
                  {invitationTitle} • {formatDateTimeWIB(wish.createdAt)}
                </p>
                <div className="flex items-center gap-2">
                  <form action={toggleWish}>
                    <input type="hidden" name="id" value={wish.id} />
                    <input
                      type="hidden"
                      name="approved"
                      value={String(wish.isApproved)}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {wish.isApproved ? "Sembunyikan" : "Tampilkan"}
                    </Button>
                  </form>
                  <DeleteButton action={deleteWish} hidden={{ id: wish.id }} label="" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
