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
  const migration = await readFile(new URL("../../supabase/migrations/20260813174150_initial_production_schema.sql", import.meta.url), "utf8");
  assert.match(migration, /enable row level security/g);
  assert.match(migration, /private\.can_read_project/);
  assert.doesNotMatch(migration, /function public\.(?:is_active_workspace_member|has_workspace_role|can_read_project)/);
  assert.match(migration, /revoke execute on function private\.can_read_project/);
  assert.match(migration, /for select to authenticated/);
  assert.match(migration, /revoke all on all tables in schema public from anon, authenticated/);
  assert.match(migration, /workspace_id/);
  assert.match(migration, /stripe_events/);
  assert.match(migration, /invitations_pending_email_uidx/);
});

test("provider adapters keep server secrets out of browser modules", async () => {
  const browser = await readFile(new URL("../../app/lib/supabase/browser.ts", import.meta.url), "utf8");
  const env = await readFile(new URL("../../app/lib/env.ts", import.meta.url), "utf8");
  const databaseTypes = await readFile(new URL("../../app/lib/supabase/database.types.ts", import.meta.url), "utf8");
  const email = await readFile(new URL("../../app/lib/email.ts", import.meta.url), "utf8");
  const stripe = await readFile(new URL("../../app/lib/stripe.ts", import.meta.url), "utf8");
  assert.doesNotMatch(browser, /SERVICE_ROLE|STRIPE_SECRET|RESEND_API_KEY/);
  assert.match(browser, /createBrowserClient<Database>/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL: process\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(databaseTypes, /PostgrestVersion: "14\.15"/);
  assert.match(email, /RESEND_API_KEY/);
  assert.match(stripe, /STRIPE_SECRET_KEY/);
});

test("authentication refresh stays server-side so HttpOnly session cookies are not exposed to browser code", async () => {
  const [browser, httpClient, proxy, cookieOptions, authForm] = await Promise.all([
    readFile(new URL("../../app/lib/supabase/browser.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/services/http-client.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/lib/supabase/proxy.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/lib/supabase/cookie-options.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/components/auth-form.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(browser, /createBrowserClient<Database>/);
  assert.doesNotMatch(httpClient, /auth\.refreshSession|refreshSessionOnce/);
  assert.match(proxy, /getClaims\(\)/);
  assert.match(cookieOptions, /httpOnly: true/);
  assert.match(cookieOptions, /secure:/);
  assert.doesNotMatch(authForm, /signInWithPassword|signUp\(|resetPasswordForEmail|updateUser/);
});
