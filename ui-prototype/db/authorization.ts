import { and, eq } from "drizzle-orm";
import { getDb } from "./index";
import { memberships, projectMembers, projects } from "./schema";
import { authorizeProjectContext, can, type Permission } from "@/app/lib/permissions";
export type { Permission } from "@/app/lib/permissions";

export async function getActiveMembership(workspaceId: string, userId: string) {
  return getDb().select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).get();
}

export async function authorizeWorkspace(workspaceId: string, userId: string, permission: Permission) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership || !can(membership.role, permission)) return null;
  return membership;
}

export async function authorizeProject(workspaceId: string, projectId: string, userId: string, permission: Permission) {
  const membership = await authorizeWorkspace(workspaceId, userId, permission);
  if (!membership) return null;
  const project = await getDb().select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).get();
  if (!project) return null;
  const access = await getDb().select().from(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.membershipId, membership.id))).get();
  if (!authorizeProjectContext({ requestedWorkspaceId: workspaceId, requestedProjectId: projectId, membership, project, permission, accessLevel: access?.accessLevel })) return null;
  return { membership, project };
}
