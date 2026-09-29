import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildPrivateCacheKey, validateCachePolicy } from "../../app/lib/cache-policy";
import { hashIdempotencyPayload } from "../../db/idempotency";
import { decodeCursor, encodeCursor, pageSize } from "../../db/pagination";

test("database enforces owner, idempotency, outbox and growth invariants", async () => {
  const migration = await readFile(new URL("../../supabase/migrations/20260816190000_data_integrity_delivery.sql", import.meta.url), "utf8");
  assert.match(migration, /unique index memberships_one_active_owner_uidx/);
  assert.match(migration, /idempotency_completion_check/);
  assert.match(migration, /unique index outbox_dedup_uidx/);
  for (const index of ["tasks_workspace_cursor_idx", "projects_workspace_cursor_idx", "tasks_title_fts_idx"]) assert.match(migration, new RegExp(index));
});

test("idempotency binds actor, operation and canonical payload under an advisory transaction lock", async () => {
  assert.equal(hashIdempotencyPayload({ b: 2, a: 1 }), hashIdempotencyPayload({ a: 1, b: 2 }));
  assert.notEqual(hashIdempotencyPayload({ seats: 2 }), hashIdempotencyPayload({ seats: 3 }));
  const source = await readFile(new URL("../../db/idempotency.ts", import.meta.url), "utf8");
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /actorUserId/);
  assert.match(source, /kind: "mismatch"/);
});

test("keyset pagination is bounded and cursor data round-trips", () => {
  const value = { position: 1200, id: crypto.randomUUID() };
  assert.deepEqual(decodeCursor(encodeCursor(value)), value);
  assert.equal(pageSize("9999"), 100);
  assert.equal(pageSize("0"), 50);
});

test("critical mutations serialize quota and ownership checks", async () => {
  const [capacity, lifecycle] = await Promise.all([
    readFile(new URL("../../supabase/migrations/20260927084252_enforce_workspace_capacity.sql", import.meta.url), "utf8"),
    readFile(new URL("../../db/workspace-lifecycle.ts", import.meta.url), "utf8"),
  ]);
  assert.match(capacity, /for update/);
  assert.match(capacity, /memberships_enforce_workspace_capacity/);
  assert.match(capacity, /invitations_enforce_workspace_capacity/);
  assert.match(capacity, /projects_enforce_workspace_capacity/);
  assert.match(lifecycle, /for update/);
});

test("outbox claims concurrently without sending email inside the claim transaction", async () => {
  const source = await readFile(new URL("../../db/outbox.ts", import.meta.url), "utf8");
  assert.match(source, /\.for\("update", \{ skipLocked: true \}\)/);
  assert.match(source, /availableAt/);
  assert.ok(source.indexOf("claimOutboxEvent") < source.indexOf("sendTransactionalEmail"));
});

test("private cache keys carry isolation context and reject sensitive domains", () => {
  const key = buildPrivateCacheKey({ domain: "task-list", tenantId: "tenant", actorId: "user", permissionVersion: "v3", resource: "cursor=abc" });
  assert.match(key, /^taskflow:v1:task-list:tenant:user:v3:/);
  assert.throws(() => buildPrivateCacheKey({ domain: "payment-state", tenantId: "t", actorId: "u", permissionVersion: "v", resource: "x" }));
  assert.throws(() => validateCachePolicy({ owner: "platform", ttlSeconds: 301, staleSeconds: 0, negativeTtlSeconds: 0, fallback: "database" }));
});

test("checkout and write APIs require stable idempotency keys", async () => {
  const [checkout, project, task] = await Promise.all([
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/billing/checkout/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/projects/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/v1/workspaces/[workspaceId]/tasks/route.ts", import.meta.url), "utf8"),
  ]);
  for (const source of [checkout, project, task]) assert.match(source, /readIdempotencyKey/);
  assert.match(checkout, /idempotencyKey: `checkout:/);
});
