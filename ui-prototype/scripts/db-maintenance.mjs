import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const [command, database = process.env.TASKFLOW_D1_DATABASE, fileArgument] = process.argv.slice(2);
if (!command || !database) throw new Error("Usage: db-maintenance.mjs <backup|restore|rollback|seed> <database> [file]");

function wrangler(args) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(executable, ["wrangler", ...args], { stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (command === "backup") {
  const file = resolve(fileArgument ?? `backups/${database}-${new Date().toISOString().replaceAll(":", "-")}.sql`);
  mkdirSync(dirname(file), { recursive: true });
  wrangler(["d1", "export", database, "--remote", `--output=${file}`]);
} else if (command === "restore" || command === "rollback") {
  if (process.env.TASKFLOW_CONFIRM_RESTORE !== "RESTORE_REMOTE") throw new Error("Set TASKFLOW_CONFIRM_RESTORE=RESTORE_REMOTE to confirm the destructive restore.");
  if (!fileArgument) throw new Error("A verified SQL backup file is required.");
  wrangler(["d1", "execute", database, "--remote", `--file=${resolve(fileArgument)}`]);
} else if (command === "seed") {
  const target = process.env.TASKFLOW_SEED_REMOTE === "true" ? "--remote" : "--local";
  if (target === "--remote" && process.env.TASKFLOW_CONFIRM_SEED !== "SEED_REMOTE") throw new Error("Set TASKFLOW_CONFIRM_SEED=SEED_REMOTE to seed a remote database.");
  wrangler(["d1", "execute", database, target, `--file=${resolve("db/seed/demo.sql")}`]);
} else {
  throw new Error(`Unknown database maintenance command: ${command}`);
}
