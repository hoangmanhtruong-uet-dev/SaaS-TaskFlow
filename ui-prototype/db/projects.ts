import { and, desc, eq, exists, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import type { CreateProjectRequest } from "@/app/types/api";
import { authorizeProject, getActiveMembership } from "./authorization";
import { boards, columns, projectMembers, projects, tasks } from "./schema";
import { getDb } from "./index";
import { insertActivity, recordActivity } from "./audit";
import { canArchiveProject } from "@/app/lib/permissions";
import { can } from "@/app/lib/permissions";
import { resolveEntitlements } from "@/app/lib/billing-entitlements";
import { stripeEnv } from "@/app/lib/env";
import { memberships, subscriptions } from "./schema";
import { decodeCursor, encodeCursor } from "./pagination";

export async function listProjects(workspaceId: string, userId: string, includeArchived = false, cursor?: string | null, limit = 50) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership) return null;
  const boundedLimit = Math.min(Math.max(limit, 1), 100);
  const decoded = decodeCursor<{ updatedAt: string; id: string }>(cursor);
  const access = membership.role === "OWNER" || membership.role === "ADMIN" ? undefined : or(
    membership.role === "MEMBER" ? eq(projects.visibility, "WORKSPACE") : undefined,
    exists(getDb().select({ value: sql`1` }).from(projectMembers).where(and(eq(projectMembers.projectId, projects.id), eq(projectMembers.membershipId, membership.id)))),
  );
  const cursorCondition = decoded ? or(
    lt(projects.updatedAt, new Date(decoded.updatedAt)),
    and(eq(projects.updatedAt, new Date(decoded.updatedAt)), lt(projects.id, decoded.id)),
  ) : undefined;
  const rows = await getDb().select().from(projects).where(and(
    eq(projects.workspaceId, workspaceId),
    includeArchived ? isNotNull(projects.archivedAt) : isNull(projects.archivedAt),
    access,
    cursorCondition,
  )).orderBy(desc(projects.updatedAt), desc(projects.id)).limit(boundedLimit + 1).all();
  const pageRows = rows.slice(0, boundedLimit) as Array<typeof projects.$inferSelect>;
  const ids = pageRows.map((project) => project.id);
  const countRows = ids.length ? await getDb().select({
    projectId: tasks.projectId,
    total: sql<number>`count(*)`,
    done: sql<number>`count(*) filter (where ${columns.name} = 'Hoàn thành')`,
  }).from(tasks).innerJoin(columns, eq(tasks.columnId, columns.id)).where(and(inArray(tasks.projectId, ids), isNull(tasks.archivedAt))).groupBy(tasks.projectId).all() : [];
  const counts = new Map<string, { projectId: string; total: number; done: number }>(
    countRows.map((row: { projectId: string; total: number; done: number }) => [row.projectId, row]),
  );
  const items = pageRows.map((project) => projectDto(project, Number(counts.get(project.id)?.total ?? 0), Number(counts.get(project.id)?.done ?? 0)));
  const last = pageRows.at(-1);
  return { items, nextCursor: rows.length > boundedLimit && last ? encodeCursor({ updatedAt: last.updatedAt.toISOString(), id: last.id }) : null };
}

export async function getProject(workspaceId: string, projectId: string, userId: string) {
  const access = await authorizeProject(workspaceId, projectId, userId, "task.read");
  return access ? toProjectDto(access.project) : null;
}

export async function createProject(workspaceId: string, userId: string, input: CreateProjectRequest, database = getDb()) {
  const db = database;
  await db.execute(sql`select id from public.workspaces where id = ${workspaceId} for update`);
  const membership = await db.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"))).get();
  if (!membership || !can(membership.role, "project.create")) return { kind: "denied" as const };
  const subscription = await db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)).get();
  const entitlements = resolveEntitlements({ status: subscription?.status ?? null, quantity: subscription?.quantity ?? null, priceMatches: subscription?.stripePriceId === stripeEnv().STRIPE_PRICE_PRO_MONTHLY });
  const active = await db.select({ count: sql<number>`count(*)` }).from(projects).where(and(eq(projects.workspaceId, workspaceId), isNull(projects.archivedAt))).get();
  if (entitlements.projectLimit !== null && Number(active?.count ?? 0) >= entitlements.projectLimit) return { kind: "project_limit" as const };
  if (input.visibility === "PRIVATE" && !entitlements.canUseAdvancedPermissions) return { kind: "pro_required" as const };
  const projectId = crypto.randomUUID();
  const boardId = crypto.randomUUID();
  const defaultColumns = ["Backlog", "Đang làm", "Review", "Hoàn thành"].map((name, index) => ({ id: crypto.randomUUID(), workspaceId, boardId, name, position: (index + 1) * 1000 }));
  await db.insert(projects).values({ id: projectId, workspaceId, name: input.name, description: input.description, visibility: input.visibility });
  await db.insert(boards).values({ id: boardId, workspaceId, projectId, name: "Công việc" });
  for (const column of defaultColumns) await db.insert(columns).values(column);
  await insertActivity(db, workspaceId, userId, "project.created", "project", projectId, { name: input.name });
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get();
  return project ? { kind: "ok" as const, project: projectDto(project, 0, 0) } : { kind: "denied" as const };
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
  return projectDto(project, total, done);
}

function projectDto(project: typeof projects.$inferSelect, total: number, done: number) {
  return { id: project.id, workspaceId: project.workspaceId, name: project.name, description: project.description, visibility: project.visibility, taskCount: total, progress: total ? Math.round(done / total * 100) : 0, archivedAt: project.archivedAt?.toISOString() ?? null };
}

export async function listProjectBoards(workspaceId: string, projectId: string, userId: string) {
  if (!await authorizeProject(workspaceId, projectId, userId, "task.read")) return null;
  return getDb().select().from(boards).where(and(eq(boards.workspaceId, workspaceId), eq(boards.projectId, projectId))).all();
}

export async function createBoard(workspaceId: string, projectId: string, userId: string, name: string) {
  if (!await authorizeProject(workspaceId, projectId, userId, "project.update")) return null;
  const id = crypto.randomUUID();
  await getDb().insert(boards).values({ id, workspaceId, projectId, name });
  await recordActivity(workspaceId, userId, "board.created", "board", id, { projectId, name });
  return getDb().select().from(boards).where(eq(boards.id, id)).get();
}

export async function listBoardColumns(workspaceId: string, boardId: string, userId: string) {
  const board = await getDb().select().from(boards).where(and(eq(boards.id, boardId), eq(boards.workspaceId, workspaceId))).get();
  if (!board || !await authorizeProject(workspaceId, board.projectId, userId, "task.read")) return null;
  return getDb().select().from(columns).where(and(eq(columns.workspaceId, workspaceId), eq(columns.boardId, boardId))).orderBy(columns.position).all();
}
