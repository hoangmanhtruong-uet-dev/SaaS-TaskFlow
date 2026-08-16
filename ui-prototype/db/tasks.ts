import { and, asc, count, eq, exists, gt, ilike, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import type { CreateTaskRequest, MoveTaskRequest, UpdateTaskRequest } from "@/app/types/api";
import { authorizeProject, getActiveMembership } from "./authorization";
import { getDb } from "./index";
import { boards, columns, projectMembers, projects, taskAssignees, taskChecklistItems, tasks } from "./schema";
import { memberships, notifications } from "./schema";
import { insertActivity, recordActivity } from "./audit";
import { canAccessProject, canArchiveTask } from "@/app/lib/permissions";
import { decodeCursor, encodeCursor } from "./pagination";

export async function listTasks(workspaceId: string, userId: string, projectId?: string, includeArchived = false, cursor?: string | null, limit = 50, search?: string) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership) return null;
  if (projectId && !await authorizeProject(workspaceId, projectId, userId, "task.read")) return null;
  const boundedLimit = Math.min(Math.max(limit, 1), 100);
  const decoded = decodeCursor<{ position: number; id: string }>(cursor);
  const access = membership.role === "OWNER" || membership.role === "ADMIN" ? undefined : exists(
    getDb().select({ value: sql`1` }).from(projects).where(and(
      eq(projects.id, tasks.projectId),
      or(
        membership.role === "MEMBER" ? eq(projects.visibility, "WORKSPACE") : undefined,
        exists(getDb().select({ value: sql`1` }).from(projectMembers).where(and(eq(projectMembers.projectId, tasks.projectId), eq(projectMembers.membershipId, membership.id)))),
      ),
    )),
  );
  const cursorCondition = decoded ? or(gt(tasks.position, decoded.position), and(eq(tasks.position, decoded.position), gt(tasks.id, decoded.id))) : undefined;
  const conditions = [eq(tasks.workspaceId, workspaceId), includeArchived ? isNotNull(tasks.archivedAt) : isNull(tasks.archivedAt), projectId ? eq(tasks.projectId, projectId) : undefined, access, cursorCondition, search ? ilike(tasks.title, `%${search.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`) : undefined];
  const rows = await getDb().select({ task: tasks, projectName: projects.name, columnName: columns.name }).from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id)).innerJoin(columns, eq(tasks.columnId, columns.id))
    .where(and(...conditions)).orderBy(asc(tasks.position), asc(tasks.id)).limit(boundedLimit + 1).all();
  const pageRows = rows.slice(0, boundedLimit) as Array<{ task: typeof tasks.$inferSelect; projectName: string; columnName: string }>;
  const taskIds = pageRows.map((row) => row.task.id);
  const [assigneeRows, checklistRows] = taskIds.length ? await Promise.all([
    getDb().select({ taskId: taskAssignees.taskId, membershipId: taskAssignees.membershipId }).from(taskAssignees).where(and(eq(taskAssignees.workspaceId, workspaceId), inArray(taskAssignees.taskId, taskIds))).all(),
    getDb().select({ taskId: taskChecklistItems.taskId, total: count(), completed: sql<number>`count(*) filter (where ${taskChecklistItems.completed})` }).from(taskChecklistItems).where(and(eq(taskChecklistItems.workspaceId, workspaceId), inArray(taskChecklistItems.taskId, taskIds))).groupBy(taskChecklistItems.taskId).all(),
  ]) : [[], []];
  const assignees = new Map<string, string[]>();
  for (const row of assigneeRows as Array<{ taskId: string; membershipId: string }>) assignees.set(row.taskId, [...(assignees.get(row.taskId) ?? []), row.membershipId]);
  const checklist = new Map((checklistRows as Array<{ taskId: string; total: number; completed: number }>).map((row) => [row.taskId, row]));
  const items = pageRows.map((row) => taskDto(row.task, row.projectName, row.columnName, assignees.get(row.task.id) ?? [], Number(checklist.get(row.task.id)?.total ?? 0), Number(checklist.get(row.task.id)?.completed ?? 0)));
  const last = pageRows.at(-1)?.task;
  return { items, nextCursor: rows.length > boundedLimit && last ? encodeCursor({ position: last.position, id: last.id }) : null };
}

export async function getTask(workspaceId: string, taskId: string, userId: string) {
  const row = await getDb().select({ task: tasks, projectName: projects.name, columnName: columns.name }).from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id)).innerJoin(columns, eq(tasks.columnId, columns.id))
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspaceId))).get();
  if (!row || !await authorizeProject(workspaceId, row.task.projectId, userId, "task.read")) return null;
  return toTaskDto(row.task, row.projectName, row.columnName);
}

export async function createTask(workspaceId: string, userId: string, input: CreateTaskRequest, database = getDb()) {
  const db = database;
  const membership = await db.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).get();
  const project = await db.select().from(projects).where(and(eq(projects.id, input.projectId), eq(projects.workspaceId, workspaceId))).get();
  const projectAccess = membership && project ? await db.select({ accessLevel: projectMembers.accessLevel }).from(projectMembers).where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.membershipId, membership.id))).get() : null;
  if (!membership || !project || !canAccessProject({ role: membership.role, visibility: project.visibility, permission: "task.create", accessLevel: projectAccess?.accessLevel })) return null;
  const location = await db.select({ board: boards, column: columns }).from(boards).innerJoin(columns, eq(columns.boardId, boards.id))
    .where(and(eq(boards.id, input.boardId), eq(boards.projectId, input.projectId), eq(boards.workspaceId, workspaceId), eq(columns.id, input.columnId), eq(columns.workspaceId, workspaceId))).get();
  if (!location) return null;
  await db.execute(sql`select id from public.board_columns where workspace_id = ${workspaceId} and id = ${input.columnId} for update`);
  const maxPosition = await db.select({ value: sql<number>`coalesce(max(${tasks.position}), 0)` }).from(tasks).where(and(eq(tasks.workspaceId, workspaceId), eq(tasks.columnId, input.columnId))).get();
  const id = crypto.randomUUID();
  const position = Number(maxPosition?.value ?? 0) + 1000;
  const assigneeUsers: Array<{ membershipId: string; userId: string }> = [];
  for (const membershipId of input.assigneeIds) {
    const assignee = await db.select({ membership: memberships, accessLevel: projectMembers.accessLevel }).from(memberships).leftJoin(projectMembers, and(eq(projectMembers.membershipId, memberships.id), eq(projectMembers.projectId, project.id))).where(and(eq(memberships.id, membershipId), eq(memberships.workspaceId, workspaceId), eq(memberships.status, "ACTIVE"))).get();
    if (!assignee || !canAccessProject({ role: assignee.membership.role, visibility: project.visibility, permission: "task.read", accessLevel: assignee.accessLevel })) return null;
    assigneeUsers.push({ membershipId, userId: assignee.membership.userId });
  }
  const dueAt = input.dueAt ? new Date(input.dueAt) : null;
  await db.insert(tasks).values({ id, workspaceId, projectId: input.projectId, boardId: input.boardId, columnId: input.columnId, creatorMembershipId: membership.id, title: input.title, description: input.description, priority: input.priority, dueAt, position });
  for (const assignee of assigneeUsers) {
    await db.insert(taskAssignees).values({ workspaceId, taskId: id, membershipId: assignee.membershipId }).onConflictDoNothing();
    await db.insert(notifications).values({ id: crypto.randomUUID(), workspaceId, recipientUserId: assignee.userId, type: "ASSIGNMENT", title: "Bạn được giao một công việc", body: input.title });
  }
  await insertActivity(db, workspaceId, userId, "task.created", "task", id, { title: input.title, projectId: input.projectId });
  const inserted = { id, workspaceId, projectId: input.projectId, boardId: input.boardId, columnId: input.columnId, creatorMembershipId: membership.id, title: input.title, description: input.description, priority: input.priority, dueAt, position, version: 1, archivedAt: null, createdAt: new Date(), updatedAt: new Date() } as typeof tasks.$inferSelect;
  return taskDto(inserted, project.name, location.column.name, assigneeUsers.map((item) => item.membershipId), 0, 0);
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
  const [assignees, checklist] = await Promise.all([
    getDb().select({ membershipId: taskAssignees.membershipId }).from(taskAssignees).where(and(eq(taskAssignees.workspaceId, task.workspaceId), eq(taskAssignees.taskId, task.id))).all(),
    getDb().select({ total: count(), completed: sql<number>`count(*) filter (where ${taskChecklistItems.completed})` }).from(taskChecklistItems).where(and(eq(taskChecklistItems.workspaceId, task.workspaceId), eq(taskChecklistItems.taskId, task.id))).get(),
  ]);
  return taskDto(task, projectName, columnName, assignees.map((row: { membershipId: string }) => row.membershipId), Number(checklist?.total ?? 0), Number(checklist?.completed ?? 0));
}

function taskDto(task: typeof tasks.$inferSelect, projectName: string, columnName: string, assigneeIds: string[], checklistTotal: number, checklistCompleted: number) {
  const tone = ({ LOW: "blue", MEDIUM: "amber", HIGH: "red", URGENT: "red" } as const)[task.priority];
  return { id: task.id, workspaceId: task.workspaceId, projectId: task.projectId, boardId: task.boardId, columnId: task.columnId, title: task.title, description: task.description, priority: task.priority, dueAt: task.dueAt?.toISOString() ?? null, assigneeIds, version: task.version, archivedAt: task.archivedAt?.toISOString() ?? null, projectName, columnName, tone, checklistTotal, checklistCompleted };
}
