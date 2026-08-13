import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { workspaceDeletionPlan } from "../../db/deletion-worker";

test("scheduled deletion purges only the due workspace and keeps a tombstone", async () => {
  const database = new DatabaseSync(":memory:"); database.exec("PRAGMA foreign_keys=ON");
  const migrations = (await readdir(new URL("../../drizzle/", import.meta.url))).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
  for (const migration of migrations) {
    const sql = await readFile(new URL(`../../drizzle/${migration}`, import.meta.url), "utf8");
    for (const statement of sql.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) database.exec(statement);
  }
  database.exec(await readFile(new URL("../../db/seed/demo.sql", import.meta.url), "utf8"));
  const now = new Date("2026-08-13T00:00:00Z"); const due = now.getTime() - 1;
  database.prepare("UPDATE workspaces SET deletion_requested_at = ?, deletion_scheduled_for = ? WHERE id = 'ws_demo'").run(due - 30 * 86400000, due);
  database.exec("BEGIN");
  try { for (const statement of workspaceDeletionPlan("ws_demo", now)) database.prepare(statement.sql).run(...statement.params); database.exec("COMMIT"); } catch (error) { database.exec("ROLLBACK"); throw error; }
  const count = (sql: string) => (database.prepare(sql).get() as { count: number }).count;
  assert.equal(count("SELECT count(*) AS count FROM workspaces WHERE id = 'ws_demo'"), 0);
  assert.equal(count("SELECT count(*) AS count FROM tasks WHERE workspace_id = 'ws_demo'"), 0);
  assert.equal(count("SELECT count(*) AS count FROM workspace_tombstones WHERE workspace_id = 'ws_demo'"), 1);
  assert.equal(count("SELECT count(*) AS count FROM workspaces WHERE id = 'ws_other'"), 1);
  assert.equal(count("SELECT count(*) AS count FROM tasks WHERE workspace_id = 'ws_other'"), 1);
  assert.deepEqual(database.prepare("PRAGMA foreign_key_check").all(), []);
});
