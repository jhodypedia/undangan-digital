import type { User } from "@/db/schema";
import { getEffectiveRole } from "@/lib/auth";
import { listAllPlans } from "@/lib/queries";
import type { PlanCode } from "@/lib/constants";

export type AccountLimits = {
  role: "free" | "premium" | "admin";
  planCode: PlanCode;
  planName: string;
  maxInvitations: number;
  maxGuests: number;
  maxGallery: number;
};

export async function getAccountLimits(
  user: Pick<User, "role" | "premiumUntil">,
): Promise<AccountLimits> {
  const role = getEffectiveRole(user);
  const plans = await listAllPlans();

  if (role === "free") {
    const plan = plans.find((item) => item.code === "free");
    return {
      role,
      planCode: "free",
      planName: plan?.name ?? "Gratis",
      maxInvitations: plan?.maxInvitations ?? 1,
      maxGuests: plan?.maxGuests ?? 50,
      maxGallery: plan?.maxGallery ?? 6,
    };
  }

  const premiumPlans = plans.filter((item) => item.code.startsWith("premium"));
  const plan =
    premiumPlans.sort((a, b) => b.maxGuests - a.maxGuests)[0] ??
    premiumPlans[0];

  return {
    role,
    planCode: (plan?.code ?? "premium_monthly") as PlanCode,
    planName: plan?.name ?? "Premium",
    maxInvitations: plan?.maxInvitations ?? 10,
    maxGuests: plan?.maxGuests ?? 5000,
    maxGallery: plan?.maxGallery ?? 50,
  };
}
