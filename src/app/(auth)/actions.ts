"use server";

import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import { SITE_SETTINGS_KEYS, USER_ROLES, type UserRole } from "@/lib/constants";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export type AuthState = { error?: string };

async function requestMeta() {
  const headerList = await headers();
  return {
    ipAddress:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      null,
    userAgent: headerList.get("user-agent"),
  };
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Email atau kata sandi salah." };
  }

  if (user.status !== "active") {
    return { error: "Akun Anda sedang ditangguhkan. Hubungi admin." };
  }

  const meta = await requestMeta();
  await createSession(user.id, meta);
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
  await db.insert(activityLogs).values({
    userId: user.id,
    action: "login",
    entity: "user",
    entityId: user.id,
    description: `${user.name} masuk ke dasbor.`,
    ...meta,
  });

  redirect(user.role === "admin" ? "/dashboard/admin" : "/dashboard");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (name.length < 3) return { error: "Nama minimal 3 karakter." };
  if (!isEmail(email)) return { error: "Format email tidak valid." };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (password !== confirm) return { error: "Konfirmasi kata sandi tidak sama." };

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return { error: "Email sudah terdaftar. Silakan masuk." };

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users);
  const isFirstUser = Number(total) === 0;

  const settings = await getSettings();
  const defaultRole = settings[SITE_SETTINGS_KEYS.defaultRole];
  const role: UserRole = isFirstUser
    ? "admin"
    : USER_ROLES.includes(defaultRole as UserRole)
      ? (defaultRole as UserRole)
      : "free";

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      emailVerified: true,
    })
    .returning();

  const meta = await requestMeta();
  await createSession(created.id, meta);
  await db.insert(activityLogs).values({
    userId: created.id,
    action: "register",
    entity: "user",
    entityId: created.id,
    description: isFirstUser
      ? `${name} mendaftar sebagai admin pertama.`
      : `Akun baru dibuat untuk ${name}.`,
    ...meta,
  });

  redirect(role === "admin" ? "/dashboard/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
