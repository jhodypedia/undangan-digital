import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type {
  Attendance,
  GiftType,
  GuestCategory,
  InvitationCategory,
  PlanCode,
  TransactionStatus,
  UserRole,
  UserStatus,
} from "@/lib/constants";
import type { TemplateConfig } from "@/lib/template-config";

const id = () => integer("id").primaryKey({ autoIncrement: true });
const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date());

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<UserRole>().notNull().default("free"),
  status: text("status").$type<UserStatus>().notNull().default("active"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  companyName: text("company_name"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  premiumUntil: integer("premium_until", { mode: "timestamp" }),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: createdAt(),
});

export const plans = sqliteTable("plans", {
  id: id(),
  code: text("code").$type<PlanCode>().notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull().default(0),
  durationDays: integer("duration_days").notNull().default(0),
  maxInvitations: integer("max_invitations").notNull().default(1),
  maxGuests: integer("max_guests").notNull().default(50),
  maxGallery: integer("max_gallery").notNull().default(6),
  features: text("features", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`('[]')`),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const templates = sqliteTable("templates", {
  id: id(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  previewImage: text("preview_image"),
  primaryColor: text("primary_color").notNull().default("#0f172a"),
  accentColor: text("accent_color").notNull().default("#d4af37"),
  category: text("category").$type<InvitationCategory>(),
  isPremium: integer("is_premium", { mode: "boolean" })
    .notNull()
    .default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  source: text("source").notNull().default("manual"),
  prompt: text("prompt"),
  config: text("config", { mode: "json" }).$type<TemplateConfig>(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const invitations = sqliteTable("invitations", {
  id: id(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  templateId: integer("template_id").references(() => templates.id, {
    onDelete: "set null",
  }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category")
    .$type<InvitationCategory>()
    .notNull()
    .default("pernikahan"),
  groomName: text("groom_name"),
  groomFullName: text("groom_full_name"),
  groomParents: text("groom_parents"),
  groomOrder: text("groom_order"),
  groomInstagram: text("groom_instagram"),
  groomPhoto: text("groom_photo"),
  brideName: text("bride_name"),
  brideFullName: text("bride_full_name"),
  brideParents: text("bride_parents"),
  brideOrder: text("bride_order"),
  brideInstagram: text("bride_instagram"),
  bridePhoto: text("bride_photo"),
  quote: text("quote"),
  quoteSource: text("quote_source"),
  greeting: text("greeting"),
  closing: text("closing"),
  coverImage: text("cover_image"),
  coverPhoto: text("cover_photo"),
  backgroundImage: text("background_image"),
  backgroundOverlay: integer("background_overlay").notNull().default(40),
  backgroundBlur: integer("background_blur").notNull().default(0),
  customConfig: text("custom_config", { mode: "json" }).$type<TemplateConfig>(),
  musicUrl: text("music_url"),
  themeColor: text("theme_color").notNull().default("#0f172a"),
  accentColor: text("accent_color").notNull().default("#d4af37"),
  eventDate: integer("event_date", { mode: "timestamp" }),
  rsvpDeadline: integer("rsvp_deadline", { mode: "timestamp" }),
  locationName: text("location_name"),
  address: text("address"),
  mapsUrl: text("maps_url"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  liveStreamUrl: text("live_stream_url"),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const events = sqliteTable("events", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  date: integer("date", { mode: "timestamp" }),
  startTime: text("start_time"),
  endTime: text("end_time"),
  timezone: text("timezone").notNull().default("WIB"),
  venue: text("venue"),
  address: text("address"),
  mapsUrl: text("maps_url"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const stories = sqliteTable("stories", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  storyDate: integer("story_date", { mode: "timestamp" }),
  description: text("description"),
  photoUrl: text("photo_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const albums = sqliteTable("albums", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const galleries = sqliteTable("galleries", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  albumId: integer("album_id").references(() => albums.id, {
    onDelete: "set null",
  }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const gifts = sqliteTable("gifts", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  type: text("type").$type<GiftType>().notNull().default("bank"),
  provider: text("provider"),
  accountName: text("account_name"),
  accountNumber: text("account_number"),
  address: text("address"),
  note: text("note"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const guests = sqliteTable(
  "guests",
  {
    id: id(),
    invitationId: integer("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    category: text("category")
      .$type<GuestCategory>()
      .notNull()
      .default("lainnya"),
    code: text("code").notNull(),
    personalMessage: text("personal_message"),
    status: text("status").notNull().default("active"),
    isSent: integer("is_sent", { mode: "boolean" }).notNull().default(false),
    sentAt: integer("sent_at", { mode: "timestamp" }),
    openedAt: integer("opened_at", { mode: "timestamp" }),
    visitCount: integer("visit_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("guests_code_unique").on(table.code)],
);

export const rsvps = sqliteTable("rsvps", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  guestId: integer("guest_id").references(() => guests.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  attendance: text("attendance").$type<Attendance>().notNull().default("hadir"),
  totalGuests: integer("total_guests").notNull().default(1),
  message: text("message"),
  createdAt: createdAt(),
});

export const wishes = sqliteTable("wishes", {
  id: id(),
  invitationId: integer("invitation_id")
    .notNull()
    .references(() => invitations.id, { onDelete: "cascade" }),
  guestId: integer("guest_id").references(() => guests.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  isApproved: integer("is_approved", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: createdAt(),
});

export const transactions = sqliteTable("transactions", {
  id: id(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: integer("plan_id").references(() => plans.id, {
    onDelete: "set null",
  }),
  planCode: text("plan_code").$type<PlanCode>().notNull(),
  amount: integer("amount").notNull().default(0),
  status: text("status")
    .$type<TransactionStatus>()
    .notNull()
    .default("pending"),
  method: text("method"),
  reference: text("reference").notNull().unique(),
  notes: text("notes"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: updatedAt(),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: id(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  entity: text("entity"),
  entityId: integer("entity_id"),
  description: text("description"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: createdAt(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  invitations: many(invitations),
  transactions: many(transactions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
  user: one(users, { fields: [invitations.userId], references: [users.id] }),
  template: one(templates, {
    fields: [invitations.templateId],
    references: [templates.id],
  }),
  events: many(events),
  stories: many(stories),
  galleries: many(galleries),
  albums: many(albums),
  gifts: many(gifts),
  guests: many(guests),
  rsvps: many(rsvps),
  wishes: many(wishes),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  invitation: one(invitations, {
    fields: [events.invitationId],
    references: [invitations.id],
  }),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
  invitation: one(invitations, {
    fields: [albums.invitationId],
    references: [invitations.id],
  }),
  photos: many(galleries),
}));

export const galleriesRelations = relations(galleries, ({ one }) => ({
  invitation: one(invitations, {
    fields: [galleries.invitationId],
    references: [invitations.id],
  }),
  album: one(albums, { fields: [galleries.albumId], references: [albums.id] }),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  invitation: one(invitations, {
    fields: [guests.invitationId],
    references: [invitations.id],
  }),
  rsvps: many(rsvps),
  wishes: many(wishes),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  invitation: one(invitations, {
    fields: [rsvps.invitationId],
    references: [invitations.id],
  }),
  guest: one(guests, { fields: [rsvps.guestId], references: [guests.id] }),
}));

export const wishesRelations = relations(wishes, ({ one }) => ({
  invitation: one(invitations, {
    fields: [wishes.invitationId],
    references: [invitations.id],
  }),
  guest: one(guests, { fields: [wishes.guestId], references: [guests.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  plan: one(plans, {
    fields: [transactions.planId],
    references: [plans.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type InvitationEvent = typeof events.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Gallery = typeof galleries.$inferSelect;
export type Gift = typeof gifts.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Rsvp = typeof rsvps.$inferSelect;
export type Wish = typeof wishes.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
