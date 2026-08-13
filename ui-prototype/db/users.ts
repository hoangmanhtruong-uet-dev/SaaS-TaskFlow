import { and, eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { identityFromUser } from "@/app/lib/auth";
import { getDb } from "./index";
import { memberships, users, workspaces } from "./schema";

export async function ensureCurrentUser(authUser: User) {
  const db = getDb();
  const identity = identityFromUser(authUser);
  await db.insert(users).values({ id: authUser.id, providerUserId: authUser.id, email: identity.email, name: identity.displayName, avatarUrl: identity.avatarUrl, emailVerifiedAt: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null })
    .onConflictDoUpdate({ target: users.id, set: { email: identity.email, name: identity.displayName, avatarUrl: identity.avatarUrl, emailVerifiedAt: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null, updatedAt: new Date() } });
  return db.select().from(users).where(eq(users.id, authUser.id)).get();
}

export async function listUserWorkspaces(userId: string) {
  return getDb().select({ id: workspaces.id, name: workspaces.name, slug: workspaces.slug, plan: workspaces.plan, role: memberships.role, archivedAt: workspaces.archivedAt, deletionRequestedAt: workspaces.deletionRequestedAt })
    .from(memberships).innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id)).where(and(eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).all();
}
