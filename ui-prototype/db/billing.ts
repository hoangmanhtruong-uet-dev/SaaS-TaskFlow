import { and, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { resolveEntitlements } from "@/app/lib/billing-entitlements";
import { stripeEnv } from "@/app/lib/env";
import { authorizeWorkspace } from "./authorization";
import { getDb } from "./index";
import {
  invitations,
  memberships,
  projects,
  stripeEvents,
  subscriptions,
  workspaces,
} from "./schema";

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

export async function getWorkspaceEntitlements(workspaceId: string) {
  const subscription = await getDb()
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .get();
  return resolveEntitlements({
    status: subscription?.status ?? null,
    quantity: subscription?.quantity ?? null,
    priceMatches:
      subscription?.stripePriceId === stripeEnv().STRIPE_PRICE_PRO_MONTHLY,
  });
}

export async function getBillingSummary(workspaceId: string, userId: string) {
  if (
    !(await authorizeWorkspace(workspaceId, userId, "workspace.billing.manage"))
  )
    return null;
  const [subscription, projectCount, memberCount, pendingCount] =
    await Promise.all([
      getDb()
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.workspaceId, workspaceId))
        .get(),
      getDb()
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(
          and(
            eq(projects.workspaceId, workspaceId),
            isNull(projects.archivedAt),
          ),
        )
        .get(),
      getDb()
        .select({ count: sql<number>`count(*)` })
        .from(memberships)
        .where(
          and(
            eq(memberships.workspaceId, workspaceId),
            eq(memberships.status, "ACTIVE"),
          ),
        )
        .get(),
      getDb()
        .select({ count: sql<number>`count(*)` })
        .from(invitations)
        .where(
          and(
            eq(invitations.workspaceId, workspaceId),
            eq(invitations.status, "PENDING"),
            gt(invitations.expiresAt, new Date()),
          ),
        )
        .get(),
    ]);
  const entitlements = resolveEntitlements({
    status: subscription?.status ?? null,
    quantity: subscription?.quantity ?? null,
    priceMatches:
      subscription?.stripePriceId === stripeEnv().STRIPE_PRICE_PRO_MONTHLY,
  });
  return {
    ...entitlements,
    activeProjects: Number(projectCount?.count ?? 0),
    activeMembers: Number(memberCount?.count ?? 0),
    pendingInvitations: Number(pendingCount?.count ?? 0),
    customerId: subscription?.providerCustomerId ?? null,
    subscriptionId: subscription?.stripeSubscriptionId ?? null,
    priceId: subscription?.stripePriceId ?? null,
    quantity: subscription?.quantity ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    lastInvoiceStatus: subscription?.lastInvoiceStatus ?? null,
  };
}

export async function hasProjectCapacity(workspaceId: string) {
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  if (entitlements.projectLimit === null) return true;
  const row = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(
      and(eq(projects.workspaceId, workspaceId), isNull(projects.archivedAt)),
    )
    .get();
  return Number(row?.count ?? 0) < entitlements.projectLimit;
}

export async function canUseAdvancedPermissions(workspaceId: string) {
  return (await getWorkspaceEntitlements(workspaceId))
    .canUseAdvancedPermissions;
}

export async function hasSeatCapacity(
  workspaceId: string,
  includePendingInvitations = false,
) {
  return hasSeatCapacityWithDb(getDb(), workspaceId, includePendingInvitations);
}

export async function hasSeatCapacityWithDb(database: ReturnType<typeof getDb>, workspaceId: string, includePendingInvitations = false) {
  const subscription = await database.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).get();
  const entitlements = resolveEntitlements({ status: subscription?.status ?? null, quantity: subscription?.quantity ?? null, priceMatches: subscription?.stripePriceId === stripeEnv().STRIPE_PRICE_PRO_MONTHLY });
  const active = await database
    .select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(
      and(
        eq(memberships.workspaceId, workspaceId),
        eq(memberships.status, "ACTIVE"),
      ),
    )
    .get();
  let used = Number(active?.count ?? 0);
  if (includePendingInvitations) {
    const pending = await database
      .select({ count: sql<number>`count(*)` })
      .from(invitations)
      .where(
        and(
          eq(invitations.workspaceId, workspaceId),
          inArray(invitations.status, ["PENDING"]),
          gt(invitations.expiresAt, new Date()),
        ),
      )
      .get();
    used += Number(pending?.count ?? 0);
  }
  return used < entitlements.memberLimit;
}
