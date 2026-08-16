import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { authorizeProjectContext } from "../../app/lib/permissions";

test("an ID from another workspace cannot be authorized even for an Owner", () => {
  const allowed = authorizeProjectContext({
    requestedWorkspaceId: "ws_a",
    requestedProjectId: "prj_b",
    membership: { workspaceId: "ws_a", role: "OWNER", status: "ACTIVE" },
    project: { id: "prj_b", workspaceId: "ws_b", visibility: "WORKSPACE" },
    permission: "task.read",
  });
  assert.equal(allowed, false);
});

test("tenant repositories scope resource lookup and mutation by workspace", async () => {
  const files = ["projects.ts", "tasks.ts", "comments.ts", "attachments.ts", "collaboration.ts", "audit.ts"];
  for (const file of files) {
    const source = await readFile(new URL(`../../db/${file}`, import.meta.url), "utf8");
    assert.match(source, /workspaceId/, file);
    assert.match(source, /eq\([^\n]*workspaceId/, file);
  }
  const projects = await readFile(new URL("../../db/projects.ts", import.meta.url), "utf8");
  const tasks = await readFile(new URL("../../db/tasks.ts", import.meta.url), "utf8");
  assert.match(projects, /authorizeProject\(workspaceId, board\.projectId/);
  assert.match(tasks, /eq\(tasks\.workspaceId, workspaceId\)/);
  assert.match(tasks, /eq\(columns\.workspaceId, workspaceId\)/);
});

test("suspended membership and Guest without project grant stay isolated", () => {
  const project = { id: "prj_a", workspaceId: "ws_a", visibility: "PRIVATE" as const };
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "ws_a", requestedProjectId: "prj_a", membership: { workspaceId: "ws_a", role: "MEMBER", status: "SUSPENDED" }, project, permission: "task.read", accessLevel: "EDIT" }), false);
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "ws_a", requestedProjectId: "prj_a", membership: { workspaceId: "ws_a", role: "GUEST", status: "ACTIVE" }, project, permission: "task.read" }), false);
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "ws_a", requestedProjectId: "prj_a", membership: { workspaceId: "ws_a", role: "GUEST", status: "ACTIVE" }, project, permission: "task.read", accessLevel: "VIEW" }), true);
});
