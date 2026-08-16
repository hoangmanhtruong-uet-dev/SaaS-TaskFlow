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
    test.skip(!workspaceId || !taskId || !credentials("OWNER").email || !credentials("OWNER").password, "Missing attachment fixture environment.");
    await login(page, "OWNER");
    await page.goto(`/app/tasks/${taskId}`);
    await expect(page.getByRole("heading", { name: "Tệp đính kèm" })).toBeVisible();
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
});
