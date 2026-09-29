import { eq, isNull, lte, or, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { resolveEntitlements } from "@/app/lib/billing-entitlements";
import { stripeEnv } from "@/app/lib/env";
import { authorizeWorkspace } from "./authorization";
import { getDb } from "./index";
import { stripeEvents, subscriptions, workspaces } from "./schema";

function expandableId(value: string | { id: string }) {
  return typeof value === "string" ? value : value.id;
}

export async function hasProcessedStripeEvent(eventId: string) {
  return Boolean(
    await getDb()
      .select({ id: stripeEvents.id })
      .from(stripeEvents)
      .where(eq(stripeEvents.id, eventId))
      .get(),
  );
}

export async function syncStripeSubscription(input: {
  eventId: string;
  eventType: string;
  eventCreated: number;
  subscription: Stripe.Subscription;
  lastInvoiceStatus?: "paid" | "payment_failed";
}) {
  const item = input.subscription.items.data[0];
  const workspaceId = input.subscription.metadata.workspaceId;
  if (!workspaceId || !item)
    throw new Error(
      "Stripe subscription is missing workspace metadata or a price item",
    );

  const workspace = await getDb()
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .get();
  if (!workspace)
    throw new Error("Stripe subscription references an unknown workspace");

  const customerId = expandableId(input.subscription.customer);
  const productId = expandableId(item.price.product);
  const providerUpdatedAt = new Date(input.eventCreated * 1000);
  const values = {
    workspaceId,
    providerCustomerId: customerId,
    stripeSubscriptionId: input.subscription.id,
    stripeSubscriptionItemId: item.id,
    stripePriceId: item.price.id,
    stripeProductId: productId,
    status: input.subscription.status,
    quantity: Math.max(1, item.quantity ?? 1),
    currentPeriodEnd: new Date(item.current_period_end * 1000),
    cancelAtPeriodEnd: input.subscription.cancel_at_period_end,
    ...(input.lastInvoiceStatus
      ? { lastInvoiceStatus: input.lastInvoiceStatus }
      : {}),
    providerUpdatedAt,
    updatedAt: new Date(),
  };
  const expectedPriceId = stripeEnv().STRIPE_PRICE_PRO_MONTHLY;
  const db = getDb();

  await db.batch([
    db
      .insert(stripeEvents)
      .values({ id: input.eventId, type: input.eventType })
      .onConflictDoNothing(),
    db
      .insert(subscriptions)
      .values({ id: crypto.randomUUID(), ...values })
      .onConflictDoUpdate({
        target: subscriptions.workspaceId,
        set: values,
        setWhere: or(
          isNull(subscriptions.providerUpdatedAt),
          lte(subscriptions.providerUpdatedAt, providerUpdatedAt),
        ),
      }),
    db
      .update(workspaces)
      .set({
        plan: sql`case when exists (
        select 1 from public.subscriptions s
        where s.workspace_id = ${workspaceId}
          and s.status in ('active', 'trialing')
          and s.stripe_price_id = ${expectedPriceId}
      ) then 'PRO' else 'FREE' end`,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId)),
  ]);
}

import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function getWorkspaceEntitlements(workspaceId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  return resolveEntitlements({
    status: subscription?.status ?? null,
    quantity: subscription?.quantity ?? null,
    priceMatches:
      subscription?.stripe_price_id === stripeEnv().STRIPE_PRICE_PRO_MONTHLY,
  });
}

export async function getBillingSummary(workspaceId: string, userId: string) {
  if (
    !(await authorizeWorkspace(workspaceId, userId, "workspace.billing.manage"))
  )
    return null;

  const supabase = createSupabaseAdminClient();
  const [subRes, projRes, memRes, invRes] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("workspace_id", workspaceId).maybeSingle(),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).is("archived_at", null),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "ACTIVE"),
    supabase.from("invitations").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "PENDING").gt("expires_at", new Date().toISOString()),
  ]);

  const subscription = subRes.data;
  const entitlements = resolveEntitlements({
    status: subscription?.status ?? null,
    quantity: subscription?.quantity ?? null,
    priceMatches:
      subscription?.stripe_price_id === stripeEnv().STRIPE_PRICE_PRO_MONTHLY,
  });
  return {
    ...entitlements,
    activeProjects: Number(projRes.count ?? 0),
    activeMembers: Number(memRes.count ?? 0),
    pendingInvitations: Number(invRes.count ?? 0),
    customerId: subscription?.provider_customer_id ?? null,
    subscriptionId: subscription?.stripe_subscription_id ?? null,
    priceId: subscription?.stripe_price_id ?? null,
    quantity: subscription?.quantity ?? null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    currentPeriodEnd: subscription?.current_period_end ? new Date(subscription.current_period_end).toISOString() : null,
    lastInvoiceStatus: subscription?.last_invoice_status ?? null,
  };
}

export async function hasProjectCapacity(workspaceId: string) {
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  if (entitlements.projectLimit === null) return true;
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("archived_at", null);

  return Number(count ?? 0) < entitlements.projectLimit;
}

export async function canUseAdvancedPermissions(workspaceId: string) {
  return (await getWorkspaceEntitlements(workspaceId))
    .canUseAdvancedPermissions;
}

export async function hasSeatCapacity(
  workspaceId: string,
  includePendingInvitations = false,
) {
  return hasSeatCapacityWithDb(workspaceId, includePendingInvitations);
}

export async function hasSeatCapacityWithDb(workspaceId: string, includePendingInvitations = false) {
  const supabase = createSupabaseAdminClient();
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("workspace_id", workspaceId).maybeSingle();
  const entitlements = resolveEntitlements({ status: subscription?.status ?? null, quantity: subscription?.quantity ?? null, priceMatches: subscription?.stripe_price_id === stripeEnv().STRIPE_PRICE_PRO_MONTHLY });
  const { count: activeCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "ACTIVE");

  let used = Number(activeCount ?? 0);
  if (includePendingInvitations) {
    const { count: pendingCount } = await supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "PENDING")
      .gt("expires_at", new Date().toISOString());

    used += Number(pendingCount ?? 0);
  }
  return used < entitlements.memberLimit;
}
