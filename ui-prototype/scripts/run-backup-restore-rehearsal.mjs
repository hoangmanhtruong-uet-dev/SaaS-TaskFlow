import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { createRecoveryBundle, validateRecoveryBundle } from "./lib/recovery-bundle.mjs";

const required = ["SUPABASE_STAGING_PROJECT_REF", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
if (process.env.APP_ENV !== "staging") throw new Error("Refusing recovery rehearsal outside APP_ENV=staging.");
if (process.env.TASKFLOW_CONFIRM_BACKUP_REHEARSAL !== "STAGING_EPHEMERAL_ONLY")
  throw new Error("Set TASKFLOW_CONFIRM_BACKUP_REHEARSAL=STAGING_EPHEMERAL_ONLY for the synthetic staging rehearsal.");
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = supabaseUrl.hostname.split(".")[0];
if (projectRef !== process.env.SUPABASE_STAGING_PROJECT_REF) throw new Error("Supabase URL does not match the declared staging project.");

const TABLE_ORDER = [
  "workspaces",
  "memberships",
  "projects",
  "project_members",
  "boards",
  "board_columns",
  "tasks",
  "task_assignees",
  "task_checklist_items",
  "labels",
  "task_labels",
  "comments",
  "notifications",
  "task_reminder_deliveries",
  "activity_events",
];

const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const ids = Object.fromEntries([
  "workspace", "ownerMembership", "memberMembership", "project", "board", "column", "task",
  "checklist", "label", "comment", "notification", "reminder", "activity",
].map((name) => [name, randomUUID()]));
const users = [
  { email: `recovery-owner-${runId}@taskflow-mvp-staging.vercel.app`, password: `Tf!${randomUUID()}Aa9`, id: null },
  { email: `recovery-member-${runId}@taskflow-mvp-staging.vercel.app`, password: `Tf!${randomUUID()}Aa9`, id: null },
];
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

async function rows(operation, promise) {
  const { data, error } = await promise;
  if (error) throw new Error(`${operation}: ${error.message}`);
  return data ?? [];
}

async function insert(table, value) {
  const values = Array.isArray(value) ? value : [value];
  if (!values.length) return;
  const { error } = await supabase.from(table).insert(values);
  if (error) throw new Error(`Restore ${table}: ${error.message}`);
}

async function snapshotWorkspace() {
  const data = {};
  for (const table of TABLE_ORDER) {
    const query = supabase.from(table).select("*");
    data[table] = await rows(`Snapshot ${table}`, table === "workspaces" ? query.eq("id", ids.workspace) : query.eq("workspace_id", ids.workspace));
    data[table].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  }
  return data;
}

async function workspaceExists() {
  const result = await rows("Check workspace", supabase.from("workspaces").select("id").eq("id", ids.workspace));
  return result.length > 0;
}

async function removeWorkspace(workspaceId = ids.workspace) {
  for (const table of [...TABLE_ORDER].reverse()) {
    const query = supabase.from(table).delete();
    const { error } = await (table === "workspaces" ? query.eq("id", workspaceId) : query.eq("workspace_id", workspaceId));
    if (error) throw new Error(`Delete rehearsal ${table}: ${error.message}`);
  }
}

async function cleanupStaleRehearsals() {
  const staleWorkspacePattern = /^recovery-[a-f0-9]{12}$/;
  const staleUserPattern = /^recovery-(?:owner|member)-[a-f0-9]{12}@taskflow-mvp-staging\.vercel\.app$/;
  const candidates = await rows(
    "Find stale rehearsal workspaces",
    supabase.from("workspaces").select("id, slug").like("slug", "recovery-%"),
  );
  const staleWorkspaces = candidates.filter(({ slug }) => staleWorkspacePattern.test(slug));
  for (const workspace of staleWorkspaces) await removeWorkspace(workspace.id);

  let page = 1;
  let staleUsers = [];
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(`Find stale rehearsal users: ${error.message}`);
    staleUsers = staleUsers.concat(data.users.filter(({ email }) => email && staleUserPattern.test(email)));
    if (data.users.length < 100) break;
    page += 1;
  }
  for (const user of staleUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`Delete stale rehearsal user: ${error.message}`);
  }

  if (staleWorkspaces.length || staleUsers.length) {
    console.log(`Removed stale recovery fixtures: ${staleWorkspaces.length} workspace(s), ${staleUsers.length} user(s).`);
  }
}

async function cleanup() {
  const failures = [];
  try { if (await workspaceExists()) await removeWorkspace(); } catch (error) { failures.push(error); }
  for (const user of users) {
    if (!user.id) continue;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, failures.map((error) => error.message).join("; "));
}

let exitCode = 1;
try {
  const startedAt = Date.now();
  console.log(`Starting synthetic backup-restore rehearsal in staging project ${projectRef}...`);
  await cleanupStaleRehearsals();
  for (const [index, user] of users.entries()) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: `Recovery rehearsal ${index + 1}` },
    });
    if (error || !data.user) throw error ?? new Error("Recovery rehearsal user creation failed.");
    user.id = data.user.id;
  }

  const dueAt = new Date(Date.now() + 86400000).toISOString();
  const completedAt = new Date().toISOString();
  await insert("workspaces", { id: ids.workspace, name: "Recovery rehearsal", slug: `recovery-${runId}`, plan: "FREE" });
  await insert("memberships", [
    { id: ids.ownerMembership, workspace_id: ids.workspace, user_id: users[0].id, role: "OWNER", status: "ACTIVE" },
    { id: ids.memberMembership, workspace_id: ids.workspace, user_id: users[1].id, role: "MEMBER", status: "ACTIVE" },
  ]);
  await insert("projects", { id: ids.project, workspace_id: ids.workspace, name: "Recovery project", description: "Synthetic restore fixture", visibility: "PRIVATE", lead_membership_id: ids.ownerMembership });
  await insert("project_members", { workspace_id: ids.workspace, project_id: ids.project, membership_id: ids.memberMembership, access_level: "EDIT" });
  await insert("boards", { id: ids.board, workspace_id: ids.workspace, project_id: ids.project, name: "Recovery board" });
  await insert("board_columns", { id: ids.column, workspace_id: ids.workspace, board_id: ids.board, name: "Todo", position: 0 });
  await insert("tasks", { id: ids.task, workspace_id: ids.workspace, project_id: ids.project, board_id: ids.board, column_id: ids.column, creator_membership_id: ids.ownerMembership, title: "Verify recovery", description: "Synthetic fixture", priority: "HIGH", position: 1000, due_at: dueAt });
  await insert("task_assignees", { workspace_id: ids.workspace, task_id: ids.task, membership_id: ids.memberMembership });
  await insert("task_checklist_items", { id: ids.checklist, workspace_id: ids.workspace, task_id: ids.task, title: "Checksum restored data", completed: true, position: 0, created_by_user_id: users[0].id, completed_by_user_id: users[1].id, completed_at: completedAt });
  await insert("labels", { id: ids.label, workspace_id: ids.workspace, name: "recovery", color: "#2563eb" });
  await insert("task_labels", { workspace_id: ids.workspace, task_id: ids.task, label_id: ids.label });
  await insert("comments", { id: ids.comment, workspace_id: ids.workspace, task_id: ids.task, author_membership_id: ids.memberMembership, body: "Recovery rehearsal comment" });
  await insert("notifications", { id: ids.notification, workspace_id: ids.workspace, recipient_user_id: users[1].id, type: "RECOVERY_REHEARSAL", title: "Recovery", body: "Synthetic notification" });
  await insert("task_reminder_deliveries", { id: ids.reminder, workspace_id: ids.workspace, task_id: ids.task, recipient_user_id: users[1].id, kind: "DUE_SOON", due_at: dueAt });
  await insert("activity_events", { id: ids.activity, workspace_id: ids.workspace, actor_user_id: users[0].id, action: "recovery.rehearsal", target_type: "workspace", target_id: ids.workspace, metadata: { synthetic: true } });

  const migrationFiles = (await readdir(new URL("../supabase/migrations/", import.meta.url))).filter((file) => /^\d{14}_.+\.sql$/.test(file)).sort();
  const schemaVersion = migrationFiles.at(-1)?.slice(0, 14) ?? "00000000000000";
  const originalData = await snapshotWorkspace();
  const bundle = createRecoveryBundle({ data: originalData, schemaVersion });
  validateRecoveryBundle(bundle, { workspaceId: ids.workspace, tableOrder: TABLE_ORDER });
  console.log(`Backup manifest verified: ${Object.values(bundle.manifest.rowCounts).reduce((sum, count) => sum + count, 0)} rows, checksum ${bundle.manifest.checksum.slice(0, 12)}...`);

  await removeWorkspace();
  if (await workspaceExists()) throw new Error("Synthetic source workspace still exists after deletion.");

  const restoreStartedAt = Date.now();
  for (const table of TABLE_ORDER) await insert(table, bundle.data[table]);
  const restoredData = await snapshotWorkspace();
  const restoredBundle = createRecoveryBundle({ data: restoredData, schemaVersion: bundle.manifest.schemaVersion });
  validateRecoveryBundle(restoredBundle, { workspaceId: ids.workspace, tableOrder: TABLE_ORDER });
  if (restoredBundle.manifest.checksum !== bundle.manifest.checksum) throw new Error("Restored workspace checksum does not match the backup.");

  const restoreSeconds = Number(((Date.now() - restoreStartedAt) / 1000).toFixed(2));
  const totalSeconds = Number(((Date.now() - startedAt) / 1000).toFixed(2));
  console.log(`Recovery rehearsal passed: checksum matched, RPO delta 0 rows, restore ${restoreSeconds}s, total ${totalSeconds}s.`);
  exitCode = 0;
} finally {
  await cleanup().catch((error) => {
    console.error("Recovery rehearsal cleanup failed:", error instanceof Error ? error.message : String(error));
    exitCode = 1;
  });
}

process.exitCode = exitCode;
