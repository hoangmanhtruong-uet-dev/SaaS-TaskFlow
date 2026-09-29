import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { authorizeProject } from "./authorization";
import { recordActivity } from "./audit";
import { getDb } from "./index";
import { taskChecklistItems, tasks } from "./schema";

export const MAX_CHECKLIST_ITEMS_PER_TASK = 100;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function taskAccess(workspaceId: string, taskId: string, userId: string, permission: "task.read" | "task.update") {
  if (!UUID_REGEX.test(taskId) || !UUID_REGEX.test(workspaceId)) return null;
  const task = await getDb().select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId), isNull(tasks.archivedAt))).get();
  if (!task) return null;
  const access = await authorizeProject(workspaceId, task.projectId, userId, permission);
  return access ? { task, ...access } : null;
}

function toDto(item: typeof taskChecklistItems.$inferSelect) {
  return {
    id: item.id,
    taskId: item.taskId,
    title: item.title,
    completed: item.completed,
    position: item.position,
    createdByUserId: item.createdByUserId,
    completedByUserId: item.completedByUserId,
    completedAt: item.completedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function listChecklistItems(workspaceId: string, taskId: string, userId: string) {
  if (!await taskAccess(workspaceId, taskId, userId, "task.read")) return null;
  const rows = await getDb().select().from(taskChecklistItems).where(and(eq(taskChecklistItems.workspaceId, workspaceId), eq(taskChecklistItems.taskId, taskId))).orderBy(asc(taskChecklistItems.position), asc(taskChecklistItems.createdAt)).all();
  return rows.map(toDto);
}

export async function createChecklistItem(workspaceId: string, taskId: string, userId: string, title: string) {
  if (!await taskAccess(workspaceId, taskId, userId, "task.update")) return null;
  const total = await getDb().select({ value: count() }).from(taskChecklistItems).where(and(eq(taskChecklistItems.workspaceId, workspaceId), eq(taskChecklistItems.taskId, taskId))).get();
  if ((total?.value ?? 0) >= MAX_CHECKLIST_ITEMS_PER_TASK) throw new Error("CHECKLIST_LIMIT_REACHED");
  const last = await getDb().select({ position: taskChecklistItems.position }).from(taskChecklistItems).where(and(eq(taskChecklistItems.workspaceId, workspaceId), eq(taskChecklistItems.taskId, taskId))).orderBy(desc(taskChecklistItems.position)).limit(1).get();
  const id = crypto.randomUUID();
  const item = await getDb().insert(taskChecklistItems).values({ id, workspaceId, taskId, title, position: (last?.position ?? -1) + 1, createdByUserId: userId }).returning().get();
  await recordActivity(workspaceId, userId, "task.checklist_item.created", "task", taskId, { checklistItemId: id });
  return item ? toDto(item) : null;
}

export async function updateChecklistItem(workspaceId: string, taskId: string, itemId: string, userId: string, input: { title?: string; completed?: boolean }) {
  if (!await taskAccess(workspaceId, taskId, userId, "task.update")) return null;
  const current = await getDb().select().from(taskChecklistItems).where(and(eq(taskChecklistItems.id, itemId), eq(taskChecklistItems.workspaceId, workspaceId), eq(taskChecklistItems.taskId, taskId))).get();
  if (!current) return null;
  const completionChanged = input.completed !== undefined && input.completed !== current.completed;
  const completed = input.completed ?? current.completed;
  const item = await getDb().update(taskChecklistItems).set({
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(completionChanged ? { completed, completedAt: completed ? new Date() : null, completedByUserId: completed ? userId : null } : {}),
    updatedAt: new Date(),
  }).where(and(eq(taskChecklistItems.id, itemId), eq(taskChecklistItems.workspaceId, workspaceId), eq(taskChecklistItems.taskId, taskId))).returning().get();
  if (!item) return null;
  const action = completionChanged ? (completed ? "task.checklist_item.completed" : "task.checklist_item.reopened") : "task.checklist_item.updated";
  await recordActivity(workspaceId, userId, action, "task", taskId, { checklistItemId: itemId });
  return toDto(item);
}

export async function deleteChecklistItem(workspaceId: string, taskId: string, itemId: string, userId: string) {
  if (!await taskAccess(workspaceId, taskId, userId, "task.update")) return false;
  const item = await getDb().delete(taskChecklistItems).where(and(eq(taskChecklistItems.id, itemId), eq(taskChecklistItems.workspaceId, workspaceId), eq(taskChecklistItems.taskId, taskId))).returning({ id: taskChecklistItems.id }).get();
  if (!item) return false;
  await recordActivity(workspaceId, userId, "task.checklist_item.deleted", "task", taskId, { checklistItemId: itemId });
  return true;
}
