import { and, asc, eq, isNull } from "drizzle-orm";
import { authorizeProject, getActiveMembership } from "./authorization";
import { getDb } from "./index";
import { comments, memberships, notifications, projectMembers, tasks, users } from "./schema";
import { recordActivity } from "./audit";

async function taskAccess(workspaceId: string, taskId: string, userId: string, permission: "comment.read" | "comment.create") {
  const task = await getDb().select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId), isNull(tasks.archivedAt))).get();
  if (!task) return null;
  const access = await authorizeProject(workspaceId, task.projectId, userId, permission);
  return access ? { task, ...access } : null;
}
export async function listComments(workspaceId: string, taskId: string, userId: string) {
  if (!await taskAccess(workspaceId, taskId, userId, "comment.read")) return null;
  const rows = await getDb().select({ comment: comments, authorName: users.name, authorUserId: users.id }).from(comments).innerJoin(memberships, eq(comments.authorMembershipId, memberships.id)).innerJoin(users, eq(memberships.userId, users.id)).where(and(eq(comments.workspaceId, workspaceId), eq(comments.taskId, taskId))).orderBy(asc(comments.createdAt)).all();
  return rows.map(({ comment, authorName, authorUserId }: { comment: typeof comments.$inferSelect; authorName: string; authorUserId: string }) => ({ id: comment.id, taskId: comment.taskId, body: comment.deletedAt ? "Bình luận đã bị xóa" : comment.hiddenByAdminAt ? "Bình luận đã bị quản trị viên ẩn" : comment.body, authorName, authorUserId, hidden: Boolean(comment.hiddenByAdminAt), deleted: Boolean(comment.deletedAt), createdAt: comment.createdAt.toISOString(), updatedAt: comment.updatedAt.toISOString() }));
}
export async function createComment(workspaceId: string, taskId: string, userId: string, body: string) {
  const access = await taskAccess(workspaceId, taskId, userId, "comment.create"); if (!access) return null;
  const id = crypto.randomUUID(); await getDb().insert(comments).values({ id, workspaceId, taskId, authorMembershipId: access.membership.id, body });
  const mentionEmails = [...body.matchAll(/@([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)].map((match) => match[1].toLowerCase());
  for (const email of new Set(mentionEmails)) {
    const mentioned = await getDb().select({ userId: users.id, role: memberships.role, membershipId: memberships.id }).from(users).innerJoin(memberships, eq(users.id, memberships.userId)).where(and(eq(users.emailNormalized, email), eq(memberships.workspaceId, workspaceId), eq(memberships.status, "ACTIVE"))).get();
    if (!mentioned || mentioned.userId === userId) continue;
    const allowed = access.project.visibility === "WORKSPACE" || mentioned.role === "OWNER" || mentioned.role === "ADMIN" || Boolean(await getDb().select().from(projectMembers).where(and(eq(projectMembers.projectId, access.project.id), eq(projectMembers.membershipId, mentioned.membershipId))).get());
    if (allowed) await getDb().insert(notifications).values({ id: crypto.randomUUID(), workspaceId, recipientUserId: mentioned.userId, type: "MENTION", title: "Bạn được nhắc trong bình luận", body: body.slice(0, 240) });
  }
  await recordActivity(workspaceId, userId, "comment.created", "comment", id, { taskId });
  return (await listComments(workspaceId, taskId, userId))?.find((comment: { id: string }) => comment.id === id) ?? null;
}
export async function deleteComment(workspaceId: string, commentId: string, userId: string) {
  const comment = await getDb().select().from(comments).where(and(eq(comments.id, commentId), eq(comments.workspaceId, workspaceId))).get(); const actor = await getActiveMembership(workspaceId, userId); if (!comment || !actor) return false;
  if (comment.authorMembershipId !== actor.id && actor.role !== "OWNER" && actor.role !== "ADMIN") return false;
  await getDb().update(comments).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(comments.id, commentId)).run(); await recordActivity(workspaceId, userId, "comment.deleted", "comment", commentId); return true;
}
export async function hideComment(workspaceId: string, commentId: string, userId: string) { const actor = await getActiveMembership(workspaceId, userId); if (!actor || (actor.role !== "OWNER" && actor.role !== "ADMIN")) return false; const row = await getDb().update(comments).set({ hiddenByAdminAt: new Date(), updatedAt: new Date() }).where(and(eq(comments.id, commentId), eq(comments.workspaceId, workspaceId))).returning().get(); if (row) await recordActivity(workspaceId, userId, "comment.hidden", "comment", commentId); return Boolean(row); }
