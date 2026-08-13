import { and, eq, ne, sql } from "drizzle-orm";
import type { InvitationStatus, MembershipStatus, WorkspaceRole } from "@/app/types/domain";
import { getDb } from "./index";
import { invitations, memberships, projectMembers, projects, users, workspaces } from "./schema";
import { authorizeWorkspace, getActiveMembership } from "./authorization";
import { recordActivity } from "./audit";
import { consumeRateLimit } from "./auth";
import { canManageMemberChange } from "@/app/lib/permissions";

export async function listMembers(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "member.read")) return null;
  const rows = await getDb().select({ membership: memberships, user: users }).from(memberships).innerJoin(users, eq(memberships.userId, users.id)).where(eq(memberships.workspaceId, workspaceId)).all();
  return rows.map(({ membership, user }: { membership: typeof memberships.$inferSelect; user: typeof users.$inferSelect }) => ({ id: membership.id, userId: user.id, name: user.name, email: user.email, role: membership.role, status: membership.status, createdAt: membership.createdAt.toISOString() }));
}

export async function updateMember(workspaceId: string, membershipId: string, actorUserId: string, changes: { role?: WorkspaceRole; status?: MembershipStatus }) {
  const actor = await authorizeWorkspace(workspaceId, actorUserId, "member.manage");
  const target = await getDb().select().from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId))).get();
  if (!actor || !target) return { kind: "not_found" as const };
  if (changes.role === "OWNER") return { kind: "transfer_required" as const };
  if (!canManageMemberChange(actor.role, target.role, changes.role, changes.status)) return { kind: "denied" as const };
  if (target.role === "OWNER" && (changes.role || changes.status === "SUSPENDED" || changes.status === "LEFT")) {
    const owners = await getDb().select({ count: sql<number>`count(*)` }).from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.role, "OWNER"), eq(memberships.status, "ACTIVE"))).get();
    if (Number(owners?.count ?? 0) <= 1) return { kind: "last_owner" as const };
  }
  const row = await getDb().update(memberships).set({ ...changes, updatedAt: new Date() }).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId))).returning().get();
  if (row) await recordActivity(workspaceId, actorUserId, "member.updated", "membership", membershipId, changes);
  return { kind: "ok" as const, membership: row };
}

export async function removeMember(workspaceId: string, membershipId: string, actorUserId: string) {
  const result = await updateMember(workspaceId, membershipId, actorUserId, { status: "LEFT" });
  if (result.kind === "ok") await getDb().delete(projectMembers).where(eq(projectMembers.membershipId, membershipId)).run();
  return result;
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  const target = await getActiveMembership(workspaceId, userId); if (!target) return { kind: "not_found" as const };
  if (target.role === "OWNER") { const owners = await getDb().select({ count: sql<number>`count(*)` }).from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.role, "OWNER"), eq(memberships.status, "ACTIVE"))).get(); if (Number(owners?.count ?? 0) <= 1) return { kind: "last_owner" as const }; }
  await getDb().update(memberships).set({ status: "LEFT", updatedAt: new Date() }).where(eq(memberships.id, target.id)).run(); await recordActivity(workspaceId, userId, "member.left", "membership", target.id); return { kind: "ok" as const };
}

export async function createInvitation(workspaceId: string, actorUserId: string, email: string, role: Exclude<WorkspaceRole, "OWNER">) {
  const actor = await authorizeWorkspace(workspaceId, actorUserId, "invitation.manage"); if (!actor) return { kind: "denied" as const };
  const rate = await consumeRateLimit(`invitation:${workspaceId}:${actorUserId}`, 20, 60 * 60 * 1000); if (!rate.allowed) return { kind: "rate_limited" as const, retryAfterSeconds: rate.retryAfterSeconds };
  if (role === "ADMIN" && actor.role !== "OWNER") return { kind: "denied" as const };
  const normalized = email.trim().toLowerCase(); const existing = await getDb().select().from(invitations).where(and(eq(invitations.workspaceId, workspaceId), eq(invitations.emailNormalized, normalized), eq(invitations.status, "PENDING"))).get(); if (existing && existing.expiresAt > new Date()) return { kind: "duplicate" as const }; if (existing) await getDb().update(invitations).set({ status: "EXPIRED" }).where(eq(invitations.id, existing.id)).run();
  const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""); const tokenHash = await hashToken(token); const id = crypto.randomUUID(); const expiresAt = new Date(Date.now() + 7 * 86400000);
  await getDb().insert(invitations).values({ id, workspaceId, emailNormalized: normalized, role, tokenHash, expiresAt, createdByUserId: actorUserId }); await recordActivity(workspaceId, actorUserId, "invitation.created", "invitation", id, { email: normalized, role }); return { kind: "ok" as const, token, id, expiresAt };
}

export async function listInvitations(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "invitation.manage")) return null;
  const workspace = await getDb().select().from(workspaces).where(eq(workspaces.id, workspaceId)).get(); const rows = await getDb().select().from(invitations).where(eq(invitations.workspaceId, workspaceId)).all(); return rows.map((row: typeof invitations.$inferSelect) => invitationDto(row, workspace?.name ?? "Workspace"));
}
export async function revokeInvitation(workspaceId: string, invitationId: string, userId: string) { if (!await authorizeWorkspace(workspaceId, userId, "invitation.manage")) return false; const row = await getDb().update(invitations).set({ status: "REVOKED" }).where(and(eq(invitations.id, invitationId), eq(invitations.workspaceId, workspaceId), eq(invitations.status, "PENDING"))).returning().get(); if (row) await recordActivity(workspaceId, userId, "invitation.revoked", "invitation", invitationId); return Boolean(row); }

export async function getInvitationByToken(token: string) { const tokenHash = await hashToken(token); const row = await getDb().select({ invitation: invitations, workspaceName: workspaces.name }).from(invitations).innerJoin(workspaces, eq(invitations.workspaceId, workspaces.id)).where(eq(invitations.tokenHash, tokenHash)).get(); if (!row) return null; if (row.invitation.status === "PENDING" && row.invitation.expiresAt <= new Date()) { await getDb().update(invitations).set({ status: "EXPIRED" }).where(eq(invitations.id, row.invitation.id)).run(); row.invitation.status = "EXPIRED"; } return invitationDto(row.invitation, row.workspaceName); }
export async function respondToInvitation(token: string, userId: string, email: string, action: "accept" | "decline") { const tokenHash = await hashToken(token); const row = await getDb().select().from(invitations).where(eq(invitations.tokenHash, tokenHash)).get(); if (!row) return { kind: "not_found" as const }; if (row.status !== "PENDING") return { kind: row.status.toLowerCase() as Lowercase<InvitationStatus> }; if (row.expiresAt <= new Date()) { await getDb().update(invitations).set({ status: "EXPIRED" }).where(eq(invitations.id, row.id)).run(); return { kind: "expired" as const }; } if (row.emailNormalized !== email.trim().toLowerCase()) return { kind: "wrong_email" as const }; if (action === "decline") { await getDb().update(invitations).set({ status: "DECLINED" }).where(eq(invitations.id, row.id)).run(); await recordActivity(row.workspaceId, userId, "invitation.declined", "invitation", row.id); return { kind: "ok" as const }; } const db = getDb(); await db.batch([db.insert(memberships).values({ id: crypto.randomUUID(), workspaceId: row.workspaceId, userId, role: row.role }).onConflictDoUpdate({ target: [memberships.workspaceId, memberships.userId], set: { role: row.role, status: "ACTIVE", updatedAt: new Date() } }), db.update(invitations).set({ status: "ACCEPTED", acceptedAt: new Date() }).where(and(eq(invitations.id, row.id), eq(invitations.status, "PENDING")))]); await recordActivity(row.workspaceId, userId, "invitation.accepted", "invitation", row.id); return { kind: "ok" as const, workspaceId: row.workspaceId }; }

export async function listProjectAccess(workspaceId: string, projectId: string, userId: string) { const actor = await authorizeWorkspace(workspaceId, userId, "member.manage"); const project = await getDb().select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).get(); if (!actor || !project) return null; return getDb().select({ projectId: projectMembers.projectId, membershipId: projectMembers.membershipId, accessLevel: projectMembers.accessLevel, name: users.name, email: users.email }).from(projectMembers).innerJoin(memberships, eq(projectMembers.membershipId, memberships.id)).innerJoin(users, eq(memberships.userId, users.id)).where(eq(projectMembers.projectId, projectId)).all(); }
export async function setProjectAccess(workspaceId: string, projectId: string, membershipId: string, userId: string, accessLevel: "VIEW" | "COMMENT" | "EDIT" | null) { if (!await authorizeWorkspace(workspaceId, userId, "member.manage")) return false; const target = await getDb().select().from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId), ne(memberships.status, "LEFT"))).get(); const project = await getDb().select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).get(); if (!target || !project) return false; if (!accessLevel) await getDb().delete(projectMembers).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.membershipId, membershipId))).run(); else await getDb().insert(projectMembers).values({ projectId, membershipId, workspaceId, accessLevel }).onConflictDoUpdate({ target: [projectMembers.projectId, projectMembers.membershipId], set: { accessLevel } }); await recordActivity(workspaceId, userId, "project.access.updated", "project", projectId, { membershipId, accessLevel }); return true; }

function invitationDto(row: typeof invitations.$inferSelect, workspaceName: string) { return { id: row.id, workspaceId: row.workspaceId, workspaceName, email: row.emailNormalized, role: row.role, status: row.status, expiresAt: row.expiresAt.toISOString(), createdAt: row.createdAt.toISOString() }; }
async function hashToken(token: string) { const data = new TextEncoder().encode(token); const digest = await crypto.subtle.digest("SHA-256", data); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
