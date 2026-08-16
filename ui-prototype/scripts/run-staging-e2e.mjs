import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.E2E_BASE_URL ?? "https://taskflow-mvp-staging.vercel.app";
const required = [
  "SUPABASE_STAGING_PROJECT_REF",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_PRICE_PRO_MONTHLY",
];

if (process.env.APP_ENV !== "staging") {
  throw new Error("Refusing to provision E2E fixtures outside APP_ENV=staging.");
}
if (process.env.TASKFLOW_CONFIRM_E2E_PROVISION !== "STAGING_ONLY") {
  throw new Error("Set TASKFLOW_CONFIRM_E2E_PROVISION=STAGING_ONLY to provision temporary fixtures.");
}
if (new URL(baseUrl).hostname !== "taskflow-mvp-staging.vercel.app") {
  throw new Error("E2E_BASE_URL must target the TaskFlow staging alias.");
}
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = supabaseUrl.hostname.split(".")[0];
if (projectRef !== process.env.SUPABASE_STAGING_PROJECT_REF) {
  throw new Error("Supabase URL must belong to the declared staging project.");
}

const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const workspaceId = randomUUID();
const foreignWorkspaceId = randomUUID();
const projectId = randomUUID();
const boardId = randomUUID();
const columnId = randomUUID();
const taskId = randomUUID();
const roles = ["OWNER", "ADMIN", "MEMBER", "GUEST"];
const emailDomain = process.env.E2E_EMAIL_DOMAIN ?? "taskflow-mvp-staging.vercel.app";
const fixtures = Object.fromEntries(
  roles.map((role) => [
    role,
    {
      email: `e2e-${role.toLowerCase()}-${runId}@${emailDomain}`,
      password: `Tf!${randomUUID()}Aa9`,
      userId: null,
    },
  ]),
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } },
);

async function requireSuccess(operation, resultPromise) {
  const { error } = await resultPromise;
  if (error) throw new Error(`${operation}: ${error.message}`);
}

async function runPlaywright() {
  const cli = resolve("node_modules/@playwright/test/cli.js");
  const child = spawn(
    process.execPath,
    [cli, "test", "e2e/production-critical.spec.ts", "--reporter=list"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        E2E_BASE_URL: baseUrl,
        E2E_REQUIRE_READY: "true",
        E2E_RUN_AUTH: "true",
        E2E_WORKSPACE_ID: workspaceId,
        E2E_FOREIGN_WORKSPACE_ID: foreignWorkspaceId,
        E2E_TASK_ID: taskId,
        ...Object.fromEntries(
          roles.flatMap((role) => [
            [`E2E_${role}_EMAIL`, fixtures[role].email],
            [`E2E_${role}_PASSWORD`, fixtures[role].password],
          ]),
        ),
      },
    },
  );
  return await new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolveExit({ code, signal }));
  });
}

async function cleanup() {
  const failures = [];
  try {
    const { data, error } = await supabase.storage.from("task-attachments").list(`${workspaceId}/${taskId}`);
    if (error) throw error;
    if (data?.length) await requireSuccess("Delete temporary attachments", supabase.storage.from("task-attachments").remove(data.map((item) => `${workspaceId}/${taskId}/${item.name}`)));
  } catch (error) {
    failures.push(error);
  }
  try {
    await requireSuccess(
      "Delete temporary workspaces",
      supabase.from("workspaces").delete().in("id", [workspaceId, foreignWorkspaceId]),
    );
  } catch (error) {
    failures.push(error);
  }
  for (const role of roles) {
    if (!fixtures[role].userId) continue;
    const { error } = await supabase.auth.admin.deleteUser(fixtures[role].userId);
    if (error) failures.push(error);
  }
  if (failures.length) {
    const details = failures.map((error) => error instanceof Error ? error.message : String(error)).join("; ");
    throw new AggregateError(failures, `One or more E2E fixtures could not be removed: ${details}`);
  }
}

let exitCode = 1;
try {
  console.log(`Provisioning temporary Supabase Auth fixtures for four roles in staging project ${projectRef}...`);
  for (const role of roles) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: fixtures[role].email,
      password: fixtures[role].password,
      email_confirm: true,
      user_metadata: { full_name: `E2E ${role}` },
    });
    if (error || !data.user) throw error ?? new Error(`Supabase did not create the ${role} fixture.`);
    fixtures[role].userId = data.user.id;
  }

  await requireSuccess("Create temporary workspaces", supabase.from("workspaces").insert([
    { id: workspaceId, name: "TaskFlow E2E", slug: `taskflow-e2e-${runId}`, plan: "PRO" },
    { id: foreignWorkspaceId, name: "TaskFlow Foreign E2E", slug: `taskflow-foreign-e2e-${runId}`, plan: "FREE" },
  ]));
  const membershipIds = Object.fromEntries(roles.map((role) => [role, randomUUID()]));
  await requireSuccess("Create temporary memberships", supabase.from("memberships").insert([
    ...roles.map((role) => ({
      id: membershipIds[role], workspace_id: workspaceId, user_id: fixtures[role].userId,
      role, status: "ACTIVE",
    })),
    {
      id: randomUUID(), workspace_id: foreignWorkspaceId,
      user_id: fixtures.ADMIN.userId, role: "OWNER", status: "ACTIVE",
    },
  ]));
  await requireSuccess("Create temporary Pro entitlement", supabase.from("subscriptions").insert({
    id: randomUUID(),
    workspace_id: workspaceId,
    stripe_customer_id: `cus_e2e_${runId}`,
    stripe_subscription_id: `sub_e2e_${runId}`,
    stripe_subscription_item_id: `si_e2e_${runId}`,
    stripe_price_id: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripe_product_id: `prod_e2e_${runId}`,
    status: "active",
    quantity: 5,
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    provider_updated_at: new Date().toISOString(),
  }));
  await requireSuccess("Create temporary project", supabase.from("projects").insert({ id: projectId, workspace_id: workspaceId, name: "Attachment E2E", description: "", visibility: "WORKSPACE" }));
  await requireSuccess("Create temporary board", supabase.from("boards").insert({ id: boardId, workspace_id: workspaceId, project_id: projectId, name: "E2E Board" }));
  await requireSuccess("Create temporary column", supabase.from("board_columns").insert({ id: columnId, workspace_id: workspaceId, board_id: boardId, name: "Todo", position: 0 }));
  await requireSuccess("Create temporary task", supabase.from("tasks").insert({ id: taskId, workspace_id: workspaceId, project_id: projectId, board_id: boardId, column_id: columnId, creator_membership_id: membershipIds.OWNER, title: "Attachment E2E task", description: "", priority: "MEDIUM", position: 1000 }));

  console.log("Running authenticated tenant-isolation and role-matrix tests...");
  const result = await runPlaywright();
  if (result.signal) throw new Error(`Playwright terminated by signal ${result.signal}.`);
  exitCode = result.code ?? 1;
} finally {
  console.log("Removing temporary E2E users and workspaces...");
  await cleanup().catch((error) => {
    console.error("E2E cleanup failed:", error instanceof Error ? error.message : String(error));
    exitCode = 1;
  });
}

process.exitCode = exitCode;
