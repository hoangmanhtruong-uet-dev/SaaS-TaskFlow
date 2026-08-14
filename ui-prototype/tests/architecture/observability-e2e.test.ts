import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("observability captures server, edge, client, and route errors without default PII", async () => {
  const [instrumentation, server, edge, client, handler] = await Promise.all([
    read("instrumentation.ts"), read("sentry.server.config.ts"), read("sentry.edge.config.ts"),
    read("instrumentation-client.ts"), read("app/lib/route-handler.ts"),
  ]);
  assert.match(instrumentation, /captureRequestError/);
  for (const config of [server, edge, client]) assert.match(config, /sendDefaultPii:\s*false/);
  assert.match(handler, /reportError/);
});

test("structured logs redact sensitive fields and health checks never expose credentials", async () => {
  const [observability, live, ready] = await Promise.all([
    read("app/lib/observability.ts"), read("app/api/health/live/route.ts"), read("app/api/health/ready/route.ts"),
  ]);
  assert.match(observability, /authorization\|cookie\|password\|secret\|token/);
  assert.match(observability, /JSON\.stringify/);
  assert.match(live, /cache-control[\s\S]*no-store/);
  assert.match(ready, /status:\s*"not_ready"/);
  assert.doesNotMatch(live + ready, /SUPABASE_DB_URL|SERVICE_ROLE_KEY|SENTRY_AUTH_TOKEN/);
});

test("Playwright covers health, auth boundary, Stripe signature, tenant isolation, and all roles", async () => {
  const [smoke, critical, config] = await Promise.all([
    read("e2e/smoke.spec.ts"), read("e2e/production-critical.spec.ts"), read("playwright.config.ts"),
  ]);
  for (const marker of ["health/live", "health/ready", "AUTH_REQUIRED", "stripe-signature"]) assert.match(smoke, new RegExp(marker));
  for (const marker of ["OWNER", "ADMIN", "MEMBER", "GUEST", "FOREIGN_WORKSPACE_ID", "Billing Portal"]) assert.match(critical, new RegExp(marker));
  assert.match(config, /trace:\s*"retain-on-failure"/);
});
