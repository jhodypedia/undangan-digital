import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Album as AlbumIcon,
  BookHeart,
  CalendarDays,
  Eye,
  Gift,
  Home,
  Images,
  Info,
  Palette,
  Users,
} from "lucide-react";

import { togglePublish } from "@/app/dashboard/invitations/actions";
import {
  AlbumManager,
  EventsManager,
  GalleryManager,
  GiftsManager,
  StoriesManager,
} from "@/app/dashboard/invitations/[id]/content-managers";
import { DesignManager } from "@/app/dashboard/invitations/[id]/design-manager";
import { InvitationInfoForm } from "@/app/dashboard/invitations/[id]/invitation-info-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEffectiveRole, requireUser } from "@/lib/auth";
import { getAccountLimits } from "@/lib/limits";
import { getInvitationDetail } from "@/lib/queries";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

function Count({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-foreground/10 px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
      {value}
    </span>
  );
}

export default async function InvitationEditPage(
  props: PageProps<"/dashboard/invitations/[id]">,
) {
  const user = await requireUser();
  const { id } = await props.params;
  const detail = await getInvitationDetail(Number(id), user.id);
  if (!detail) notFound();

  const limits = await getAccountLimits(user);
  const settings = await getSettings();
  const maxMb = Number(settings[SITE_SETTINGS_KEYS.uploadMaxMb] ?? "5") || 5;
  const role = getEffectiveRole(user);
  const isPremium = role === "premium" || role === "admin";
  const { invitation, events, stories, galleries, gifts, albums } = detail;

  return (
    <div>
      <PageHeader title={invitation.title} description={`/u/${invitation.slug}`}>
        <Badge variant={invitation.isPublished ? "default" : "secondary"}>
          {invitation.isPublished ? "Publik" : "Draf"}
        </Badge>
        <Button asChild variant="outline" size="sm">
          <Link href={`/u/${invitation.slug}`} target="_blank">
            <Eye className="size-3.5" /> Lihat
          </Link>
        </Button>
        <form action={togglePublish}>
          <input type="hidden" name="id" value={invitation.id} />
          <Button type="submit" size="sm">
            {invitation.isPublished ? "Jadikan draf" : "Publikasikan"}
          </Button>
        </form>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">
          <Home className="size-3" /> {invitation.viewCount} dilihat
        </Badge>
        <Badge variant="outline">
          <Users className="size-3" /> Kelola tamu di menu Tamu
        </Badge>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="max-w-full flex-wrap">
          <TabsTrigger value="info">
            <Info /> Info &amp; mempelai
          </TabsTrigger>
          <TabsTrigger value="events">
            <CalendarDays /> Acara
            <Count value={events.length} />
          </TabsTrigger>
          <TabsTrigger value="stories">
            <BookHeart /> Cerita
            <Count value={stories.length} />
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette /> Desain
          </TabsTrigger>
          <TabsTrigger value="gallery">
            <Images /> Galeri
            <Count value={galleries.length} />
          </TabsTrigger>
          <TabsTrigger value="albums">
            <AlbumIcon /> Album
            <Count value={albums.length} />
          </TabsTrigger>
          <TabsTrigger value="gifts">
            <Gift /> Hadiah
            <Count value={gifts.length} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <InvitationInfoForm invitation={invitation} maxMb={maxMb} />
        </TabsContent>
        <TabsContent value="events">
          <EventsManager invitationId={invitation.id} items={events} />
        </TabsContent>
        <TabsContent value="stories">
          <StoriesManager invitationId={invitation.id} items={stories} />
        </TabsContent>
        <TabsContent value="design">
          <DesignManager
            invitation={invitation}
            maxMb={maxMb}
            isPremium={isPremium}
            planName={limits.planName}
          />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryManager
            invitationId={invitation.id}
            items={galleries}
            albums={albums}
            limit={limits.maxGallery}
            maxMb={maxMb}
          />
        </TabsContent>
        <TabsContent value="albums">
          <AlbumManager
            invitationId={invitation.id}
            items={albums}
            photos={galleries}
            limit={limits.maxGallery}
            maxMb={maxMb}
          />
        </TabsContent>
        <TabsContent value="gifts">
          <GiftsManager invitationId={invitation.id} items={gifts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
