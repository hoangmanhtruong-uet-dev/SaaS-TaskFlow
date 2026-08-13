import { and, eq } from "drizzle-orm";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "./index";
import { memberships, users, workspaces } from "./schema";

export async function ensureCurrentUser(identity: ChatGPTUser) {
  const db = getDb();
  const emailNormalized = identity.email.trim().toLowerCase();
  const id = `usr_${identity.userId}`;
  await db.insert(users).values({ id, providerUserId: identity.userId, email: identity.email, emailNormalized, name: identity.displayName, emailVerifiedAt: new Date() })
    .onConflictDoUpdate({ target: users.providerUserId, set: { email: identity.email, emailNormalized, name: identity.displayName, updatedAt: new Date() } });
  const user = await db.select().from(users).where(eq(users.providerUserId, identity.userId)).get();
  if (!user) return undefined;
  const workspaceId = `ws_${identity.userId}`;
  await db.insert(workspaces).values({ id: workspaceId, name: `Không gian của ${identity.displayName}`, slug: `workspace-${identity.userId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24)}` }).onConflictDoNothing();
  await db.insert(memberships).values({ id: `mem_${identity.userId}`, workspaceId, userId: user.id, role: "OWNER" }).onConflictDoNothing();
  return user;
}

export async function listUserWorkspaces(userId: string) {
  return getDb().select({ id: workspaces.id, name: workspaces.name, slug: workspaces.slug, plan: workspaces.plan, role: memberships.role, archivedAt: workspaces.archivedAt, deletionRequestedAt: workspaces.deletionRequestedAt })
    .from(memberships).innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id)).where(and(eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).all();
}
