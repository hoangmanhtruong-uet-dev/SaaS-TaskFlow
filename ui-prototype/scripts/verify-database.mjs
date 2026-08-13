import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync(":memory:");
database.exec("PRAGMA foreign_keys=ON");

async function applyMigration(file) {
  const sql = await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8");
  for (const statement of sql.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) database.exec(statement);
}

const migrations = (await readdir(new URL("../drizzle/", import.meta.url))).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
assert.ok(migrations.length >= 3, "Expected versioned migrations");
await applyMigration(migrations[0]);
await applyMigration(migrations[1]);

database.exec(`
  INSERT INTO users (id, provider_user_id, email, email_normalized, name) VALUES ('legacy_user', 'legacy', 'legacy@example.com', 'legacy@example.com', 'Legacy');
  INSERT INTO workspaces (id, name, slug) VALUES ('legacy_ws', 'Legacy', 'legacy');
  INSERT INTO memberships (id, workspace_id, user_id, role) VALUES ('legacy_mem', 'legacy_ws', 'legacy_user', 'OWNER');
  INSERT INTO auth_sessions (id, user_id) VALUES ('legacy_session', 'legacy_user');
  INSERT INTO outbox_events (id, workspace_id, type, payload) VALUES ('legacy_event', 'legacy_ws', 'LEGACY', '{}');
`);

for (const migration of migrations.slice(2)) await applyMigration(migration);
assert.equal(database.prepare("SELECT token_hash FROM auth_sessions WHERE id = 'legacy_session'").get().token_hash, "legacy-legacy_session");
assert.ok(database.prepare("SELECT available_at FROM outbox_events WHERE id = 'legacy_event'").get().available_at);

database.exec(await readFile(new URL("../db/seed/demo.sql", import.meta.url), "utf8"));
assert.equal(database.prepare("SELECT count(*) AS count FROM memberships WHERE workspace_id = 'ws_demo'").get().count, 4);
assert.equal(database.prepare("SELECT count(*) AS count FROM tasks WHERE workspace_id = 'ws_other'").get().count, 1);
assert.deepEqual(database.prepare("PRAGMA foreign_key_check").all(), []);

const indexes = new Set(database.prepare("SELECT name FROM sqlite_schema WHERE type = 'index'").all().map((row) => row.name));
for (const index of ["users_email_uidx", "memberships_lookup_idx", "tasks_board_position_idx", "invitations_pending_email_uidx", "auth_sessions_token_uidx"]) assert.ok(indexes.has(index), index);
assert.throws(() => database.exec("INSERT INTO columns (id, workspace_id, board_id, name, position) VALUES ('bad', 'ws_demo', 'brd_demo', 'Bad', -1)"));
database.exec("PRAGMA optimize");
console.log(`Verified ${migrations.length} migrations, demo seed, foreign keys, indexes, and check constraints.`);
