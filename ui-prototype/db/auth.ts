import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { hashOpaqueToken, randomOpaqueToken } from "@/app/lib/security";
import { getDb } from "./index";
import { authSessions, rateLimits, users } from "./schema";

const SESSION_LIFETIME_MS = 30 * 86400000;
const SESSION_ROTATION_MS = 24 * 60 * 60 * 1000;

async function newSession(userId: string, rotatedFromSessionId?: string) {
  const createdAt = new Date();
  const id = crypto.randomUUID();
  await getDb().insert(authSessions).values({
    id,
    userId,
    tokenHash: await hashOpaqueToken(randomOpaqueToken()),
    expiresAt: new Date(createdAt.getTime() + SESSION_LIFETIME_MS),
    rotatedFromSessionId,
    createdAt,
    lastSeenAt: createdAt,
  });
  return getDb().select().from(authSessions).where(eq(authSessions.id, id)).get();
}

export async function resolveProviderSession(userId: string) {
  const latest = await getDb().select().from(authSessions).where(eq(authSessions.userId, userId)).orderBy(desc(authSessions.createdAt)).get();
  if (!latest) return { kind: "ok" as const, session: await newSession(userId) };
  if (latest.revokedAt) return { kind: "revoked" as const };
  const now = new Date();
  if (latest.expiresAt <= now || now.getTime() - latest.createdAt.getTime() >= SESSION_ROTATION_MS) {
    await getDb().batch([
      getDb().update(authSessions).set({ revokedAt: now }).where(eq(authSessions.id, latest.id)),
      getDb().insert(authSessions).values({
        id: crypto.randomUUID(),
        userId,
        tokenHash: await hashOpaqueToken(randomOpaqueToken()),
        expiresAt: new Date(now.getTime() + SESSION_LIFETIME_MS),
        rotatedFromSessionId: latest.id,
        createdAt: now,
        lastSeenAt: now,
      }),
    ]);
    const session = await getDb().select().from(authSessions).where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, now))).orderBy(desc(authSessions.createdAt)).get();
    return { kind: "ok" as const, session };
  }
  await getDb().update(authSessions).set({ lastSeenAt: now }).where(eq(authSessions.id, latest.id)).run();
  return { kind: "ok" as const, session: latest };
}

export async function establishProviderSession(userId: string) {
  const now = new Date();
  await getDb().update(authSessions).set({ revokedAt: now }).where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt))).run();
  return newSession(userId);
}

export async function listProviderSessions(userId: string) {
  return getDb().select({ id: authSessions.id, provider: authSessions.provider, expiresAt: authSessions.expiresAt, lastSeenAt: authSessions.lastSeenAt, revokedAt: authSessions.revokedAt, createdAt: authSessions.createdAt })
    .from(authSessions).where(eq(authSessions.userId, userId)).orderBy(desc(authSessions.createdAt)).all();
}

export async function revokeProviderSession(userId: string, sessionId: string) {
  return Boolean(await getDb().update(authSessions).set({ revokedAt: new Date() }).where(and(eq(authSessions.id, sessionId), eq(authSessions.userId, userId), isNull(authSessions.revokedAt))).returning({ id: authSessions.id }).get());
}

export async function markProviderEmailVerified(userId: string) {
  return getDb().update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId)).returning({ verifiedAt: users.emailVerifiedAt }).get();
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStartedAt = new Date(Math.floor(now / windowMs) * windowMs);
  await getDb().insert(rateLimits).values({ key, windowStartedAt, count: 1, updatedAt: new Date(now) }).onConflictDoUpdate({
    target: [rateLimits.key, rateLimits.windowStartedAt],
    set: { count: sql`${rateLimits.count} + 1`, updatedAt: new Date(now) },
  });
  const row = await getDb().select().from(rateLimits).where(and(eq(rateLimits.key, key), eq(rateLimits.windowStartedAt, windowStartedAt))).get();
  const allowed = Number(row?.count ?? limit + 1) <= limit && (!row?.blockedUntil || row.blockedUntil.getTime() <= now);
  if (!allowed && !row?.blockedUntil) await getDb().update(rateLimits).set({ blockedUntil: new Date(windowStartedAt.getTime() + windowMs) }).where(and(eq(rateLimits.key, key), eq(rateLimits.windowStartedAt, windowStartedAt))).run();
  return { allowed, retryAfterSeconds: Math.max(1, Math.ceil((windowStartedAt.getTime() + windowMs - now) / 1000)) };
}
