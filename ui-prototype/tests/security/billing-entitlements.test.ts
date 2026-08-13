import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  FREE_MEMBER_LIMIT,
  FREE_PROJECT_LIMIT,
  hasPaidAccess,
  resolveEntitlements,
} from "../../app/lib/billing-entitlements";

test("only active or trialing matching Stripe price grants Pro", () => {
  assert.equal(hasPaidAccess("active", true), true);
  assert.equal(hasPaidAccess("trialing", true), true);
  for (const status of ["past_due", "unpaid", "canceled", "incomplete", null])
    assert.equal(hasPaidAccess(status, true), false);
  assert.equal(hasPaidAccess("active", false), false);
});

test("Free and Pro limits are deterministic and seat aware", () => {
  const free = resolveEntitlements({
    status: null,
    quantity: null,
    priceMatches: false,
  });
  assert.equal(free.projectLimit, FREE_PROJECT_LIMIT);
  assert.equal(free.memberLimit, FREE_MEMBER_LIMIT);
  assert.equal(free.canUseAdvancedPermissions, false);

  const pro = resolveEntitlements({
    status: "active",
    quantity: 8,
    priceMatches: true,
  });
  assert.equal(pro.projectLimit, null);
  assert.equal(pro.memberLimit, 8);
  assert.equal(pro.canReadFullActivity, true);
});

test("Stripe webhook verifies raw body, resists replay, and persists server-side entitlements", async () => {
  const webhook = await readFile(
    new URL("../../app/api/v1/webhooks/stripe/route.ts", import.meta.url),
    "utf8",
  );
  const billing = await readFile(
    new URL("../../db/billing.ts", import.meta.url),
    "utf8",
  );
  const migration = await readFile(
    new URL(
    "../../supabase/migrations/20260813204050_billing_entitlements.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(webhook, /constructEvent\(\s*await request\.text\(\)/);
  assert.match(webhook, /stripe-signature/);
  assert.match(webhook, /hasProcessedStripeEvent/);
  assert.match(billing, /onConflictDoNothing/);
  assert.match(billing, /providerUpdatedAt/);
  assert.match(
    migration,
    /revoke insert, update, delete on public\.subscriptions from anon, authenticated/,
  );
});

test("billing management and entitlements stay tenant and role scoped", async () => {
  const checkout = await readFile(
    new URL(
      "../../app/api/v1/workspaces/[workspaceId]/billing/checkout/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const projectRoute = await readFile(
    new URL(
      "../../app/api/v1/workspaces/[workspaceId]/projects/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const collaboration = await readFile(
    new URL("../../db/collaboration.ts", import.meta.url),
    "utf8",
  );

  assert.match(checkout, /getBillingSummary\(workspaceId, auth\.user\.id\)/);
  assert.match(checkout, /metadata: \{ workspaceId, ownerUserId/);
  assert.match(projectRoute, /PROJECT_LIMIT_REACHED/);
  assert.match(projectRoute, /PRO_FEATURE_REQUIRED/);
  assert.match(collaboration, /hasSeatCapacity/);
});
