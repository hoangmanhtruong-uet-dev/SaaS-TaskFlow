import { and, eq } from "drizzle-orm";
import { authorizeWorkspace, getActiveMembership } from "./authorization";
import { getDb } from "./index";
import { memberships, outboxEvents, workspaces } from "./schema";
import { recordActivity } from "./audit";

export async function transferOwnership(workspaceId: string, ownerUserId: string, targetMembershipId: string) {
  const owner = await getActiveMembership(workspaceId, ownerUserId);
  if (!owner || owner.role !== "OWNER") return { kind: "denied" as const };
  const target = await getDb().select().from(memberships).where(and(eq(memberships.id, targetMembershipId), eq(memberships.workspaceId, workspaceId), eq(memberships.status, "ACTIVE"))).get();
  if (!target || target.role === "GUEST" || target.id === owner.id) return { kind: "invalid_target" as const };
  await getDb().batch([
    getDb().update(memberships).set({ role: "ADMIN", updatedAt: new Date() }).where(eq(memberships.id, owner.id)),
    getDb().update(memberships).set({ role: "OWNER", updatedAt: new Date() }).where(eq(memberships.id, target.id)),
  ]);
  await recordActivity(workspaceId, ownerUserId, "workspace.ownership.transferred", "workspace", workspaceId, { fromMembershipId: owner.id, toMembershipId: target.id });
  return { kind: "ok" as const };
}

export async function requestWorkspaceDeletion(workspaceId: string, userId: string, confirmation: string) {
  const membership = await authorizeWorkspace(workspaceId, userId, "workspace.archive"); if (!membership || membership.role !== "OWNER") return { kind: "denied" as const };
  const workspace = await getDb().select().from(workspaces).where(eq(workspaces.id, workspaceId)).get(); if (!workspace) return { kind: "not_found" as const };
  if (confirmation !== workspace.name) return { kind: "confirmation_mismatch" as const };
  const requestedAt = new Date(); const scheduledFor = new Date(requestedAt.getTime() + 30 * 86400000);
  await getDb().batch([
    getDb().update(workspaces).set({ deletionRequestedAt: requestedAt, deletionScheduledFor: scheduledFor, archivedAt: workspace.archivedAt ?? requestedAt, updatedAt: requestedAt }).where(eq(workspaces.id, workspaceId)),
    getDb().insert(outboxEvents).values({ id: crypto.randomUUID(), workspaceId, type: "WORKSPACE_DELETE_SCHEDULED", payload: { workspaceId, requestedByUserId: userId }, availableAt: scheduledFor }),
  ]);
  await recordActivity(workspaceId, userId, "workspace.deletion.requested", "workspace", workspaceId, { scheduledFor: scheduledFor.toISOString() });
  return { kind: "ok" as const, requestedAt, scheduledFor, workspaceName: workspace.name };
}
export async function cancelWorkspaceDeletion(workspaceId: string, userId: string) { const membership = await authorizeWorkspace(workspaceId, userId, "workspace.archive"); if (!membership || membership.role !== "OWNER") return false; await getDb().update(workspaces).set({ deletionRequestedAt: null, deletionScheduledFor: null, updatedAt: new Date() }).where(eq(workspaces.id, workspaceId)).run(); await recordActivity(workspaceId, userId, "workspace.deletion.cancelled", "workspace", workspaceId); return true; }
