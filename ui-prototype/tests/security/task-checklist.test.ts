import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { MAX_CHECKLIST_ITEMS_PER_TASK } from "../../db/task-checklist";

test("checklist has bounded input and server-only database access", async () => {
  assert.equal(MAX_CHECKLIST_ITEMS_PER_TASK, 100);
  const migration = await readFile(new URL("../../supabase/migrations/20260816130000_task_checklist.sql", import.meta.url), "utf8");
  assert.match(migration, /char_length\(title\) between 1 and 240/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on public\.task_checklist_items from anon, authenticated/);
  assert.match(migration, /foreign key \(workspace_id, task_id\) references public\.tasks\(workspace_id, id\)/);
});

test("every checklist operation is scoped to workspace and task", async () => {
  const source = await readFile(new URL("../../db/task-checklist.ts", import.meta.url), "utf8");
  assert.match(source, /eq\(tasks\.workspaceId, workspaceId\)/);
  assert.match(source, /eq\(taskChecklistItems\.workspaceId, workspaceId\)/);
  assert.match(source, /eq\(taskChecklistItems\.taskId, taskId\)/);
  assert.match(source, /authorizeProject\(workspaceId, task\.projectId, userId, permission\)/);
  assert.match(source, /"task\.update"/);
});
