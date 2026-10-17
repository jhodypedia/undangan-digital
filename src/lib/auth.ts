import { redirect } from "next/navigation";

import type { User } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

export type EffectiveRole = "free" | "premium" | "admin";

export function isPremiumActive(user: Pick<User, "role" | "premiumUntil">): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "premium") return false;
  if (!user.premiumUntil) return true;
  return user.premiumUntil.getTime() > Date.now();
}

export function getEffectiveRole(
  user: Pick<User, "role" | "premiumUntil">,
): EffectiveRole {
  if (user.role === "admin") return "admin";
  return isPremiumActive(user) ? "premium" : "free";
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function requirePremium(): Promise<User> {
  const user = await requireUser();
  if (!isPremiumActive(user)) redirect("/dashboard/billing");
  return user;
}
