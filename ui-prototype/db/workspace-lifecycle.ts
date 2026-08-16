import { and, eq, sql } from "drizzle-orm";
import { authorizeWorkspace } from "./authorization";
import { getDb } from "./index";
import { memberships, outboxEvents, workspaces } from "./schema";
import { insertActivity, recordActivity } from "./audit";

export async function transferOwnership(workspaceId: string, ownerUserId: string, targetMembershipId: string) {
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    await transaction.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
    const owner = await transaction.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, ownerUserId), eq(memberships.status, "ACTIVE"))).get();
    if (!owner || owner.role !== "OWNER") return { kind: "denied" as const };
    const target = await transaction.select().from(memberships).where(and(eq(memberships.id, targetMembershipId), eq(memberships.workspaceId, workspaceId), eq(memberships.status, "ACTIVE"))).get();
    if (!target || target.role === "GUEST" || target.id === owner.id) return { kind: "invalid_target" as const };
    await transaction.update(memberships).set({ role: "ADMIN", updatedAt: new Date() }).where(eq(memberships.id, owner.id));
    await transaction.update(memberships).set({ role: "OWNER", updatedAt: new Date() }).where(eq(memberships.id, target.id));
    await insertActivity(transaction, workspaceId, ownerUserId, "workspace.ownership.transferred", "workspace", workspaceId, { fromMembershipId: owner.id, toMembershipId: target.id });
    return { kind: "ok" as const };
  });
}

export async function requestWorkspaceDeletion(workspaceId: string, userId: string, confirmation: string) {
  return getDb().transaction(async (transaction: ReturnType<typeof getDb>) => {
    await transaction.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
    const membership = await transaction.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).get();
    if (!membership || membership.role !== "OWNER") return { kind: "denied" as const };
    const workspace = await transaction.select().from(workspaces).where(eq(workspaces.id, workspaceId)).get();
    if (!workspace) return { kind: "not_found" as const };
    if (confirmation !== workspace.name) return { kind: "confirmation_mismatch" as const };
    const requestedAt = new Date(); const scheduledFor = new Date(requestedAt.getTime() + 30 * 86400000);
    await transaction.update(workspaces).set({ deletionRequestedAt: requestedAt, deletionScheduledFor: scheduledFor, archivedAt: workspace.archivedAt ?? requestedAt, updatedAt: requestedAt }).where(eq(workspaces.id, workspaceId));
    await transaction.insert(outboxEvents).values({ id: crypto.randomUUID(), workspaceId, type: "WORKSPACE_DELETE_SCHEDULED", dedupKey: `workspace-delete:${scheduledFor.toISOString()}`, payload: { workspaceId, requestedByUserId: userId }, availableAt: scheduledFor });
    await insertActivity(transaction, workspaceId, userId, "workspace.deletion.requested", "workspace", workspaceId, { scheduledFor: scheduledFor.toISOString() });
    return { kind: "ok" as const, requestedAt, scheduledFor, workspaceName: workspace.name };
  });
}
export async function cancelWorkspaceDeletion(workspaceId: string, userId: string) { const membership = await authorizeWorkspace(workspaceId, userId, "workspace.archive"); if (!membership || membership.role !== "OWNER") return false; await getDb().update(workspaces).set({ deletionRequestedAt: null, deletionScheduledFor: null, updatedAt: new Date() }).where(eq(workspaces.id, workspaceId)).run(); await recordActivity(workspaceId, userId, "workspace.deletion.cancelled", "workspace", workspaceId); return true; }
