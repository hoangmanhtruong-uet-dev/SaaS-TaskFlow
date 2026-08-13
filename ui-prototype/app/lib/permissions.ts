import type { WorkspaceRole } from "@/app/types/domain";

export type Permission =
  | "workspace.read"
  | "workspace.update"
  | "workspace.archive"
  | "workspace.billing.manage"
  | "member.read"
  | "member.manage"
  | "invitation.manage"
  | "audit.read"
  | "project.create"
  | "project.update"
  | "project.archive"
  | "task.read"
  | "task.create"
  | "task.update"
  | "task.archive"
  | "comment.read"
  | "comment.create"
  | "comment.manage";

const ownerPermissions: Permission[] = [
  "workspace.read", "workspace.update", "workspace.archive", "workspace.billing.manage",
  "member.read", "member.manage", "invitation.manage", "audit.read",
  "project.create", "project.update", "project.archive",
  "task.read", "task.create", "task.update", "task.archive",
  "comment.read", "comment.create", "comment.manage",
];

export const ROLE_PERMISSIONS: Record<WorkspaceRole, ReadonlySet<Permission>> = {
  OWNER: new Set(ownerPermissions),
  ADMIN: new Set(ownerPermissions.filter((permission) =>
    permission !== "workspace.archive" && permission !== "workspace.billing.manage"
  )),
  MEMBER: new Set([
    "workspace.read", "member.read", "project.create", "task.read", "task.create",
    "task.update", "comment.read", "comment.create",
  ]),
  GUEST: new Set(["task.read", "task.create", "task.update", "comment.read", "comment.create"]),
};

export function can(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export type ProjectAccessLevel = "VIEW" | "COMMENT" | "EDIT";

export function canAccessProject(input: {
  role: WorkspaceRole;
  visibility: "WORKSPACE" | "PRIVATE";
  permission: Permission;
  accessLevel?: ProjectAccessLevel | null;
}): boolean {
  const { role, visibility, permission, accessLevel } = input;
  if (!can(role, permission)) return false;
  if (role === "OWNER" || role === "ADMIN") return true;
  if (role === "MEMBER" && visibility === "WORKSPACE") return true;
  if (!accessLevel) return false;
  if (permission === "task.create" || permission === "task.update") return accessLevel === "EDIT";
  if (permission === "comment.create") return accessLevel === "COMMENT" || accessLevel === "EDIT";
  return true;
}

export function authorizeWorkspaceContext(input: {
  requestedWorkspaceId: string;
  membership: { workspaceId: string; role: WorkspaceRole; status: "ACTIVE" | "SUSPENDED" | "LEFT" } | null;
  permission: Permission;
}): boolean {
  return Boolean(input.membership && input.membership.status === "ACTIVE" && input.membership.workspaceId === input.requestedWorkspaceId && can(input.membership.role, input.permission));
}

export function authorizeProjectContext(input: {
  requestedWorkspaceId: string;
  requestedProjectId: string;
  membership: { workspaceId: string; role: WorkspaceRole; status: "ACTIVE" | "SUSPENDED" | "LEFT" } | null;
  project: { id: string; workspaceId: string; visibility: "WORKSPACE" | "PRIVATE" } | null;
  permission: Permission;
  accessLevel?: ProjectAccessLevel | null;
}): boolean {
  if (!authorizeWorkspaceContext({ requestedWorkspaceId: input.requestedWorkspaceId, membership: input.membership, permission: input.permission })) return false;
  if (!input.project || input.project.id !== input.requestedProjectId || input.project.workspaceId !== input.requestedWorkspaceId) return false;
  return canAccessProject({ role: input.membership!.role, visibility: input.project.visibility, permission: input.permission, accessLevel: input.accessLevel });
}

export function canArchiveProject(role: WorkspaceRole, membershipId: string, leadMembershipId?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN" || (role === "MEMBER" && membershipId === leadMembershipId);
}

export function canArchiveTask(role: WorkspaceRole, membershipId: string, creatorMembershipId: string, leadMembershipId?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN" || (role === "MEMBER" && (membershipId === creatorMembershipId || membershipId === leadMembershipId));
}

export function canManageMemberChange(actorRole: WorkspaceRole, targetRole: WorkspaceRole, nextRole?: WorkspaceRole, nextStatus?: "ACTIVE" | "SUSPENDED" | "LEFT"): boolean {
  if (actorRole !== "OWNER" && actorRole !== "ADMIN") return false;
  if (targetRole === "OWNER" && actorRole !== "OWNER") return false;
  if (actorRole === "ADMIN" && (targetRole === "ADMIN" || nextRole === "ADMIN" || nextRole === "OWNER")) return false;
  if (nextRole === "OWNER") return false;
  return nextRole !== undefined || nextStatus !== undefined;
}
