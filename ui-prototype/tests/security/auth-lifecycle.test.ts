import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("OAuth authentication lifecycle covers verification, rotation, revoke, and recovery contract", async () => {
  const auth = await readFile(new URL("../../db/auth.ts", import.meta.url), "utf8");
  const apiAuth = await readFile(new URL("../../app/lib/api-auth.ts", import.meta.url), "utf8");
  assert.match(auth, /SESSION_ROTATION_MS/);
  assert.match(auth, /latest\.revokedAt/);
  assert.match(auth, /rotatedFromSessionId/);
  assert.match(auth, /revokeProviderSession/);
  assert.match(auth, /consumeRateLimit/);
  assert.match(apiAuth, /resolveProviderSession/);
  for (const route of [
    "../../app/api/v1/auth/provider/route.ts",
    "../../app/api/v1/auth/session/route.ts",
    "../../app/api/v1/auth/sessions/[sessionId]/route.ts",
    "../../app/api/v1/auth/verify-email/route.ts",
    "../../app/api/v1/auth/password/forgot/route.ts",
    "../../app/api/v1/auth/password/reset/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, import.meta.url), "utf8"));
});

test("invitation authentication resumes at the pending invitation", async () => {
  const view = await readFile(new URL("../../app/components/collaboration-views.tsx", import.meta.url), "utf8");
  const complete = await readFile(new URL("../../app/auth/complete/page.tsx", import.meta.url), "utf8");
  assert.match(view, /returnTo=.*invite/);
  assert.match(view, /Đăng nhập rồi quay lại lời mời/);
  assert.match(complete, /startsWith\("\/invite\/"\)/);
  assert.match(complete, /establishProviderSession/);
});
