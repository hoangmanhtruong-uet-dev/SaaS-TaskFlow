import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { CreateTaskRequest, MoveTaskRequest, UpdateTaskRequest } from "@/app/types/api";
import { authorizeProject, authorizeWorkspace, getActiveMembership } from "./authorization";
import { getDb } from "./index";
import { boards, columns, projects, taskAssignees, tasks } from "./schema";
import { memberships, notifications } from "./schema";
import { recordActivity } from "./audit";
import { canArchiveTask } from "@/app/lib/permissions";

export async function listTasks(workspaceId: string, userId: string, projectId?: string, includeArchived = false) {
  if (!await authorizeWorkspace(workspaceId, userId, "task.read")) return null;
  if (projectId && !await authorizeProject(workspaceId, projectId, userId, "task.read")) return null;
  const conditions = [eq(tasks.workspaceId, workspaceId), includeArchived ? isNotNull(tasks.archivedAt) : isNull(tasks.archivedAt), projectId ? eq(tasks.projectId, projectId) : undefined];
  const rows = await getDb().select({ task: tasks, projectName: projects.name, columnName: columns.name }).from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id)).innerJoin(columns, eq(tasks.columnId, columns.id))
    .where(and(...conditions)).orderBy(asc(tasks.position)).all();
  const visible = [];
  for (const row of rows) if (await authorizeProject(workspaceId, row.task.projectId, userId, "task.read")) visible.push(await toTaskDto(row.task, row.projectName, row.columnName));
  return visible;
}

export async function getTask(workspaceId: string, taskId: string, userId: string) {
  const row = await getDb().select({ task: tasks, projectName: projects.name, columnName: columns.name }).from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id)).innerJoin(columns, eq(tasks.columnId, columns.id))
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId))).get();
  if (!row || !await authorizeProject(workspaceId, row.task.projectId, userId, "task.read")) return null;
  return toTaskDto(row.task, row.projectName, row.columnName);
}

export async function createTask(workspaceId: string, userId: string, input: CreateTaskRequest) {
  const access = await authorizeProject(workspaceId, input.projectId, userId, "task.create");
  if (!access) return null;
  const db = getDb();
  const location = await db.select({ board: boards, column: columns }).from(boards).innerJoin(columns, eq(columns.boardId, boards.id))
    .where(and(eq(boards.id, input.boardId), eq(boards.projectId, input.projectId), eq(boards.workspaceId, workspaceId), eq(columns.id, input.columnId), eq(columns.workspaceId, workspaceId))).get();
  if (!location) return null;
  const maxPosition = await db.select({ value: sql<number>`coalesce(max(${tasks.position}), 0)` }).from(tasks).where(and(eq(tasks.workspaceId, workspaceId), eq(tasks.columnId, input.columnId))).get();
  const id = `tsk_${crypto.randomUUID()}`;
  type BatchQuery = Parameters<typeof db.batch>[0][number];
  const writes: [BatchQuery, ...BatchQuery[]] = [db.insert(tasks).values({ id, workspaceId, projectId: input.projectId, boardId: input.boardId, columnId: input.columnId, creatorMembershipId: access.membership.id, title: input.title, description: input.description, priority: input.priority, dueAt: input.dueAt ? new Date(input.dueAt) : null, position: Number(maxPosition?.value ?? 0) + 1000 })];
  for (const membershipId of input.assigneeIds) {
    const assignee = await db.select({ userId: memberships.userId }).from(memberships).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId), eq(memberships.status, "ACTIVE"))).get();
    if (!assignee || !await authorizeProject(workspaceId, input.projectId, assignee.userId, "task.read")) return null;
    writes.push(db.insert(taskAssignees).values({ taskId: id, membershipId }).onConflictDoNothing());
    writes.push(db.insert(notifications).values({ id: `ntf_${crypto.randomUUID()}`, workspaceId, recipientUserId: assignee.userId, type: "ASSIGNMENT", title: "Bạn được giao một công việc", body: input.title }));
  }
  await db.batch(writes);
  await recordActivity(workspaceId, userId, "task.created", "task", id, { title: input.title, projectId: input.projectId });
  return getTask(workspaceId, id, userId);
}

export async function updateTask(workspaceId: string, taskId: string, userId: string, input: UpdateTaskRequest) {
  const current = await getDb().select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId))).get();
  if (!current || !await authorizeProject(workspaceId, current.projectId, userId, "task.update")) return { kind: "not_found" as const };
  const { expectedVersion, assigneeIds: _assigneeIds, dueAt, ...rest } = input;
  void _assigneeIds;
  const row = await getDb().update(tasks).set({ ...rest, ...(dueAt !== undefined ? { dueAt: dueAt ? new Date(dueAt) : null } : {}), version: sql`${tasks.version} + 1`, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId), eq(tasks.version, expectedVersion))).returning().get();
  if (!row) return { kind: "conflict" as const, current: await getTask(workspaceId, taskId, userId) };
  await recordActivity(workspaceId, userId, "task.updated", "task", taskId, { expectedVersion });
  return { kind: "ok" as const, task: await getTask(workspaceId, taskId, userId) };
}

export async function moveTask(workspaceId: string, taskId: string, userId: string, input: MoveTaskRequest) {
  const current = await getDb().select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId))).get();
  if (!current || !await authorizeProject(workspaceId, current.projectId, userId, "task.update")) return { kind: "not_found" as const };
  const destination = await getDb().select().from(columns).where(and(eq(columns.id, input.destinationColumnId), eq(columns.workspaceId, workspaceId), eq(columns.boardId, current.boardId))).get();
  if (!destination) return { kind: "invalid_destination" as const };
  const maxPosition = await getDb().select({ value: sql<number>`coalesce(max(${tasks.position}), 0)` }).from(tasks).where(and(eq(tasks.workspaceId, workspaceId), eq(tasks.columnId, destination.id))).get();
  const row = await getDb().update(tasks).set({ columnId: destination.id, position: Number(maxPosition?.value ?? 0) + 1000, version: sql`${tasks.version} + 1`, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId), eq(tasks.version, input.expectedVersion))).returning().get();
  if (!row) return { kind: "conflict" as const, current: await getTask(workspaceId, taskId, userId) };
  await recordActivity(workspaceId, userId, "task.moved", "task", taskId, { destinationColumnId: destination.id });
  return { kind: "ok" as const, task: await getTask(workspaceId, taskId, userId) };
}

export async function archiveTask(workspaceId: string, taskId: string, userId: string, restore = false) {
  const current = await getDb().select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId))).get();
  if (!current || !await authorizeProject(workspaceId, current.projectId, userId, "task.read")) return null;
  const membership = await getActiveMembership(workspaceId, userId);
  const project = await getDb().select().from(projects).where(and(eq(projects.id, current.projectId), eq(projects.workspaceId, workspaceId))).get();
  if (!membership || !project || !canArchiveTask(membership.role, membership.id, current.creatorMembershipId, project.leadMembershipId)) return null;
  await getDb().update(tasks).set({ archivedAt: restore ? null : new Date(), version: sql`${tasks.version} + 1`, updatedAt: new Date() }).where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId))).run();
  await recordActivity(workspaceId, userId, restore ? "task.restored" : "task.archived", "task", taskId);
  return getTask(workspaceId, taskId, userId);
}

async function toTaskDto(task: typeof tasks.$inferSelect, projectName: string, columnName: string) {
  const assignees = await getDb().select({ membershipId: taskAssignees.membershipId }).from(taskAssignees).where(eq(taskAssignees.taskId, task.id)).all();
  const tone = ({ LOW: "blue", MEDIUM: "amber", HIGH: "red", URGENT: "red" } as const)[task.priority];
  return { id: task.id, workspaceId: task.workspaceId, projectId: task.projectId, boardId: task.boardId, columnId: task.columnId, title: task.title, description: task.description, priority: task.priority, dueAt: task.dueAt?.toISOString() ?? null, assigneeIds: assignees.map((row) => row.membershipId), version: task.version, archivedAt: task.archivedAt?.toISOString() ?? null, projectName, columnName, tone };
}
