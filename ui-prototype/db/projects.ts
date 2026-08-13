import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { CreateProjectRequest } from "@/app/types/api";
import { authorizeProject, authorizeWorkspace, getActiveMembership } from "./authorization";
import { boards, columns, projectMembers, projects, tasks } from "./schema";
import { getDb } from "./index";
import { recordActivity } from "./audit";
import { canArchiveProject } from "@/app/lib/permissions";

export async function listProjects(workspaceId: string, userId: string, includeArchived = false) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership) return null;
  const rows = await getDb().select().from(projects).where(and(eq(projects.workspaceId, workspaceId), includeArchived ? isNotNull(projects.archivedAt) : isNull(projects.archivedAt))).all();
  const privateAccess = new Set((await getDb().select({ projectId: projectMembers.projectId }).from(projectMembers).where(eq(projectMembers.membershipId, membership.id)).all()).map((row) => row.projectId));
  const visible = rows.filter((project) => membership.role === "OWNER" || membership.role === "ADMIN" || (membership.role === "MEMBER" && project.visibility === "WORKSPACE") || privateAccess.has(project.id));
  return Promise.all(visible.map(toProjectDto));
}

export async function getProject(workspaceId: string, projectId: string, userId: string) {
  const access = await authorizeProject(workspaceId, projectId, userId, "task.read");
  return access ? toProjectDto(access.project) : null;
}

export async function createProject(workspaceId: string, userId: string, input: CreateProjectRequest) {
  if (!await authorizeWorkspace(workspaceId, userId, "project.create")) return null;
  const db = getDb();
  const projectId = `prj_${crypto.randomUUID()}`;
  const boardId = `brd_${crypto.randomUUID()}`;
  const defaultColumns = ["Backlog", "Đang làm", "Review", "Hoàn thành"].map((name, index) => ({ id: `col_${crypto.randomUUID()}`, workspaceId, boardId, name, position: (index + 1) * 1000 }));
  await db.batch([
    db.insert(projects).values({ id: projectId, workspaceId, name: input.name, description: input.description, visibility: input.visibility }),
    db.insert(boards).values({ id: boardId, workspaceId, projectId, name: "Công việc" }),
    ...defaultColumns.map((column) => db.insert(columns).values(column)),
  ]);
  await recordActivity(workspaceId, userId, "project.created", "project", projectId, { name: input.name });
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  return project ? toProjectDto(project) : null;
}

export async function updateProject(workspaceId: string, projectId: string, userId: string, input: Partial<CreateProjectRequest>) {
  if (!await authorizeProject(workspaceId, projectId, userId, "project.update")) return null;
  const changes = { ...input, updatedAt: new Date() };
  const row = await getDb().update(projects).set(changes).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).returning().get();
  if (row) await recordActivity(workspaceId, userId, "project.updated", "project", projectId, input);
  return row ? toProjectDto(row) : null;
}

export async function archiveProject(workspaceId: string, projectId: string, userId: string, restore = false) {
  const membership = await getActiveMembership(workspaceId, userId);
  const project = await getDb().select().from(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).get();
  if (!membership || !project || !canArchiveProject(membership.role, membership.id, project.leadMembershipId)) return null;
  const row = await getDb().update(projects).set({ archivedAt: restore ? null : new Date(), updatedAt: new Date() }).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId))).returning().get();
  if (row) await recordActivity(workspaceId, userId, restore ? "project.restored" : "project.archived", "project", projectId);
  return row ? toProjectDto(row) : null;
}

async function toProjectDto(project: typeof projects.$inferSelect) {
  const counts = await getDb().select({ total: sql<number>`count(*)`, done: sql<number>`sum(case when ${columns.name} = 'Hoàn thành' then 1 else 0 end)` }).from(tasks).innerJoin(columns, eq(tasks.columnId, columns.id)).where(and(eq(tasks.projectId, project.id), isNull(tasks.archivedAt))).get();
  const total = Number(counts?.total ?? 0); const done = Number(counts?.done ?? 0);
  return { id: project.id, workspaceId: project.workspaceId, name: project.name, description: project.description, visibility: project.visibility, taskCount: total, progress: total ? Math.round(done / total * 100) : 0, archivedAt: project.archivedAt?.toISOString() ?? null };
}

export async function listProjectBoards(workspaceId: string, projectId: string, userId: string) {
  if (!await authorizeProject(workspaceId, projectId, userId, "task.read")) return null;
  return getDb().select().from(boards).where(and(eq(boards.workspaceId, workspaceId), eq(boards.projectId, projectId))).all();
}

export async function createBoard(workspaceId: string, projectId: string, userId: string, name: string) {
  if (!await authorizeProject(workspaceId, projectId, userId, "project.update")) return null;
  const id = `brd_${crypto.randomUUID()}`;
  await getDb().insert(boards).values({ id, workspaceId, projectId, name });
  await recordActivity(workspaceId, userId, "board.created", "board", id, { projectId, name });
  return getDb().select().from(boards).where(eq(boards.id, id)).get();
}

export async function listBoardColumns(workspaceId: string, boardId: string, userId: string) {
  const board = await getDb().select().from(boards).where(and(eq(boards.id, boardId), eq(boards.workspaceId, workspaceId))).get();
  if (!board || !await authorizeProject(workspaceId, board.projectId, userId, "task.read")) return null;
  return getDb().select().from(columns).where(and(eq(columns.workspaceId, workspaceId), eq(columns.boardId, boardId))).orderBy(columns.position).all();
}
