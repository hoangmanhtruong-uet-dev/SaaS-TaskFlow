import { expect, test } from "@playwright/test";

test("marketing, authentication, and liveness are available", async ({ page, request }) => {
  const live = await request.get("/api/health/live");
  expect(live.status()).toBe(200);
  expect(live.headers()["cache-control"]).toContain("no-store");
  const liveBody = await live.json();
  expect(liveBody).toMatchObject({ status: "ok", service: "taskflow-web" });
  expect(liveBody.requestId).toMatch(/^req_/);

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Đăng nhập TaskFlow/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel(/Mật khẩu/)).toBeVisible();
});

test("protected API rejects anonymous access without leaking internals", async ({ request }) => {
  const response = await request.get("/api/v1/workspaces");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error.code).toBe("AUTH_REQUIRED");
  expect(body.meta.requestId).toMatch(/^req_/);
  expect(JSON.stringify(body)).not.toMatch(/SUPABASE|postgresql:|service.role|stack/i);
  const cron = await request.get("/api/internal/jobs/workspace-deletion");
  expect(cron.status()).toBe(401);
  await expect(cron.json()).resolves.toMatchObject({ error: { code: "AUTH_REQUIRED" } });
});

test("readiness reports dependency state without credentials or stack traces", async ({ request }) => {
  const response = await request.get("/api/health/ready");
  expect([200, 503]).toContain(response.status());
  if (process.env.E2E_REQUIRE_READY === "true") expect(response.status()).toBe(200);
  const body = await response.json();
  expect(["ready", "not_ready"]).toContain(body.status);
  expect(JSON.stringify(body)).not.toMatch(/postgresql:|password|secret|stack/i);
});

test("Stripe webhook rejects an invalid signature", async ({ request }) => {
  const response = await request.post("/api/v1/webhooks/stripe", {
    data: { type: "customer.subscription.updated" },
    headers: { "stripe-signature": "invalid" },
  });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: "Invalid Stripe signature" });
});
