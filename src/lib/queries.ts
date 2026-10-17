import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  activityLogs,
  albums,
  events,
  galleries,
  gifts,
  guests,
  invitations,
  plans,
  rsvps,
  settings,
  stories,
  templates,
  transactions,
  users,
  wishes,
} from "@/db/schema";

export async function getUserInvitationIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.userId, userId));
  return rows.map((row) => row.id);
}

export async function getDashboardSummary(userId: number) {
  const ids = await getUserInvitationIds(userId);

  const [inv] = await db
    .select({
      total: count(),
      published: sql<number>`sum(case when ${invitations.isPublished} = 1 then 1 else 0 end)`,
      views: sql<number>`coalesce(sum(${invitations.viewCount}), 0)`,
    })
    .from(invitations)
    .where(eq(invitations.userId, userId));

  if (ids.length === 0) {
    return {
      invitations: inv?.total ?? 0,
      published: Number(inv?.published ?? 0),
      views: Number(inv?.views ?? 0),
      guests: 0,
      attending: 0,
      wishes: 0,
      pendingRsvp: 0,
    };
  }

  const [guestAgg] = await db
    .select({ total: count() })
    .from(guests)
    .where(inArray(guests.invitationId, ids));

  const [rsvpAgg] = await db
    .select({
      attending: sql<number>`coalesce(sum(case when ${rsvps.attendance} = 'hadir' then ${rsvps.totalGuests} else 0 end), 0)`,
      pending: sql<number>`coalesce(sum(case when ${rsvps.attendance} = 'ragu' then 1 else 0 end), 0)`,
    })
    .from(rsvps)
    .where(inArray(rsvps.invitationId, ids));

  const [wishAgg] = await db
    .select({ total: count() })
    .from(wishes)
    .where(inArray(wishes.invitationId, ids));

  return {
    invitations: inv?.total ?? 0,
    published: Number(inv?.published ?? 0),
    views: Number(inv?.views ?? 0),
    guests: guestAgg?.total ?? 0,
    attending: Number(rsvpAgg?.attending ?? 0),
    wishes: wishAgg?.total ?? 0,
    pendingRsvp: Number(rsvpAgg?.pending ?? 0),
  };
}

export async function listInvitationsWithCounts(userId: number) {
  const rows = await db
    .select({
      invitation: invitations,
      guestCount: sql<number>`(select count(*) from ${guests} where ${guests.invitationId} = ${invitations.id})`,
      rsvpCount: sql<number>`(select count(*) from ${rsvps} where ${rsvps.invitationId} = ${invitations.id})`,
      wishCount: sql<number>`(select count(*) from ${wishes} where ${wishes.invitationId} = ${invitations.id})`,
    })
    .from(invitations)
    .where(eq(invitations.userId, userId))
    .orderBy(desc(invitations.createdAt));

  return rows.map((row) => ({
    ...row.invitation,
    guestCount: Number(row.guestCount),
    rsvpCount: Number(row.rsvpCount),
    wishCount: Number(row.wishCount),
  }));
}

export async function getInvitationForUser(id: number, userId: number) {
  const [row] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, id), eq(invitations.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getInvitationDetail(id: number, userId: number) {
  const invitation = await getInvitationForUser(id, userId);
  if (!invitation) return null;

  const [eventRows, storyRows, galleryRows, giftRows, albumRows] =
    await Promise.all([
      db
        .select()
        .from(events)
        .where(eq(events.invitationId, id))
        .orderBy(events.sortOrder, events.id),
      db
        .select()
        .from(stories)
        .where(eq(stories.invitationId, id))
        .orderBy(stories.sortOrder, stories.id),
      db
        .select()
        .from(galleries)
        .where(eq(galleries.invitationId, id))
        .orderBy(galleries.sortOrder, galleries.id),
      db
        .select()
        .from(gifts)
        .where(eq(gifts.invitationId, id))
        .orderBy(gifts.sortOrder, gifts.id),
      db
        .select()
        .from(albums)
        .where(eq(albums.invitationId, id))
        .orderBy(albums.sortOrder, albums.id),
    ]);

  return {
    invitation,
    events: eventRows,
    stories: storyRows,
    galleries: galleryRows,
    gifts: giftRows,
    albums: albumRows,
  };
}

export async function getDashboardTrends(userId: number) {
  const ids = await getUserInvitationIds(userId);
  const days = 14;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const empty = {
    guests: Array(days).fill(0) as number[],
    rsvps: Array(days).fill(0) as number[],
    wishes: Array(days).fill(0) as number[],
  };
  const labels = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return String(date.getDate());
  });
  if (ids.length === 0) return { ...empty, labels };

  const [g, r, w] = await Promise.all([
    db
      .select({ createdAt: guests.createdAt })
      .from(guests)
      .where(and(inArray(guests.invitationId, ids), gte(guests.createdAt, start))),
    db
      .select({ createdAt: rsvps.createdAt })
      .from(rsvps)
      .where(and(inArray(rsvps.invitationId, ids), gte(rsvps.createdAt, start))),
    db
      .select({ createdAt: wishes.createdAt })
      .from(wishes)
      .where(and(inArray(wishes.invitationId, ids), gte(wishes.createdAt, start))),
  ]);

  const bucket = (rows: { createdAt: Date }[]) => {
    const series = Array(days).fill(0) as number[];
    for (const row of rows) {
      const index = Math.floor(
        (row.createdAt.getTime() - start.getTime()) / 86_400_000,
      );
      if (index >= 0 && index < days) series[index] += 1;
    }
    return series;
  };

  return { guests: bucket(g), rsvps: bucket(r), wishes: bucket(w), labels };
}

export function trendDelta(series: number[]): number {
  if (series.length < 2) return 0;
  const half = Math.floor(series.length / 2);
  const prev = series.slice(0, half).reduce((a, b) => a + b, 0);
  const current = series.slice(half).reduce((a, b) => a + b, 0);
  if (prev === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - prev) / prev) * 100);
}

export async function listGuests(userId: number, invitationId?: number) {
  const ids = await getUserInvitationIds(userId);
  if (ids.length === 0) return [];
  const scope = invitationId ? [invitationId].filter((id) => ids.includes(id)) : ids;
  if (scope.length === 0) return [];

  return db
    .select({
      guest: guests,
      invitationTitle: invitations.title,
      invitationSlug: invitations.slug,
    })
    .from(guests)
    .innerJoin(invitations, eq(invitations.id, guests.invitationId))
    .where(inArray(guests.invitationId, scope))
    .orderBy(desc(guests.createdAt));
}

export async function listRsvps(userId: number, invitationId?: number) {
  const ids = await getUserInvitationIds(userId);
  if (ids.length === 0) return [];
  const scope = invitationId ? [invitationId].filter((id) => ids.includes(id)) : ids;
  if (scope.length === 0) return [];

  return db
    .select({ rsvp: rsvps, invitationTitle: invitations.title })
    .from(rsvps)
    .innerJoin(invitations, eq(invitations.id, rsvps.invitationId))
    .where(inArray(rsvps.invitationId, scope))
    .orderBy(desc(rsvps.createdAt));
}

export async function listWishes(userId: number, invitationId?: number) {
  const ids = await getUserInvitationIds(userId);
  if (ids.length === 0) return [];
  const scope = invitationId ? [invitationId].filter((id) => ids.includes(id)) : ids;
  if (scope.length === 0) return [];

  return db
    .select({ wish: wishes, invitationTitle: invitations.title })
    .from(wishes)
    .innerJoin(invitations, eq(invitations.id, wishes.invitationId))
    .where(inArray(wishes.invitationId, scope))
    .orderBy(desc(wishes.createdAt));
}

export async function listUserTransactions(userId: number) {
  return db
    .select({ transaction: transactions, planName: plans.name })
    .from(transactions)
    .leftJoin(plans, eq(plans.id, transactions.planId))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));
}

export async function getTransactionByReference(reference: string) {
  const [row] = await db
    .select({
      transaction: transactions,
      plan: plans,
      user: users,
    })
    .from(transactions)
    .leftJoin(plans, eq(plans.id, transactions.planId))
    .leftJoin(users, eq(users.id, transactions.userId))
    .where(eq(transactions.reference, reference))
    .limit(1);
  return row ?? null;
}

export async function listActivePlans() {
  return db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.sortOrder);
}

export async function listAllPlans() {
  return db.select().from(plans).orderBy(plans.sortOrder);
}

export async function listTemplates() {
  return db
    .select()
    .from(templates)
    .orderBy(templates.sortOrder, templates.id);
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  return Object.fromEntries(
    rows.map((row) => [row.key, row.value ?? ""]),
  );
}

export async function listUsersWithCounts() {
  return db
    .select({
      user: users,
      invitationCount: sql<number>`(select count(*) from ${invitations} where ${invitations.userId} = ${users.id})`,
      transactionCount: sql<number>`(select count(*) from ${transactions} where ${transactions.userId} = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function listAllTransactions() {
  return db
    .select({
      transaction: transactions,
      userName: users.name,
      userEmail: users.email,
      planName: plans.name,
    })
    .from(transactions)
    .leftJoin(users, eq(users.id, transactions.userId))
    .leftJoin(plans, eq(plans.id, transactions.planId))
    .orderBy(desc(transactions.createdAt));
}

export async function getAdminSummary() {
  const [userAgg] = await db
    .select({
      total: count(),
      premium: sql<number>`sum(case when ${users.role} = 'premium' then 1 else 0 end)`,
      admin: sql<number>`sum(case when ${users.role} = 'admin' then 1 else 0 end)`,
    })
    .from(users);

  const [invAgg] = await db.select({ total: count() }).from(invitations);

  const [revenueAgg] = await db
    .select({
      revenue: sql<number>`coalesce(sum(case when ${transactions.status} = 'paid' then ${transactions.amount} else 0 end), 0)`,
      pending: sql<number>`sum(case when ${transactions.status} = 'pending' then 1 else 0 end)`,
    })
    .from(transactions);

  return {
    users: userAgg?.total ?? 0,
    premium: Number(userAgg?.premium ?? 0),
    admin: Number(userAgg?.admin ?? 0),
    invitations: invAgg?.total ?? 0,
    revenue: Number(revenueAgg?.revenue ?? 0),
    pendingTransactions: Number(revenueAgg?.pending ?? 0),
  };
}

export async function listActivity(limit = 10) {
  return db
    .select({ log: activityLogs, userName: users.name })
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getPublicInvitation(slug: string) {
  const [row] = await db
    .select({
      invitation: invitations,
      template: templates,
      ownerRole: users.role,
      ownerPremiumUntil: users.premiumUntil,
    })
    .from(invitations)
    .leftJoin(templates, eq(templates.id, invitations.templateId))
    .leftJoin(users, eq(users.id, invitations.userId))
    .where(eq(invitations.slug, slug))
    .limit(1);

  if (!row) return null;
  const invitation = row.invitation;

  const [eventRows, storyRows, galleryRows, giftRows, wishRows, albumRows] =
    await Promise.all([
      db
        .select()
        .from(events)
        .where(eq(events.invitationId, invitation.id))
        .orderBy(events.sortOrder, events.id),
      db
        .select()
        .from(stories)
        .where(eq(stories.invitationId, invitation.id))
        .orderBy(stories.sortOrder, stories.id),
      db
        .select()
        .from(galleries)
        .where(eq(galleries.invitationId, invitation.id))
        .orderBy(galleries.sortOrder, galleries.id),
      db
        .select()
        .from(gifts)
        .where(
          and(
            eq(gifts.invitationId, invitation.id),
            eq(gifts.isPublic, true),
          ),
        )
        .orderBy(gifts.sortOrder, gifts.id),
      db
        .select()
        .from(wishes)
        .where(
          and(
            eq(wishes.invitationId, invitation.id),
            eq(wishes.isApproved, true),
          ),
        )
        .orderBy(desc(wishes.createdAt))
        .limit(50),
      db
        .select()
        .from(albums)
        .where(
          and(
            eq(albums.invitationId, invitation.id),
            eq(albums.isPublic, true),
          ),
        )
        .orderBy(albums.sortOrder, albums.id),
    ]);

  return {
    invitation,
    template: row.template,
    owner: {
      role: row.ownerRole ?? "free",
      premiumUntil: row.ownerPremiumUntil ?? null,
    },
    events: eventRows,
    stories: storyRows,
    galleries: galleryRows,
    gifts: giftRows,
    wishes: wishRows,
    albums: albumRows,
  };
}

export async function getSampleInvitationSlug() {
  const [row] = await db
    .select({ slug: invitations.slug })
    .from(invitations)
    .where(eq(invitations.isPublished, true))
    .orderBy(desc(invitations.viewCount), desc(invitations.id))
    .limit(1);
  return row?.slug ?? null;
}

export async function getGuestByCode(code: string) {
  const [guest] = await db
    .select()
    .from(guests)
    .where(eq(guests.code, code))
    .limit(1);
  return guest ?? null;
}
