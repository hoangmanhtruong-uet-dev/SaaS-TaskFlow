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

export async function purgeWorkspace(database: D1Database, workspaceId: string, deletedAt = new Date()) {
  const statements = workspaceDeletionPlan(workspaceId, deletedAt).map((statement) => database.prepare(statement.sql).bind(...statement.params));
  await database.batch(statements);
}

export async function purgeDueWorkspaces(database: D1Database, now = new Date()) {
  const dueBefore = now.getTime();
  const due = await database.prepare("SELECT id FROM workspaces WHERE deletion_requested_at IS NOT NULL AND deletion_scheduled_for IS NOT NULL AND deletion_scheduled_for <= ? LIMIT 25").bind(dueBefore).all<{ id: string }>();
  for (const workspace of due.results) await purgeWorkspace(database, workspace.id, now);
  await database.prepare("DELETE FROM rate_limits WHERE updated_at < ?").bind(now.getTime() - RETENTION_MS).run();
  return due.results.length;
}
