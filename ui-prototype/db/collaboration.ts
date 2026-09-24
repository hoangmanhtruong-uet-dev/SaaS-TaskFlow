import type { InvitationStatus, MembershipStatus, WorkspaceRole } from "@/app/types/domain";
import { authorizeWorkspace } from "./authorization";
import { recordActivity } from "./audit";
import { consumeRateLimit } from "./auth";
import { canManageMemberChange } from "@/app/lib/permissions";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function listMembers(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "member.read")) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("id, role, status, created_at, profiles!inner(id, name, email)")
    .eq("workspace_id", workspaceId);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    userId: row.profiles.id,
    name: row.profiles.name,
    email: row.profiles.email,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function updateMember(workspaceId: string, membershipId: string, actorUserId: string, changes: { role?: WorkspaceRole; status?: MembershipStatus }) {
  if (changes.role === "OWNER") return { kind: "transfer_required" as const };
  const supabase = createSupabaseAdminClient();
  const actor = await authorizeWorkspace(workspaceId, actorUserId, "member.manage");
  const { data: target } = await supabase.from("memberships").select("*").eq("id", membershipId).eq("workspace_id", workspaceId).maybeSingle();
  if (!actor || !target) return { kind: "not_found" as const };

  if (!canManageMemberChange(actor.role, target.role as any, changes.role, changes.status)) return { kind: "denied" as const };

  const updateData: any = { ...changes, updated_at: new Date().toISOString() };
  const { data: updated } = await supabase.from("memberships").update(updateData).eq("id", membershipId).eq("workspace_id", workspaceId).select().maybeSingle();

  if (changes.status === "LEFT") {
    await supabase.from("project_members").delete().eq("membership_id", membershipId);
  }

  if (updated) await recordActivity(workspaceId, actorUserId, "member.updated", "membership", membershipId, changes);
  return { kind: "ok" as const, membership: updated };
}

export async function removeMember(workspaceId: string, membershipId: string, actorUserId: string) {
  return updateMember(workspaceId, membershipId, actorUserId, { status: "LEFT" });
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: target } = await supabase.from("memberships").select("*").eq("workspace_id", workspaceId).eq("user_id", userId).eq("status", "ACTIVE").maybeSingle();
  if (!target) return { kind: "not_found" as const };

  await supabase.from("memberships").update({ status: "LEFT", updated_at: new Date().toISOString() }).eq("id", target.id);
  await supabase.from("project_members").delete().eq("membership_id", target.id);
  await recordActivity(workspaceId, userId, "member.left", "membership", target.id);
  return { kind: "ok" as const };
}

export async function createInvitation(workspaceId: string, actorUserId: string, email: string, role: Exclude<WorkspaceRole, "OWNER">, inviteOrigin: string) {
  void inviteOrigin;
  const actor = await authorizeWorkspace(workspaceId, actorUserId, "invitation.manage");
  if (!actor) return { kind: "denied" as const };

  const rate = await consumeRateLimit(`invitation:${workspaceId}:${actorUserId}`, 20, 60 * 60 * 1000);
  if (!rate.allowed) return { kind: "rate_limited" as const, retryAfterSeconds: rate.retryAfterSeconds };

  if (role === "ADMIN" && actor.role !== "OWNER") return { kind: "denied" as const };
  const normalized = email.trim().toLowerCase();

  const supabase = createSupabaseAdminClient();
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const tokenHash = await hashToken(token);
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 86400000);

  const { data: workspace } = await supabase.from("workspaces").select("name").eq("id", workspaceId).maybeSingle();
  const { data: inviter } = await supabase.from("profiles").select("name").eq("id", actorUserId).maybeSingle();

  await supabase.from("invitations").insert({
    id,
    workspace_id: workspaceId,
    email_normalized: normalized,
    role,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    created_by_user_id: actorUserId,
  });

  await recordActivity(workspaceId, actorUserId, "invitation.created", "invitation", id, { email: normalized, role });
  return {
    kind: "ok" as const,
    token,
    id,
    expiresAt,
    workspaceName: workspace?.name ?? "TaskFlow",
    inviterName: inviter?.name ?? "Quản trị viên",
  };
}

export async function getMembershipEmailContext(workspaceId: string, membershipId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("memberships")
    .select("profiles!inner(email, name), workspaces!inner(name)")
    .eq("id", membershipId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!data) return null;
  return {
    email: (data.profiles as any).email,
    name: (data.profiles as any).name,
    workspaceName: (data.workspaces as any).name,
  };
}

export async function listInvitations(workspaceId: string, userId: string) {
  if (!(await authorizeWorkspace(workspaceId, userId, "invitation.manage"))) return null;
  const supabase = createSupabaseAdminClient();

  const [wsRes, invRes] = await Promise.all([
    supabase.from("workspaces").select("name").eq("id", workspaceId).maybeSingle(),
    supabase.from("invitations").select("*").eq("workspace_id", workspaceId),
  ]);

  const workspaceName = wsRes.data?.name ?? "Workspace";
  const rows = invRes.data ?? [];

  return rows.map((row: any) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    workspaceName,
    email: row.email_normalized,
    role: row.role,
    status: row.status,
    expiresAt: new Date(row.expires_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function revokeInvitation(workspaceId: string, invitationId: string, userId: string) {
  if (!(await authorizeWorkspace(workspaceId, userId, "invitation.manage"))) return false;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("invitations")
    .update({ status: "REVOKED" })
    .eq("id", invitationId)
    .eq("workspace_id", workspaceId)
    .eq("status", "PENDING")
    .select()
    .maybeSingle();

  if (data) await recordActivity(workspaceId, userId, "invitation.revoked", "invitation", invitationId);
  return Boolean(data);
}

export async function getInvitationByToken(token: string) {
  const tokenHash = await hashToken(token);
  const supabase = createSupabaseAdminClient();

  const { data: row } = await supabase
    .from("invitations")
    .select("*, workspaces!inner(name)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row) return null;

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    workspaceName: row.workspaces?.name ?? "Workspace",
    email: row.email_normalized,
    role: row.role,
    status: row.status,
    expiresAt: new Date(row.expires_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function respondToInvitation(token: string, userId: string, email: string, action: "accept" | "decline") {
  const tokenHash = await hashToken(token);
  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase.from("invitations").select("*").eq("token_hash", tokenHash).maybeSingle();
  if (!row) return { kind: "not_found" as const };
  if (row.status !== "PENDING") return { kind: row.status.toLowerCase() as Lowercase<InvitationStatus> };

  if (action === "decline") {
    await supabase.from("invitations").update({ status: "DECLINED" }).eq("id", row.id);
    await recordActivity(row.workspace_id, userId, "invitation.declined", "invitation", row.id);
    return { kind: "ok" as const };
  }

  await supabase.from("memberships").upsert(
    {
      id: crypto.randomUUID(),
      workspace_id: row.workspace_id,
      user_id: userId,
      role: row.role,
      status: "ACTIVE",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id, user_id" }
  );

  await supabase.from("invitations").update({ status: "ACCEPTED", accepted_at: new Date().toISOString() }).eq("id", row.id);
  await recordActivity(row.workspace_id, row.workspace_id, "invitation.accepted", "invitation", row.id);
  return { kind: "ok" as const, workspaceId: row.workspace_id };
}

export async function listProjectAccess(workspaceId: string, projectId: string, userId: string) {
  const actor = await authorizeWorkspace(workspaceId, userId, "member.manage");
  const supabase = createSupabaseAdminClient();
  const { data: project } = await supabase.from("projects").select("id").eq("id", projectId).eq("workspace_id", workspaceId).maybeSingle();
  if (!actor || !project) return null;

  const { data } = await supabase
    .from("project_members")
    .select("project_id, membership_id, access_level, memberships!inner(profiles!inner(name, email))")
    .eq("project_id", projectId);

  return (data ?? []).map((row: any) => ({
    projectId: row.project_id,
    membershipId: row.membership_id,
    accessLevel: row.access_level,
    name: row.memberships?.profiles?.name,
    email: row.memberships?.profiles?.email,
  }));
}

export async function setProjectAccess(workspaceId: string, projectId: string, membershipId: string, userId: string, accessLevel: "VIEW" | "COMMENT" | "EDIT" | null) {
  if (!(await authorizeWorkspace(workspaceId, userId, "member.manage"))) return false;
  const supabase = createSupabaseAdminClient();

  if (!accessLevel) {
    await supabase.from("project_members").delete().eq("project_id", projectId).eq("membership_id", membershipId);
  } else {
    await supabase.from("project_members").upsert(
      {
        project_id: projectId,
        membership_id: membershipId,
        workspace_id: workspaceId,
        access_level: accessLevel,
      },
      { onConflict: "project_id, membership_id" }
    );
  }

  await recordActivity(workspaceId, userId, "project.access.updated", "project", projectId, { membershipId, accessLevel });
  return true;
}

async function hashToken(token: string) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
