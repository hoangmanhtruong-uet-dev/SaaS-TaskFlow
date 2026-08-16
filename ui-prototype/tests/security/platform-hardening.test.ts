import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { isTrustedMutationRequest, secureTokenMatches } from "../../app/lib/request-security";

test("unsafe API requests reject explicit cross-site origins and Fetch Metadata", () => {
  assert.equal(isTrustedMutationRequest(new Request("https://taskflow.example/api/v1/workspaces")), true);
  assert.equal(isTrustedMutationRequest(new Request("https://taskflow.example/api/v1/workspaces", {
    method: "POST",
    headers: { origin: "https://taskflow.example", "sec-fetch-site": "same-origin" },
  })), true);
  assert.equal(isTrustedMutationRequest(new Request("https://taskflow.example/api/v1/workspaces", {
    method: "POST",
    headers: { origin: "https://evil.example" },
  })), false);
  assert.equal(isTrustedMutationRequest(new Request("https://taskflow.example/api/v1/workspaces", {
    method: "DELETE",
    headers: { "sec-fetch-site": "cross-site" },
  })), false);
});

test("internal job tokens use digest-based constant-time comparison", async () => {
  assert.equal(await secureTokenMatches("correct-secret", "correct-secret"), true);
  assert.equal(await secureTokenMatches("wrong-secret", "correct-secret"), false);
  assert.equal(await secureTokenMatches(null, "correct-secret"), false);
  assert.equal(await secureTokenMatches("correct-secret", undefined), false);
});

test("platform emits CSP, browser isolation, no-store, and rate-limit headers", async () => {
  const [config, proxy, response] = await Promise.all([
    readFile(new URL("../../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../../proxy.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/lib/api-response.ts", import.meta.url), "utf8"),
  ]);
  for (const directive of ["Content-Security-Policy", "object-src 'none'", "frame-ancestors 'none'", "Strict-Transport-Security", "Permissions-Policy", "Cross-Origin-Opener-Policy"])
    assert.match(config, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(proxy, /isTrustedMutationRequest/);
  assert.match(proxy, /CROSS_SITE_REQUEST_BLOCKED/);
  assert.match(response, /cache-control.*no-store/);
  assert.match(response, /retry-after/);
});

async function routeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(target) : entry.name === "route.ts" ? [target] : [];
  }));
  return nested.flat();
}

test("every mutation route has an explicit authentication or signature boundary", async () => {
  const apiRoot = path.resolve(import.meta.dirname, "../../app/api");
  const mutations = [] as string[];
  for (const file of await routeFiles(apiRoot)) {
    const source = await readFile(file, "utf8");
    if (!/export async function (POST|PUT|PATCH|DELETE)/.test(source)) continue;
    const isPublicAuthFlow = file.includes(`${path.sep}auth${path.sep}`) && file.includes(`${path.sep}api${path.sep}v1${path.sep}`);
    const protectedBoundary = /getApiUser|constructEvent|secureTokenMatches/.test(source);
    if (!isPublicAuthFlow && !protectedBoundary) mutations.push(path.relative(apiRoot, file));
  }
  assert.deepEqual(mutations, []);
});

test("high-cost and identity endpoints are database rate limited without storing raw emails", async () => {
  const [verifyEmail, workspaces, checkout, portal] = await Promise.all([
    readFile(new URL("../../app/api/v1/auth/verify-email/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/billing/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/billing/portal/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(verifyEmail, /hashOpaqueToken\(email\)/);
  assert.match(verifyEmail, /consumeRateLimit/);
  assert.doesNotMatch(verifyEmail, /auth:verify:\$\{email\}/);
  assert.match(workspaces, /workspace:create:/);
  assert.match(checkout, /billing:session:/);
  assert.match(portal, /billing:session:/);
});
