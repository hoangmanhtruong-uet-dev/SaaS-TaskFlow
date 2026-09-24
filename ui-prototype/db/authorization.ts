import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { authorizeProjectContext, can, type Permission } from "@/app/lib/permissions";
export type { Permission } from "@/app/lib/permissions";

export async function getActiveMembership(workspaceId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id as string,
    workspaceId: data.workspace_id as string,
    userId: data.user_id as string,
    role: data.role as "OWNER" | "ADMIN" | "MEMBER" | "GUEST",
    status: data.status as "ACTIVE" | "SUSPENDED" | "LEFT",
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function authorizeWorkspace(workspaceId: string, userId: string, permission: Permission) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership || !can(membership.role, permission)) return null;
  return membership;
}

export async function authorizeProject(workspaceId: string, projectId: string, userId: string, permission: Permission) {
  const membership = await authorizeWorkspace(workspaceId, userId, permission);
  if (!membership) return null;

  const supabase = createSupabaseAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!project) return null;

  const { data: access } = await supabase
    .from("project_members")
    .select("access_level")
    .eq("project_id", projectId)
    .eq("membership_id", membership.id)
    .maybeSingle();

  const mappedProject = {
    id: project.id as string,
    workspaceId: project.workspace_id as string,
    name: project.name as string,
    key: project.key as string,
    description: project.description as string | null,
    visibility: project.visibility as "WORKSPACE" | "PRIVATE",
    leadMembershipId: project.lead_membership_id as string | null,
    archivedAt: project.archived_at ? new Date(project.archived_at) : null,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  };

  const accessLevel = (access?.access_level as "VIEW" | "COMMENT" | "EDIT" | null) ?? null;

  if (!authorizeProjectContext({ requestedWorkspaceId: workspaceId, requestedProjectId: projectId, membership, project: mappedProject, permission, accessLevel })) return null;
  return { membership, project: mappedProject };
}

