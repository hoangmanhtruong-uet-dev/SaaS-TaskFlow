import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production platform decisions cover hosting, auth, database, email, and billing", async () => {
  for (const file of [
    "0001-vercel-runtime-and-environments.md", "0002-supabase-auth.md", "0003-supabase-postgres.md",
    "0004-resend-email.md", "0005-stripe-billing.md",
  ]) {
    const content = await readFile(new URL(`../../docs/architecture/${file}`, import.meta.url), "utf8");
    assert.match(content, /Status: Accepted/);
  }
});

test("Supabase migration enables RLS and tenant-scoped project access", async () => {
  const migration = await readFile(new URL("../../supabase/migrations/202608140001_initial_production_schema.sql", import.meta.url), "utf8");
  assert.match(migration, /enable row level security/g);
  assert.match(migration, /can_read_project/);
  assert.match(migration, /workspace_id/);
  assert.match(migration, /stripe_events/);
  assert.match(migration, /invitations_pending_email_uidx/);
});

test("provider adapters keep server secrets out of browser modules", async () => {
  const browser = await readFile(new URL("../../app/lib/supabase/browser.ts", import.meta.url), "utf8");
  const email = await readFile(new URL("../../app/lib/email.ts", import.meta.url), "utf8");
  const stripe = await readFile(new URL("../../app/lib/stripe.ts", import.meta.url), "utf8");
  assert.doesNotMatch(browser, /SERVICE_ROLE|STRIPE_SECRET|RESEND_API_KEY/);
  assert.match(email, /RESEND_API_KEY/);
  assert.match(stripe, /STRIPE_SECRET_KEY/);
});
