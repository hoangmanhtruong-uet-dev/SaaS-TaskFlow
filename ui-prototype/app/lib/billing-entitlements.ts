export const FREE_PROJECT_LIMIT = 3;
export const FREE_MEMBER_LIMIT = 5;

export type BillingPlan = "FREE" | "PRO";
export type BillingEntitlements = {
  plan: BillingPlan;
  status: string | null;
  projectLimit: number | null;
  memberLimit: number;
  canUseAdvancedPermissions: boolean;
  canReadFullActivity: boolean;
};

export function hasPaidAccess(status: string | null, priceMatches: boolean) {
  return priceMatches && (status === "active" || status === "trialing");
}

export function resolveEntitlements(input: { status: string | null; quantity: number | null; priceMatches: boolean }): BillingEntitlements {
  const paid = hasPaidAccess(input.status, input.priceMatches);
  return paid
    ? { plan: "PRO", status: input.status, projectLimit: null, memberLimit: Math.max(1, input.quantity ?? 1), canUseAdvancedPermissions: true, canReadFullActivity: true }
    : { plan: "FREE", status: input.status, projectLimit: FREE_PROJECT_LIMIT, memberLimit: FREE_MEMBER_LIMIT, canUseAdvancedPermissions: false, canReadFullActivity: false };
}
