import { expect, test, type Page } from "@playwright/test";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";

const workspaceId = process.env.E2E_WORKSPACE_ID;
const foreignWorkspaceId = process.env.E2E_FOREIGN_WORKSPACE_ID;
const taskId = process.env.E2E_TASK_ID;

function credentials(role: Role) {
  return {
    email: process.env[`E2E_${role}_EMAIL`],
    password: process.env[`E2E_${role}_PASSWORD`],
  };
}

async function login(page: Page, role: Role) {
  const account = credentials(role);
  if (!account.email || !account.password) throw new Error(`Missing E2E ${role} credentials`);
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel(/Mật khẩu/).fill(account.password);
  await page.getByRole("button", { name: /^Đăng nhập/i }).click();
  await page.waitForURL(/\/app(?:\/|$)/, { timeout: 20_000 });
  await page.waitForLoadState("networkidle");
}

async function browserGet(page: Page, path: string) {
  return page.evaluate(async (requestPath) => {
    const response = await fetch(requestPath, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
    });
    return { status: response.status, body: await response.json() };
  }, path);
}

async function browserMutation(page: Page, path: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return page.evaluate(async ({ requestPath, requestBody, requestHeaders }) => {
    const response = await fetch(requestPath, {
      method: "POST",
      credentials: "same-origin",
      headers: { accept: "application/json", "content-type": "application/json", ...requestHeaders },
      body: JSON.stringify(requestBody),
    });
    return { status: response.status, body: await response.json() };
  }, { requestPath: path, requestBody: body, requestHeaders: headers });
}

test.describe("authenticated production-critical flows", () => {
  test.skip(process.env.E2E_RUN_AUTH !== "true", "Set E2E_RUN_AUTH=true with dedicated staging accounts.");

  for (const role of ["OWNER", "ADMIN", "MEMBER", "GUEST"] as const) {
    test(`${role} is authenticated and billing follows the role matrix`, async ({ page }) => {
      test.skip(!workspaceId || !credentials(role).email || !credentials(role).password, `Missing ${role} fixture environment.`);
      await login(page, role);

      const workspaces = await browserGet(page, "/api/v1/workspaces");
      expect(workspaces.status).toBe(200);
      const workspaceBody = workspaces.body;
      expect(workspaceBody.data.some((workspace: { id: string; role: Role }) => workspace.id === workspaceId && workspace.role === role)).toBe(true);

      const billing = await browserGet(page, `/api/v1/workspaces/${workspaceId}/billing`);
      expect(billing.status).toBe(role === "OWNER" ? 200 : 403);
    });
  }

  test("tenant isolation rejects a workspace from another account", async ({ page }) => {
    test.skip(!workspaceId || !foreignWorkspaceId || !credentials("MEMBER").email || !credentials("MEMBER").password, "Missing tenant isolation fixtures.");
    await login(page, "MEMBER");
    const own = await browserGet(page, `/api/v1/workspaces/${workspaceId}/projects`);
    expect(own.status).toBe(200);
    const foreign = await browserGet(page, `/api/v1/workspaces/${foreignWorkspaceId}/projects`);
    expect(foreign.status).toBe(404);
  });

  test("same idempotency key creates exactly one project and rejects payload reuse", async ({ page }) => {
    test.skip(!workspaceId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing Owner fixture environment.");
    await login(page, "OWNER");
    const key = crypto.randomUUID();
    const path = `/api/v1/workspaces/${workspaceId}/projects`;
    const payload = { name: `Idempotency E2E ${Date.now()}`, description: "concurrent replay", visibility: "WORKSPACE" };
    const [left, right] = await Promise.all([
      browserMutation(page, path, payload, { "idempotency-key": key }),
      browserMutation(page, path, payload, { "idempotency-key": key }),
    ]);
    expect([left.status, right.status].sort()).toEqual([201, 201]);
    expect(left.body.data.id).toBe(right.body.data.id);
    const mismatch = await browserMutation(page, path, { ...payload, name: `${payload.name} changed` }, { "idempotency-key": key });
    expect(mismatch.status).toBe(409);
    expect(mismatch.body.error.code).toBe("IDEMPOTENCY_PAYLOAD_MISMATCH");
  });

  test("optimistic task concurrency accepts one writer and rejects the stale writer", async ({ page }) => {
    test.skip(!workspaceId || !taskId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing task concurrency fixtures.");
    await login(page, "OWNER");
    const current = await browserGet(page, `/api/v1/workspaces/${workspaceId}/tasks/${taskId}`);
    expect(current.status).toBe(200);
    const path = `/api/v1/workspaces/${workspaceId}/tasks/${taskId}`;
    const version = current.body.data.version;
    const results = await page.evaluate(async ({ requestPath, expectedVersion }) => {
      const update = async (title: string) => {
        const response = await fetch(requestPath, { method: "PATCH", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, expectedVersion }) });
        return { status: response.status, body: await response.json() };
      };
      return Promise.all([update(`Race left ${Date.now()}`), update(`Race right ${Date.now()}`)]);
    }, { requestPath: path, expectedVersion: version });
    expect(results.map((result) => result.status).sort()).toEqual([200, 409]);
    expect(results.find((result) => result.status === 409)?.body.error.code).toBe("TASK_VERSION_CONFLICT");
  });

  test("Owner sees active Stripe entitlement and Billing Portal entry", async ({ page }) => {
    test.skip(!workspaceId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing Owner fixture environment.");
    await login(page, "OWNER");
    await page.goto("/app/settings");
    await expect(page.getByRole("heading", { name: "Gói & thanh toán" })).toBeVisible();
    await expect(page.getByText("PRO", { exact: true })).toBeVisible();
    await expect(page.getByText("active", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Quản lý trong Billing Portal" })).toBeVisible();
  });

  test("Owner uploads and downloads a private task attachment", async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!workspaceId || !taskId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing attachment fixture environment.");
    await login(page, "OWNER");
    await page.goto(`/app/tasks/${taskId}`);
    await expect(page.getByRole("heading", { name: "Tệp đính kèm" })).toBeVisible({ timeout: 20_000 });
    await page.locator('input[type="file"]').setInputFiles({
      name: "staging-e2e.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("TaskFlow staging attachment E2E"),
    });
    await expect(page.getByText("staging-e2e.txt", { exact: true })).toBeVisible({ timeout: 20_000 });
    const downloadResponse = page.waitForResponse((response) => response.url().includes(`/attachments/`) && response.url().endsWith("/download") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Tải staging-e2e.txt" }).click();
    expect((await downloadResponse).status()).toBe(200);
    await page.getByRole("button", { name: "Xóa staging-e2e.txt" }).click();
    await expect(page.getByText("staging-e2e.txt", { exact: true })).toHaveCount(0);
  });

  test("Owner creates, completes, and removes a task checklist item", async ({ page }) => {
    test.setTimeout(90_000);
    test.skip(!workspaceId || !taskId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing checklist fixture environment.");
    const title = `Checklist staging E2E ${Date.now()}`;
    await login(page, "OWNER");
    await page.goto(`/app/tasks/${taskId}`);
    await expect(page.getByRole("heading", { name: "Checklist" })).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Thêm mục checklist").fill(title);
    await page.getByRole("button", { name: "Thêm mục" }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 20_000 });
    const checkbox = page.getByRole("checkbox", { name: `Đánh dấu ${title}` });
    await checkbox.check();
    await expect(checkbox).toBeChecked({ timeout: 20_000 });
    await page.getByRole("button", { name: `Xóa mục ${title}` }).click();
    await expect(page.getByText(title, { exact: true })).toHaveCount(0, { timeout: 20_000 });
  });

  test("Owner sees task deadlines in the calendar", async ({ page }) => {
    test.skip(!workspaceId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing calendar fixture environment.");
    await login(page, "OWNER");
    await page.goto("/app/calendar");
    await expect(page.getByRole("heading", { name: "Lịch công việc" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Tháng trước" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tháng sau" })).toBeVisible();
    await expect(page.getByText("Cần chú ý", { exact: true })).toBeVisible();
  });
});
