import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "./index";
import { activityEvents, users } from "./schema";
import { authorizeWorkspace } from "./authorization";
import { getWorkspaceEntitlements } from "./billing";

export async function recordActivity(workspaceId: string, actorUserId: string | null, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  await getDb().insert(activityEvents).values({ id: crypto.randomUUID(), workspaceId, actorUserId, action, targetType, targetId, metadata });
}
export async function listActivity(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "audit.read")) return null;
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  const cutoff = new Date(Date.now() - 30 * 86400000);
  const rows = await getDb().select({ event: activityEvents, actorName: users.name }).from(activityEvents).leftJoin(users, eq(activityEvents.actorUserId, users.id)).where(and(eq(activityEvents.workspaceId, workspaceId), entitlements.canReadFullActivity ? undefined : gt(activityEvents.createdAt, cutoff))).orderBy(desc(activityEvents.createdAt)).limit(100).all();
  return rows.map(({ event, actorName }: { event: typeof activityEvents.$inferSelect; actorName: string | null }) => ({ id: event.id, action: event.action, targetType: event.targetType, targetId: event.targetId, actorName, metadata: event.metadata, createdAt: event.createdAt.toISOString() }));
}
