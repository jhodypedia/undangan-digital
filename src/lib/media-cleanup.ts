import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { albums, galleries, invitations, stories, users } from "@/db/schema";
import { removeUploadedFiles } from "@/lib/upload";

export async function purgeInvitationMedia(invitationIds: number[]) {
  const ids = invitationIds.filter((id) => Number.isFinite(id));
  if (ids.length === 0) return;

  const [invitationRows, galleryRows, storyRows, albumRows] = await Promise.all([
    db
      .select({
        cover: invitations.coverImage,
        bride: invitations.bridePhoto,
        groom: invitations.groomPhoto,
      })
      .from(invitations)
      .where(inArray(invitations.id, ids)),
    db
      .select({ url: galleries.imageUrl })
      .from(galleries)
      .where(inArray(galleries.invitationId, ids)),
    db
      .select({ url: stories.photoUrl })
      .from(stories)
      .where(inArray(stories.invitationId, ids)),
    db
      .select({ url: albums.coverImage })
      .from(albums)
      .where(inArray(albums.invitationId, ids)),
  ]);

  await removeUploadedFiles([
    ...invitationRows.flatMap((row) => [row.cover, row.bride, row.groom]),
    ...galleryRows.map((row) => row.url),
    ...storyRows.map((row) => row.url),
    ...albumRows.map((row) => row.url),
  ]);
}

export async function purgeUserMedia(userId: number) {
  const rows = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.userId, userId));

  await purgeInvitationMedia(rows.map((row) => row.id));

  const [user] = await db
    .select({ avatar: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId));
  await removeUploadedFiles([user?.avatar]);
}
