import assert from "node:assert/strict";
import test from "node:test";
import {
  ROLE_PERMISSIONS,
  authorizeProjectContext,
  can,
  canAccessProject,
  canArchiveProject,
  canArchiveTask,
  canManageMemberChange,
  type Permission,
} from "../../app/lib/permissions";

const allPermissions: Permission[] = [
  "workspace.read", "workspace.update", "workspace.archive", "workspace.billing.manage",
  "member.read", "member.manage", "invitation.manage", "audit.read",
  "project.create", "project.update", "project.archive", "task.read", "task.create",
  "task.update", "task.archive", "comment.read", "comment.create", "comment.manage",
];

test("Owner/Admin/Member/Guest workspace permission matrix is explicit and exhaustive", () => {
  const expected: Record<keyof typeof ROLE_PERMISSIONS, Permission[]> = {
    OWNER: allPermissions,
    ADMIN: allPermissions.filter((permission) => permission !== "workspace.archive" && permission !== "workspace.billing.manage"),
    MEMBER: ["workspace.read", "member.read", "project.create", "task.read", "task.create", "task.update", "comment.read", "comment.create"],
    GUEST: ["task.read", "task.create", "task.update", "comment.read", "comment.create"],
  };
  for (const role of Object.keys(expected) as Array<keyof typeof expected>) {
    for (const permission of allPermissions) assert.equal(can(role, permission), expected[role].includes(permission), `${role}:${permission}`);
  }
});

test("private project access levels constrain Member and Guest actions", () => {
  assert.equal(canAccessProject({ role: "MEMBER", visibility: "WORKSPACE", permission: "task.read" }), true);
  assert.equal(canAccessProject({ role: "GUEST", visibility: "WORKSPACE", permission: "task.read" }), false);
  assert.equal(canAccessProject({ role: "MEMBER", visibility: "PRIVATE", permission: "task.read" }), false);
  assert.equal(canAccessProject({ role: "GUEST", visibility: "PRIVATE", permission: "task.read", accessLevel: "VIEW" }), true);
  assert.equal(canAccessProject({ role: "GUEST", visibility: "PRIVATE", permission: "comment.create", accessLevel: "VIEW" }), false);
  assert.equal(canAccessProject({ role: "GUEST", visibility: "PRIVATE", permission: "comment.create", accessLevel: "COMMENT" }), true);
  assert.equal(canAccessProject({ role: "GUEST", visibility: "PRIVATE", permission: "task.create", accessLevel: "COMMENT" }), false);
  assert.equal(canAccessProject({ role: "GUEST", visibility: "PRIVATE", permission: "task.create", accessLevel: "EDIT" }), true);
  for (const role of ["OWNER", "ADMIN"] as const) assert.equal(canAccessProject({ role, visibility: "PRIVATE", permission: "task.update" }), true);
});

test("Project Lead and task creator exceptions do not elevate Guest", () => {
  assert.equal(canArchiveProject("MEMBER", "member", "member"), true);
  assert.equal(canArchiveProject("MEMBER", "member", "other"), false);
  assert.equal(canArchiveProject("GUEST", "guest", "guest"), false);
  assert.equal(canArchiveTask("MEMBER", "member", "member", null), true);
  assert.equal(canArchiveTask("MEMBER", "member", "other", "member"), true);
  assert.equal(canArchiveTask("GUEST", "guest", "guest", "guest"), false);
});

test("member administration matrix protects Owner and peer Admin", () => {
  assert.equal(canManageMemberChange("OWNER", "ADMIN", "MEMBER"), true);
  assert.equal(canManageMemberChange("ADMIN", "MEMBER", undefined, "SUSPENDED"), true);
  assert.equal(canManageMemberChange("ADMIN", "ADMIN", undefined, "SUSPENDED"), false);
  assert.equal(canManageMemberChange("ADMIN", "OWNER", undefined, "LEFT"), false);
  assert.equal(canManageMemberChange("MEMBER", "GUEST", undefined, "LEFT"), false);
  assert.equal(canManageMemberChange("OWNER", "MEMBER", "OWNER"), false);
});

test("suspended and cross-tenant memberships are denied before role evaluation", () => {
  const project = { id: "project-a", workspaceId: "workspace-a", visibility: "PRIVATE" as const };
  const activeOwner = { workspaceId: "workspace-a", role: "OWNER" as const, status: "ACTIVE" as const };
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "workspace-a", requestedProjectId: "project-a", membership: activeOwner, project, permission: "task.read" }), true);
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "workspace-b", requestedProjectId: "project-a", membership: activeOwner, project, permission: "task.read" }), false);
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "workspace-a", requestedProjectId: "project-b", membership: activeOwner, project, permission: "task.read" }), false);
  assert.equal(authorizeProjectContext({ requestedWorkspaceId: "workspace-a", requestedProjectId: "project-a", membership: { ...activeOwner, status: "SUSPENDED" }, project, permission: "task.read" }), false);
});
