import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { taskDueState } from "../../app/lib/task-dates";

test("deadline labels distinguish overdue, today, tomorrow, and unscheduled tasks", () => {
  const now = new Date(2026, 7, 16, 12);
  assert.equal(taskDueState(null, now).tone, "none");
  assert.equal(taskDueState(new Date(2026, 7, 15).toISOString(), now).tone, "overdue");
  assert.equal(taskDueState(new Date(2026, 7, 16).toISOString(), now).tone, "today");
  assert.equal(taskDueState(new Date(2026, 7, 17).toISOString(), now).label, "Ngày mai");
});

test("deadline reminders are tenant-scoped, recipient-scoped, and idempotent", async () => {
  const [worker, migration, route] = await Promise.all([
    readFile(new URL("../../db/task-reminders.ts", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260816132000_task_deadline_reminders.sql", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/internal/jobs/workspace-deletion/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(worker, /eq\(taskAssignees\.workspaceId, task\.workspaceId\)/);
  assert.match(worker, /onConflictDoNothing/);
  assert.match(worker, /type: "DEADLINE"/);
  assert.match(migration, /unique \(task_id, recipient_user_id, kind, due_at\)/);
  assert.match(migration, /revoke all on public\.task_reminder_deliveries from anon, authenticated/);
  assert.match(route, /secureTokenMatches\(actual, expected\)/);
});
