import { expect, test, type Page } from "@playwright/test";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";

const workspaceId = process.env.E2E_WORKSPACE_ID;
const foreignWorkspaceId = process.env.E2E_FOREIGN_WORKSPACE_ID;

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
}

test.describe("authenticated production-critical flows", () => {
  test.skip(process.env.E2E_RUN_AUTH !== "true", "Set E2E_RUN_AUTH=true with dedicated staging accounts.");

  for (const role of ["OWNER", "ADMIN", "MEMBER", "GUEST"] as const) {
    test(`${role} is authenticated and billing follows the role matrix`, async ({ page }) => {
      test.skip(!workspaceId || !credentials(role).email || !credentials(role).password, `Missing ${role} fixture environment.`);
      await login(page, role);

      const workspaces = await page.request.get("/api/v1/workspaces");
      expect(workspaces.status()).toBe(200);
      const workspaceBody = await workspaces.json();
      expect(workspaceBody.data.some((workspace: { id: string; role: Role }) => workspace.id === workspaceId && workspace.role === role)).toBe(true);

      const billing = await page.request.get(`/api/v1/workspaces/${workspaceId}/billing`);
      expect(billing.status()).toBe(role === "OWNER" ? 200 : 403);
    });
  }

  test("tenant isolation rejects a workspace from another account", async ({ page }) => {
    test.skip(!workspaceId || !foreignWorkspaceId || !credentials("MEMBER").email || !credentials("MEMBER").password, "Missing tenant isolation fixtures.");
    await login(page, "MEMBER");
    const own = await page.request.get(`/api/v1/workspaces/${workspaceId}/projects`);
    expect(own.status()).toBe(200);
    const foreign = await page.request.get(`/api/v1/workspaces/${foreignWorkspaceId}/projects`);
    expect(foreign.status()).toBe(404);
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
});
