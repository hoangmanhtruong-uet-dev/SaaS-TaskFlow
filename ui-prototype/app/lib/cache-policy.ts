import { createHash } from "node:crypto";

export type CachePolicy = Readonly<{
  owner: string;
  ttlSeconds: number;
  staleSeconds: number;
  negativeTtlSeconds: number;
  fallback: "database" | "fail-closed";
}>;

const FORBIDDEN_DOMAINS = new Set(["authorization", "billing-balance", "payment-state", "session"]);

/** Builds a tenant/actor/permission-scoped key for any future shared cache. */
export function buildPrivateCacheKey(input: {
  domain: string;
  tenantId: string;
  actorId: string;
  permissionVersion: string;
  resource: string;
}) {
  if (FORBIDDEN_DOMAINS.has(input.domain)) throw new Error(`${input.domain} must not use a shared response cache`);
  for (const [name, value] of Object.entries(input)) if (!value.trim()) throw new Error(`Missing cache key context: ${name}`);
  const resourceHash = createHash("sha256").update(input.resource).digest("hex").slice(0, 24);
  return `taskflow:v1:${input.domain}:${input.tenantId}:${input.actorId}:${input.permissionVersion}:${resourceHash}`;
}

export function validateCachePolicy(policy: CachePolicy) {
  if (!policy.owner.trim()) throw new Error("Cache policy owner is required");
  if (!Number.isInteger(policy.ttlSeconds) || policy.ttlSeconds < 1 || policy.ttlSeconds > 300) throw new Error("Cache TTL must be 1-300 seconds");
  if (policy.staleSeconds < 0 || policy.staleSeconds > policy.ttlSeconds) throw new Error("Invalid stale window");
  if (policy.negativeTtlSeconds < 0 || policy.negativeTtlSeconds > 15) throw new Error("Negative-cache TTL must be 0-15 seconds");
  return policy;
}
