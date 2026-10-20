import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Home, Users } from "lucide-react";

import { togglePublish } from "@/app/dashboard/invitations/actions";
import { InvitationWizard } from "@/app/dashboard/invitations/[id]/invitation-wizard";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getEffectiveRole, requireUser } from "@/lib/auth";
import { getAccountLimits } from "@/lib/limits";
import { getInvitationDetail, getActiveTemplates } from "@/lib/queries";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

export default async function InvitationEditPage(
  props: PageProps<"/dashboard/invitations/[id]">,
) {
  const user = await requireUser();
  const { id } = await props.params;

  const limits = await getAccountLimits(user);
  const settings = await getSettings();
  const maxMb = Number(settings[SITE_SETTINGS_KEYS.uploadMaxMb] ?? "5") || 5;
  const role = getEffectiveRole(user);
  const isPremium = role === "premium" || role === "admin";
  const [detail, availableTemplates] = await Promise.all([
    getInvitationDetail(Number(id), user.id),
    getActiveTemplates(),
  ]);
  if (!detail) notFound();
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

      <InvitationWizard
        detail={{ invitation, events, stories, galleries, gifts, albums }}
        templates={availableTemplates}
        maxMb={maxMb}
        isPremium={isPremium}
        planName={limits.planName}
        maxGallery={limits.maxGallery}
      />
    </div>
  );
}
