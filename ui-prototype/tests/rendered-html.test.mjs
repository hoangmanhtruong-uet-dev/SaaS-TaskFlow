import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import test, { after, before } from "node:test";

const root = new URL("../", import.meta.url);

const port = 33000 + Math.floor(Math.random() * 1000);
let server;

before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk; });
  server.stderr.on("data", (chunk) => { output += chunk; });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js exited before startup:\n${output}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}`);
      if (response.ok) return;
    } catch {
      // The server is still starting; retry until the bounded deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next.js did not start in time:\n${output}`);
});

after(() => server?.kill());

async function render(path = "/") {
  return fetch(`http://127.0.0.1:${port}${path}`, { headers: { accept: "text/html" } });
}

test("registers exactly 89 unique Stitch screens", async () => {
  const registry = await readFile(new URL("app/lib/screens.ts", root), "utf8");
  const ids = [...registry.matchAll(/\{ id: "([a-f0-9]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 89);
  assert.equal(new Set(ids).size, 89);
});

test("renders production marketing home and the internal UI atlas", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Mọi việc rõ ràng/);
  const atlasResponse = await render("/ui");
  assert.equal(atlasResponse.status, 200);
  const atlas = await atlasResponse.text();
  assert.match(atlas, /TaskFlow UI Atlas/);
  assert.match(atlas, /89 màn hình/);
  assert.doesNotMatch(atlas, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("renders representative marketing and app screens", async () => {
  for (const path of [
    "/ui/36d00f27de814b3c87a87c917d84a8aa",
    "/ui/d2bc0a396d0f447eab4c38d4f3be7295",
    "/ui/e813935ba5234e309f246424caed6e83",
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html/i);
  }
});

test("exposes stable public production routes", async () => {
  for (const path of ["/features", "/pricing", "/security", "/privacy", "/terms", "/support", "/login"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
  }
});

test("production data layer uses HTTP adapters and tenant-scoped API routes", async () => {
  const projectService = await readFile(new URL("app/services/project-service.ts", root), "utf8");
  const taskService = await readFile(new URL("app/services/task-service.ts", root), "utf8");
  assert.doesNotMatch(projectService, /mock-data/);
  assert.doesNotMatch(taskService, /mock-data/);
  assert.match(projectService, /apiRequest/);
  assert.match(taskService, /MoveTaskRequest/);
  for (const route of [
    "app/api/v1/workspaces/route.ts",
    "app/api/v1/workspaces/[workspaceId]/projects/route.ts",
    "app/api/v1/workspaces/[workspaceId]/tasks/route.ts",
    "app/api/v1/workspaces/[workspaceId]/tasks/[taskId]/move/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, root), "utf8"));
});

test("collaboration backend covers invitations, members, audit, and notifications", async () => {
  const policy = await readFile(new URL("db/authorization.ts", root), "utf8");
  const permissionMatrix = await readFile(new URL("app/lib/permissions.ts", root), "utf8");
  const collaboration = await readFile(new URL("db/collaboration.ts", root), "utf8");
  assert.match(permissionMatrix, /member\.manage/);
  assert.match(permissionMatrix, /invitation\.manage/);
  assert.match(policy, /authorizeProjectContext/);
  assert.match(collaboration, /last_owner/);
  assert.match(collaboration, /SHA-256/);
  assert.match(collaboration, /wrong_email/);
  for (const route of [
    "app/api/v1/workspaces/[workspaceId]/members/route.ts",
    "app/api/v1/workspaces/[workspaceId]/invitations/route.ts",
    "app/api/v1/workspaces/[workspaceId]/activity/route.ts",
    "app/api/v1/notifications/route.ts",
    "app/api/v1/invitations/[token]/[action]/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, root), "utf8"));
});

test("task collaboration covers comments, mentions, conflict rollback, and reconnect", async () => {
  const comments = await readFile(new URL("db/comments.ts", root), "utf8");
  const interactions = await readFile(new URL("app/components/tasks/kanban-board.tsx", root), "utf8");
  const connection = await readFile(new URL("app/hooks/use-connection-sync.ts", root), "utf8");
  assert.match(comments, /MENTION/);
  assert.match(comments, /projectMembers/);
  assert.match(interactions, /TASK_VERSION_CONFLICT/);
  assert.match(interactions, /setTasks\(snapshot\)/);
  assert.match(interactions, /onDrop/);
  assert.match(connection, /offline/);
  assert.match(connection, /visibilityState/);
  for (const route of [
    "app/api/v1/workspaces/[workspaceId]/tasks/[taskId]/comments/route.ts",
    "app/api/v1/workspaces/[workspaceId]/comments/[commentId]/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, root), "utf8"));
});

test("task detail includes a tenant-scoped interactive checklist", async () => {
  const checklist = await readFile(new URL("db/task-checklist.ts", root), "utf8");
  const interactions = await readFile(new URL("app/components/tasks/task-editor.tsx", root), "utf8");
  assert.match(checklist, /MAX_CHECKLIST_ITEMS_PER_TASK = 100/);
  assert.match(checklist, /task\.checklist_item\.completed/);
  assert.match(interactions, /Tiến độ checklist/);
  assert.match(interactions, /toggleChecklistItem/);
  for (const route of [
    "app/api/v1/workspaces/[workspaceId]/tasks/[taskId]/checklist/route.ts",
    "app/api/v1/workspaces/[workspaceId]/tasks/[taskId]/checklist/[itemId]/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, root), "utf8"));
});

test("planning feature batch includes calendar, checklist progress, and deadline reminders", async () => {
  const [calendar, tasks, reminders, cron] = await Promise.all([
    readFile(new URL("app/components/calendar/CalendarDayGrid.tsx", root), "utf8"),
    readFile(new URL("db/tasks.ts", root), "utf8"),
    readFile(new URL("db/task-reminders.ts", root), "utf8"),
    readFile(new URL("app/api/internal/jobs/workspace-deletion/route.ts", root), "utf8"),
  ]);
  assert.match(calendar, /Lịch công việc/);
  assert.match(calendar, /dayTasks/);
  assert.match(tasks, /checklistCompleted/);
  assert.match(reminders, /DUE_SOON/);
  assert.match(reminders, /OVERDUE/);
  assert.match(cron, /CRON_SECRET/);
  await assert.doesNotReject(readFile(new URL("app/app/calendar/page.tsx", root), "utf8"));
});

test("operations layer covers scoped search, archive recovery, and workspace lifecycle", async () => {
  const search = await readFile(new URL("db/search.ts", root), "utf8");
  const tasksRepository = await readFile(new URL("db/tasks.ts", root), "utf8");
  const lifecycle = await readFile(new URL("db/workspace-lifecycle.ts", root), "utf8");
  const projectService = await readFile(new URL("app/services/project-service.ts", root), "utf8");
  const taskService = await readFile(new URL("app/services/task-service.ts", root), "utf8");
  assert.match(search, /listTasks/);
  assert.match(search, /50/);
  assert.match(tasksRepository, /\.ilike\("title"/);
  assert.match(tasksRepository, /boundedLimit \+ 1/);
  assert.match(lifecycle, /workspace\.ownership\.transferred/);
  assert.match(lifecycle, /confirmation !== workspace\.name/);
  assert.match(lifecycle, /30 \* 86400000/);
  assert.match(projectService, /archived/);
  assert.match(projectService, /restore/);
  assert.match(taskService, /archived/);
  assert.match(taskService, /restore/);
  for (const route of [
    "app/api/v1/workspaces/[workspaceId]/search/route.ts",
    "app/api/v1/workspaces/[workspaceId]/ownership/route.ts",
    "app/api/v1/workspaces/[workspaceId]/deletion-request/route.ts",
  ]) await assert.doesNotReject(readFile(new URL(route, root), "utf8"));
});
