import { and, eq, isNotNull, lt } from "drizzle-orm";
import { getDb } from "./index";
import { memberships, rateLimits, workspaceTombstones, workspaces } from "./schema";

const RETENTION_MS = 30 * 86400000;

export function workspaceDeletionPlan(workspaceId: string, deletedAt = new Date()) {
  const timestamp = deletedAt.getTime();
  return [
    { sql: `INSERT OR REPLACE INTO workspace_tombstones (workspace_id, name, slug, requested_at, deleted_at, owner_user_id, metadata)
      SELECT w.id, w.name, w.slug, w.deletion_requested_at, ?,
        (SELECT m.user_id FROM memberships m WHERE m.workspace_id = w.id AND m.role = 'OWNER' LIMIT 1),
        json_object('reason', 'scheduled_deletion', 'retentionDays', 30)
      FROM workspaces w WHERE w.id = ? AND w.deletion_scheduled_for <= ?`, params: [timestamp, workspaceId, timestamp] },
    ...[
      "DELETE FROM task_labels WHERE task_id IN (SELECT id FROM tasks WHERE workspace_id = ?)",
      "DELETE FROM task_assignees WHERE task_id IN (SELECT id FROM tasks WHERE workspace_id = ?)",
      "DELETE FROM comments WHERE workspace_id = ?", "DELETE FROM attachments WHERE workspace_id = ?",
      "DELETE FROM tasks WHERE workspace_id = ?",
      "DELETE FROM project_members WHERE project_id IN (SELECT id FROM projects WHERE workspace_id = ?)",
      "DELETE FROM columns WHERE workspace_id = ?", "DELETE FROM boards WHERE workspace_id = ?",
      "DELETE FROM projects WHERE workspace_id = ?", "DELETE FROM labels WHERE workspace_id = ?",
      "DELETE FROM invitations WHERE workspace_id = ?", "DELETE FROM notifications WHERE workspace_id = ?",
      "DELETE FROM subscriptions WHERE workspace_id = ?", "DELETE FROM idempotency_records WHERE workspace_id = ?",
      "DELETE FROM outbox_events WHERE workspace_id = ?", "DELETE FROM activity_events WHERE workspace_id = ?",
      "DELETE FROM memberships WHERE workspace_id = ?",
    ].map((sql) => ({ sql, params: [workspaceId] })),
    { sql: "DELETE FROM workspaces WHERE id = ? AND deletion_scheduled_for <= ?", params: [workspaceId, timestamp] },
  ];
}

export async function purgeWorkspace(workspaceId: string, deletedAt = new Date()) {
  const db = getDb();
  const workspace = await db.select().from(workspaces).where(and(eq(workspaces.id, workspaceId), isNotNull(workspaces.deletionScheduledFor), lt(workspaces.deletionScheduledFor, deletedAt))).get();
  if (!workspace) return false;
  const owner = await db.select({ userId: memberships.userId }).from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.role, "OWNER"))).limit(1).get();
  await db.batch([
    db.insert(workspaceTombstones).values({ workspaceId, name: workspace.name, slug: workspace.slug, requestedAt: workspace.deletionRequestedAt ?? deletedAt, deletedAt, ownerUserId: owner?.userId, metadata: { reason: "scheduled_deletion", retentionDays: 30 } }).onConflictDoNothing(),
    db.delete(workspaces).where(and(eq(workspaces.id, workspaceId), isNotNull(workspaces.deletionScheduledFor), lt(workspaces.deletionScheduledFor, deletedAt))),
  ]);
  return true;
}

export async function purgeDueWorkspaces(now = new Date()) {
  const db = getDb();
  const due = await db.select({ id: workspaces.id }).from(workspaces).where(and(isNotNull(workspaces.deletionRequestedAt), isNotNull(workspaces.deletionScheduledFor), lt(workspaces.deletionScheduledFor, now))).limit(25).all();
  let purged = 0;
  for (const workspace of due as Array<{ id: string }>) if (await purgeWorkspace(workspace.id, now)) purged += 1;
  await db.delete(rateLimits).where(lt(rateLimits.updatedAt, new Date(now.getTime() - RETENTION_MS))).run();
  return purged;
}
