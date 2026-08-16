import { createHash } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "./index";
import { idempotencyRecords } from "./schema";

const KEY_PATTERN = /^[A-Za-z0-9._:-]{8,200}$/;
const RECORD_TTL_MS = 24 * 60 * 60 * 1000;

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}

export function hashIdempotencyPayload(value: unknown) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function readIdempotencyKey(request: Request) {
  const key = request.headers.get("idempotency-key")?.trim() ?? "";
  return KEY_PATTERN.test(key) ? key : null;
}

export type IdempotentResult<T extends Record<string, unknown>> =
  | { kind: "executed" | "replayed"; status: number; body: T }
  | { kind: "mismatch" };

export async function executeIdempotent<T extends Record<string, unknown>>(input: {
  workspaceId: string;
  actorUserId: string;
  key: string;
  operation: string;
  payload: unknown;
  execute: (transaction: ReturnType<typeof getDb>) => Promise<{ status: number; body: T }>;
}): Promise<IdempotentResult<T>> {
  const requestHash = hashIdempotencyPayload(input.payload);
  const lockKey = `${input.workspaceId}:${input.actorUserId}:${input.operation}:${input.key}`;

  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    await transaction.execute(sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);
    await transaction.delete(idempotencyRecords).where(and(
      eq(idempotencyRecords.workspaceId, input.workspaceId),
      eq(idempotencyRecords.key, input.key),
      eq(idempotencyRecords.operation, input.operation),
      lt(idempotencyRecords.expiresAt, new Date()),
    ));

    const existing = await transaction.select().from(idempotencyRecords).where(and(
      eq(idempotencyRecords.workspaceId, input.workspaceId),
      eq(idempotencyRecords.key, input.key),
      eq(idempotencyRecords.operation, input.operation),
    )).get();

    if (existing) {
      if (existing.actorUserId !== input.actorUserId || existing.requestHash !== requestHash) return { kind: "mismatch" as const };
      if (existing.completedAt && existing.responseStatus && existing.responseBody) {
        return { kind: "replayed" as const, status: existing.responseStatus, body: existing.responseBody as T };
      }
      throw new Error("Incomplete idempotency record encountered inside serialized transaction");
    }

    await transaction.insert(idempotencyRecords).values({
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      key: input.key,
      operation: input.operation,
      requestHash,
      responseHash: requestHash,
      expiresAt: new Date(Date.now() + RECORD_TTL_MS),
    });

    const result = await input.execute(transaction);
    const responseHash = hashIdempotencyPayload(result.body);
    await transaction.update(idempotencyRecords).set({
      responseHash,
      responseStatus: result.status,
      responseBody: result.body,
      completedAt: new Date(),
    }).where(and(
      eq(idempotencyRecords.workspaceId, input.workspaceId),
      eq(idempotencyRecords.key, input.key),
      eq(idempotencyRecords.operation, input.operation),
    ));
    return { kind: "executed" as const, ...result };
  });
}
