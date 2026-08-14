import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const baseUrl = process.env.E2E_BASE_URL ?? "https://taskflow-mvp-staging.vercel.app";
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_URL",
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

const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const workspaceId = randomUUID();
const foreignWorkspaceId = randomUUID();
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
const sql = postgres(process.env.SUPABASE_DB_URL, { max: 1, prepare: false });

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
    await sql`delete from public.workspaces where id in (${workspaceId}, ${foreignWorkspaceId})`;
  } catch (error) {
    failures.push(error);
  }
  for (const role of roles) {
    if (!fixtures[role].userId) continue;
    const { error } = await supabase.auth.admin.deleteUser(fixtures[role].userId);
    if (error) failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, "One or more E2E fixtures could not be removed.");
}

let exitCode = 1;
try {
  console.log("Provisioning temporary Supabase Auth fixtures for four roles...");
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

  await sql.begin(async (transaction) => {
    await transaction`
      insert into public.workspaces (id, name, slug, plan)
      values
        (${workspaceId}, 'TaskFlow E2E', ${`taskflow-e2e-${runId}`}, 'PRO'),
        (${foreignWorkspaceId}, 'TaskFlow Foreign E2E', ${`taskflow-foreign-e2e-${runId}`}, 'FREE')
    `;
    for (const role of roles) {
      await transaction`
        insert into public.memberships (id, workspace_id, user_id, role, status)
        values (${randomUUID()}, ${workspaceId}, ${fixtures[role].userId}, ${role}, 'ACTIVE')
      `;
    }
    await transaction`
      insert into public.memberships (id, workspace_id, user_id, role, status)
      values (${randomUUID()}, ${foreignWorkspaceId}, ${fixtures.ADMIN.userId}, 'OWNER', 'ACTIVE')
    `;
    await transaction`
      insert into public.subscriptions (
        id, workspace_id, stripe_customer_id, stripe_subscription_id,
        stripe_subscription_item_id, stripe_price_id, stripe_product_id,
        status, quantity, current_period_end, provider_updated_at
      ) values (
        ${randomUUID()}, ${workspaceId}, ${`cus_e2e_${runId}`}, ${`sub_e2e_${runId}`},
        ${`si_e2e_${runId}`}, ${process.env.STRIPE_PRICE_PRO_MONTHLY}, ${`prod_e2e_${runId}`},
        'active', 5, now() + interval '30 days', now()
      )
    `;
  });

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
  await sql.end({ timeout: 5 });
}

process.exitCode = exitCode;
