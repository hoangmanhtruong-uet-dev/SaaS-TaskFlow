import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { safeReturnPath } from "../../app/lib/auth-redirect";

test("authentication return paths reject external and protocol-relative redirects", () => {
  assert.equal(safeReturnPath("/invite/abc?source=email"), "/invite/abc?source=email");
  assert.equal(safeReturnPath("https://evil.example/steal"), "/app");
  assert.equal(safeReturnPath("//evil.example/steal"), "/app");
  assert.equal(safeReturnPath("/auth/callback?code=stolen"), "/app");
});

test("Supabase authentication covers SSR verification, revoke, and recovery contract", async () => {
  const apiAuth = await readFile(new URL("../../app/lib/api-auth.ts", import.meta.url), "utf8");
  const proxy = await readFile(new URL("../../app/lib/supabase/proxy.ts", import.meta.url), "utf8");
  const callback = await readFile(new URL("../../app/auth/callback/route.ts", import.meta.url), "utf8");
  assert.match(apiAuth, /getAuthenticatedIdentity/);
  assert.match(proxy, /getClaims/);
  assert.match(callback, /exchangeCodeForSession/);
  for (const route of [
    "../../app/api/v1/auth/provider/route.ts",
    "../../app/api/v1/auth/session/route.ts",
    "../../app/api/v1/auth/sessions/[sessionId]/route.ts",
    "../../app/api/v1/auth/verify-email/route.ts",
    "../../app/api/v1/auth/password/forgot/route.ts",
    "../../app/api/v1/auth/password/reset/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, import.meta.url), "utf8"));
});

test("sign out is POST-only so navigation prefetch cannot revoke a session", async () => {
  const [route, shell] = await Promise.all([
    readFile(new URL("../../app/auth/signout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/components/layout/app-shell.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(route, /export async function POST/);
  assert.doesNotMatch(route, /export async function GET/);
  assert.match(shell, /method="post"/);
  assert.doesNotMatch(shell, /<Link href="\/auth\/signout/);
});

test("invitation authentication resumes at the pending invitation", async () => {
  const view = await readFile(new URL("../../app/components/collaboration-views.tsx", import.meta.url), "utf8");
  const complete = await readFile(new URL("../../app/auth/complete/page.tsx", import.meta.url), "utf8");
  assert.match(view, /next=.*invite/);
  assert.match(view, /Đăng nhập rồi quay lại lời mời/);
  assert.match(complete, /safeReturnPath/);
  assert.match(complete, /requireAuthenticatedIdentity/);
});
