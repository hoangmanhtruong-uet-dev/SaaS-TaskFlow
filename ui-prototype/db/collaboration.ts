import { and, eq, ne, sql } from "drizzle-orm";
import type { InvitationStatus, MembershipStatus, WorkspaceRole } from "@/app/types/domain";
import { getDb } from "./index";
import { invitations, memberships, outboxEvents, projectMembers, projects, users, workspaces } from "./schema";
import { authorizeWorkspace } from "./authorization";
import { insertActivity, recordActivity } from "./audit";
import { consumeRateLimit } from "./auth";
import { canManageMemberChange } from "@/app/lib/permissions";
import { hasSeatCapacityWithDb } from "./billing";

export async function listMembers(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "member.read")) return null;
  const rows = await getDb().select({ membership: memberships, user: users }).from(memberships).innerJoin(users, eq(memberships.userId, users.id)).where(eq(memberships.workspaceId, workspaceId)).all();
  return rows.map(({ membership, user }: { membership: typeof memberships.$inferSelect; user: typeof users.$inferSelect }) => ({ id: membership.id, userId: user.id, name: user.name, email: user.email, role: membership.role, status: membership.status, createdAt: membership.createdAt.toISOString() }));
}

export async function updateMember(workspaceId: string, membershipId: string, actorUserId: string, changes: { role?: WorkspaceRole; status?: MembershipStatus }) {
  if (changes.role === "OWNER") return { kind: "transfer_required" as const };
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    await transaction.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
    const actor = await transaction.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, actorUserId), eq(memberships.status, "ACTIVE"))).get();
    const target = await transaction.select().from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId))).get();
    if (!actor || !target) return { kind: "not_found" as const };
    if (!canManageMemberChange(actor.role, target.role, changes.role, changes.status)) return { kind: "denied" as const };
    if (changes.status === "ACTIVE" && target.status !== "ACTIVE" && !await hasSeatCapacityWithDb(transaction, workspaceId)) return { kind: "seat_limit" as const };
    if (target.role === "OWNER" && (changes.role || changes.status === "SUSPENDED" || changes.status === "LEFT")) {
      const owners = await transaction.select({ count: sql<number>`count(*)` }).from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.role, "OWNER"), eq(memberships.status, "ACTIVE"))).get();
      if (Number(owners?.count ?? 0) <= 1) return { kind: "last_owner" as const };
    }
    const row = await transaction.update(memberships).set({ ...changes, updatedAt: new Date() }).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId))).returning().get();
    if (changes.status === "LEFT") await transaction.delete(projectMembers).where(eq(projectMembers.membershipId, membershipId));
    if (row) await insertActivity(transaction, workspaceId, actorUserId, "member.updated", "membership", membershipId, changes);
    return { kind: "ok" as const, membership: row };
  });
}

export async function removeMember(workspaceId: string, membershipId: string, actorUserId: string) {
  return updateMember(workspaceId, membershipId, actorUserId, { status: "LEFT" });
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    await transaction.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
    const target = await transaction.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).get();
    if (!target) return { kind: "not_found" as const };
    if (target.role === "OWNER") {
      const owners = await transaction.select({ count: sql<number>`count(*)` }).from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.role, "OWNER"), eq(memberships.status, "ACTIVE"))).get();
      if (Number(owners?.count ?? 0) <= 1) return { kind: "last_owner" as const };
    }
    await transaction.update(memberships).set({ status: "LEFT", updatedAt: new Date() }).where(eq(memberships.id, target.id));
    await transaction.delete(projectMembers).where(eq(projectMembers.membershipId, target.id));
    await insertActivity(transaction, workspaceId, userId, "member.left", "membership", target.id);
    return { kind: "ok" as const };
  });
}

export async function createInvitation(workspaceId: string, actorUserId: string, email: string, role: Exclude<WorkspaceRole, "OWNER">, inviteOrigin: string) {
  const actor = await authorizeWorkspace(workspaceId, actorUserId, "invitation.manage"); if (!actor) return { kind: "denied" as const };
  const rate = await consumeRateLimit(`invitation:${workspaceId}:${actorUserId}`, 20, 60 * 60 * 1000); if (!rate.allowed) return { kind: "rate_limited" as const, retryAfterSeconds: rate.retryAfterSeconds };
  if (role === "ADMIN" && actor.role !== "OWNER") return { kind: "denied" as const };
  const normalized = email.trim().toLowerCase();
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    await transaction.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
    if (!await hasSeatCapacityWithDb(transaction, workspaceId, true)) return { kind: "seat_limit" as const };
    const existing = await transaction.select().from(invitations).where(and(eq(invitations.workspaceId, workspaceId), eq(invitations.emailNormalized, normalized), eq(invitations.status, "PENDING"))).get();
    if (existing && existing.expiresAt > new Date()) return { kind: "duplicate" as const };
    if (existing) await transaction.update(invitations).set({ status: "EXPIRED" }).where(eq(invitations.id, existing.id));
    const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""); const tokenHash = await hashToken(token); const id = crypto.randomUUID(); const expiresAt = new Date(Date.now() + 7 * 86400000);
    const context = await transaction.select({ workspaceName: workspaces.name, inviterName: users.name }).from(workspaces).innerJoin(users, eq(users.id, actorUserId)).where(eq(workspaces.id, workspaceId)).get();
    await transaction.insert(invitations).values({ id, workspaceId, emailNormalized: normalized, role, tokenHash, expiresAt, createdByUserId: actorUserId });
    await transaction.insert(outboxEvents).values({ id: crypto.randomUUID(), workspaceId, type: "EMAIL_INVITATION", dedupKey: `invitation:${id}`, payload: { to: normalized, inviterName: context?.inviterName ?? "Quản trị viên", workspaceName: context?.workspaceName ?? "TaskFlow", role, inviteUrl: `${inviteOrigin}/invite/${token}`, expiresAt: expiresAt.toISOString(), invitationId: id } });
    await insertActivity(transaction, workspaceId, actorUserId, "invitation.created", "invitation", id, { email: normalized, role });
    return { kind: "ok" as const, token, id, expiresAt, workspaceName: context?.workspaceName ?? "TaskFlow", inviterName: context?.inviterName ?? "Quản trị viên" };
  });
}

export async function getMembershipEmailContext(workspaceId: string, membershipId: string) {
  return getDb().select({ email: users.email, name: users.name, workspaceName: workspaces.name }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId)).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId))).get();
}

export async function listInvitations(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "invitation.manage")) return null;
  const workspace = await getDb().select().from(workspaces).where(eq(workspaces.id, workspaceId)).get(); const rows = await getDb().select().from(invitations).where(eq(invitations.workspaceId, workspaceId)).all(); return rows.map((row: typeof invitations.$inferSelect) => invitationDto(row, workspace?.name ?? "Workspace"));
}
export async function revokeInvitation(workspaceId: string, invitationId: string, userId: string) { if (!await authorizeWorkspace(workspaceId, userId, "invitation.manage")) return false; const row = await getDb().update(invitations).set({ status: "REVOKED" }).where(and(eq(invitations.id, invitationId), eq(invitations.workspaceId, workspaceId), eq(invitations.status, "PENDING"))).returning().get(); if (row) await recordActivity(workspaceId, userId, "invitation.revoked", "invitation", invitationId); return Boolean(row); }

export async function getInvitationByToken(token: string) { const tokenHash = await hashToken(token); const row = await getDb().select({ invitation: invitations, workspaceName: workspaces.name }).from(invitations).innerJoin(workspaces, eq(invitations.workspaceId, workspaces.id)).where(eq(invitations.tokenHash, tokenHash)).get(); if (!row) return null; if (row.invitation.status === "PENDING" && row.invitation.expiresAt <= new Date()) { await getDb().update(invitations).set({ status: "EXPIRED" }).where(eq(invitations.id, row.invitation.id)).run(); row.invitation.status = "EXPIRED"; } return invitationDto(row.invitation, row.workspaceName); }
export async function respondToInvitation(token: string, userId: string, email: string, action: "accept" | "decline") {
  const tokenHash = await hashToken(token);
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    const locked = await transaction.execute(sql`select workspace_id from public.invitations where token_hash = ${tokenHash} for update`);
    const workspaceId = locked.rows?.[0]?.workspace_id as string | undefined;
    if (!workspaceId) return { kind: "not_found" as const };
    await transaction.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
    const row = await transaction.select().from(invitations).where(eq(invitations.tokenHash, tokenHash)).get();
    if (!row) return { kind: "not_found" as const };
    if (row.status !== "PENDING") return { kind: row.status.toLowerCase() as Lowercase<InvitationStatus> };
    if (row.expiresAt <= new Date()) {
      await transaction.update(invitations).set({ status: "EXPIRED" }).where(eq(invitations.id, row.id));
      return { kind: "expired" as const };
    }
    if (row.emailNormalized !== email.trim().toLowerCase()) return { kind: "wrong_email" as const };
    if (action === "decline") {
      await transaction.update(invitations).set({ status: "DECLINED" }).where(eq(invitations.id, row.id));
      await insertActivity(transaction, row.workspaceId, userId, "invitation.declined", "invitation", row.id);
      return { kind: "ok" as const };
    }
    const existingMembership = await transaction.select().from(memberships).where(and(eq(memberships.workspaceId, row.workspaceId), eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).get();
    if (!existingMembership && !await hasSeatCapacityWithDb(transaction, row.workspaceId)) return { kind: "seat_limit" as const };
    await transaction.insert(memberships).values({ id: crypto.randomUUID(), workspaceId: row.workspaceId, userId, role: row.role }).onConflictDoUpdate({ target: [memberships.workspaceId, memberships.userId], set: { role: row.role, status: "ACTIVE", updatedAt: new Date() } });
    await transaction.update(invitations).set({ status: "ACCEPTED", acceptedAt: new Date() }).where(and(eq(invitations.id, row.id), eq(invitations.status, "PENDING")));
    await insertActivity(transaction, row.workspaceId, userId, "invitation.accepted", "invitation", row.id);
    return { kind: "ok" as const, workspaceId: row.workspaceId };
  });
}

export async function listProjectAccess(workspaceId: string, projectId: string, userId: string) { const actor = await authorizeWorkspace(workspaceId, userId, "member.manage"); const project = await getDb().select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).get(); if (!actor || !project) return null; return getDb().select({ projectId: projectMembers.projectId, membershipId: projectMembers.membershipId, accessLevel: projectMembers.accessLevel, name: users.name, email: users.email }).from(projectMembers).innerJoin(memberships, eq(projectMembers.membershipId, memberships.id)).innerJoin(users, eq(memberships.userId, users.id)).where(eq(projectMembers.projectId, projectId)).all(); }
export async function setProjectAccess(workspaceId: string, projectId: string, membershipId: string, userId: string, accessLevel: "VIEW" | "COMMENT" | "EDIT" | null) { if (!await authorizeWorkspace(workspaceId, userId, "member.manage")) return false; const target = await getDb().select().from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId), ne(memberships.status, "LEFT"))).get(); const project = await getDb().select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).get(); if (!target || !project) return false; if (!accessLevel) await getDb().delete(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.membershipId, membershipId))).run(); else await getDb().insert(projectMembers).values({ projectId, membershipId, workspaceId, accessLevel }).onConflictDoUpdate({ target: [projectMembers.projectId, projectMembers.membershipId], set: { accessLevel } }); await recordActivity(workspaceId, userId, "project.access.updated", "project", projectId, { membershipId, accessLevel }); return true; }

function invitationDto(row: typeof invitations.$inferSelect, workspaceName: string) { return { id: row.id, workspaceId: row.workspaceId, workspaceName, email: row.emailNormalized, role: row.role, status: row.status, expiresAt: row.expiresAt.toISOString(), createdAt: row.createdAt.toISOString() }; }
async function hashToken(token: string) { const data = new TextEncoder().encode(token); const digest = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
