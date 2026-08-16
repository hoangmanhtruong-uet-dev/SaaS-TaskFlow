import { and, asc, eq, isNull, lt, lte, or } from "drizzle-orm";
import { invitationEmail } from "@/app/lib/email-templates";
import { sendTransactionalEmail } from "@/app/lib/email";
import { getDb } from "./index";
import { outboxEvents } from "./schema";

const LOCK_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

type InvitationPayload = {
  to: string;
  inviterName: string;
  workspaceName: string;
  role: "ADMIN" | "MEMBER" | "GUEST";
  inviteUrl: string;
  expiresAt: string;
  invitationId: string;
};

async function claimOne() {
  const now = new Date();
  const staleLock = new Date(now.getTime() - LOCK_TIMEOUT_MS);
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    const event = await transaction.select().from(outboxEvents).where(and(
      eq(outboxEvents.type, "EMAIL_INVITATION"),
      isNull(outboxEvents.processedAt),
      lte(outboxEvents.availableAt, now),
      lt(outboxEvents.attempts, MAX_ATTEMPTS),
      or(isNull(outboxEvents.lockedAt), lt(outboxEvents.lockedAt, staleLock)),
    )).orderBy(asc(outboxEvents.availableAt), asc(outboxEvents.createdAt)).limit(1).for("update", { skipLocked: true }).get();
    if (!event) return null;
    await transaction.update(outboxEvents).set({ lockedAt: now, attempts: event.attempts + 1, lastError: null }).where(eq(outboxEvents.id, event.id));
    return { ...event, attempts: event.attempts + 1 };
  });
}

async function deliver(event: typeof outboxEvents.$inferSelect) {
  if (event.type !== "EMAIL_INVITATION") throw new Error(`Unsupported outbox event type: ${event.type}`);
  const payload = event.payload as Partial<InvitationPayload>;
  if (!payload.to || !payload.inviterName || !payload.workspaceName || !payload.role || !payload.inviteUrl || !payload.expiresAt || !payload.invitationId) throw new Error("Invalid invitation outbox payload");
  const message = invitationEmail({ inviterName: payload.inviterName, workspaceName: payload.workspaceName, role: payload.role, inviteUrl: payload.inviteUrl, expiresAt: new Date(payload.expiresAt) });
  await sendTransactionalEmail({ to: payload.to, ...message, idempotencyKey: `invitation-${payload.invitationId}` });
}

export async function processOutbox(limit = 25) {
  const boundedLimit = Math.min(Math.max(limit, 1), 100);
  let processed = 0;
  let failed = 0;
  for (let index = 0; index < boundedLimit; index += 1) {
    const event = await claimOne();
    if (!event) break;
    try {
      await deliver(event);
      await getDb().update(outboxEvents).set({ processedAt: new Date(), lockedAt: null, lastError: null }).where(eq(outboxEvents.id, event.id)).run();
      processed += 1;
    } catch (error) {
      const retryDelayMs = Math.min(60 * 60 * 1000, 2 ** event.attempts * 30_000);
      await getDb().update(outboxEvents).set({ lockedAt: null, availableAt: new Date(Date.now() + retryDelayMs), lastError: error instanceof Error ? error.message.slice(0, 500) : "Unknown delivery error" }).where(eq(outboxEvents.id, event.id)).run();
      failed += 1;
    }
  }
  return { processed, failed };
}
