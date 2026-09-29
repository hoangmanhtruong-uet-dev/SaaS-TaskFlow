import type { CreateProjectRequest } from "@/app/types/api";
import { authorizeProject, getActiveMembership } from "./authorization";
import { insertActivity, recordActivity } from "./audit";
import { canArchiveProject, can } from "@/app/lib/permissions";
import { resolveEntitlements } from "@/app/lib/billing-entitlements";
import { stripeEnv } from "@/app/lib/env";
import { decodeCursor, encodeCursor } from "./pagination";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

type ProjectRow = {
  id: string;
  workspace_id?: string;
  workspaceId?: string;
  name: string;
  description: string | null;
  visibility: "WORKSPACE" | "PRIVATE";
  archived_at?: string | null;
  archivedAt?: Date | string | null;
  lead_membership_id?: string | null;
};

type ProjectTaskRow = {
  project_id: string;
  columns: { name?: string | null } | null;
};

export async function listProjects(workspaceId: string, userId: string, includeArchived = false, cursor?: string | null, limit = 50) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership) return null;
  const boundedLimit = Math.min(Math.max(limit, 1), 100);
  const decoded = decodeCursor<{ updatedAt: string; id: string }>(cursor);
  const supabase = createSupabaseAdminClient();

  let query = supabase.from("projects").select("*").eq("workspace_id", workspaceId);

  if (includeArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  if (decoded) {
    query = query.lt("updated_at", decoded.updatedAt);
  }

  const { data: rows, error } = await query
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(boundedLimit + 1);

  if (error || !rows) {
    console.error("listProjects error:", error);
    return { items: [], nextCursor: null };
  }

  const pageRows = rows.slice(0, boundedLimit);
  const ids = pageRows.map((p: ProjectRow) => p.id);

  const countsMap = new Map<string, { total: number; done: number }>();

  if (ids.length > 0) {
    const { data: taskRows } = await supabase
      .from("tasks")
      .select("project_id, columns!inner(name)")
      .in("project_id", ids)
      .is("archived_at", null);

    if (taskRows) {
      for (const t of taskRows as ProjectTaskRow[]) {
        const stats = countsMap.get(t.project_id) ?? { total: 0, done: 0 };
        stats.total += 1;
        if (t.columns?.name === "Hoàn thành") {
          stats.done += 1;
        }
        countsMap.set(t.project_id, stats);
      }
    }
  }

  const items = pageRows.map((project: ProjectRow) => {
    const stats = countsMap.get(project.id) ?? { total: 0, done: 0 };
    return projectDtoFromDb(project, stats.total, stats.done);
  });

  const last = pageRows.at(-1);
  return {
    items,
    nextCursor: rows.length > boundedLimit && last ? encodeCursor({ updatedAt: last.updated_at, id: last.id }) : null,
  };
}

export async function getProject(workspaceId: string, projectId: string, userId: string) {
  const access = await authorizeProject(workspaceId, projectId, userId, "task.read");
  return access ? toProjectDtoSupabase(access.project) : null;
}

export async function createProject(workspaceId: string, userId: string, input: CreateProjectRequest) {
  const supabase = createSupabaseAdminClient();
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership || !can(membership.role, "project.create")) return { kind: "denied" as const };

  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("workspace_id", workspaceId).maybeSingle();
  const entitlements = resolveEntitlements({
    status: subscription?.status ?? null,
    quantity: subscription?.quantity ?? null,
    priceMatches: subscription?.stripe_price_id === stripeEnv().STRIPE_PRICE_PRO_MONTHLY,
  });

  const { count: activeCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("archived_at", null);

  if (entitlements.projectLimit !== null && Number(activeCount ?? 0) >= entitlements.projectLimit) return { kind: "project_limit" as const };
  if (input.visibility === "PRIVATE" && !entitlements.canUseAdvancedPermissions) return { kind: "pro_required" as const };

  const projectId = crypto.randomUUID();
  const boardId = crypto.randomUUID();
  const defaultColumns = ["Backlog", "Đang làm", "Review", "Hoàn thành"].map((name, index) => ({
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    board_id: boardId,
    name,
    position: (index + 1) * 1000,
  }));

  const { error: projErr } = await supabase.from("projects").insert({
    id: projectId,
    workspace_id: workspaceId,
    name: input.name,
    description: input.description ?? null,
    visibility: input.visibility,
  });

  if (projErr) throw new Error(`createProject failed: ${projErr.message}`);

  await supabase.from("boards").insert({ id: boardId, workspace_id: workspaceId, project_id: projectId, name: "Công việc" });
  for (const col of defaultColumns) {
    await supabase.from("columns").insert(col);
  }

  await insertActivity(null, workspaceId, userId, "project.created", "project", projectId, { name: input.name });

  const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).single();
  return project ? { kind: "ok" as const, project: projectDtoFromDb(project, 0, 0) } : { kind: "denied" as const };
}

export async function updateProject(workspaceId: string, projectId: string, userId: string, input: Partial<CreateProjectRequest>) {
  if (!(await authorizeProject(workspaceId, projectId, userId, "project.update"))) return null;
  const supabase = createSupabaseAdminClient();
  const changes = { ...input, updated_at: new Date().toISOString() };
  const { data: row } = await supabase.from("projects").update(changes).eq("id", projectId).eq("workspace_id", workspaceId).select().maybeSingle();
  if (row) await recordActivity(workspaceId, userId, "project.updated", "project", projectId, input);
  return row ? toProjectDtoSupabase(row) : null;
}

export async function archiveProject(workspaceId: string, projectId: string, userId: string, restore = false) {
  const membership = await getActiveMembership(workspaceId, userId);
  const supabase = createSupabaseAdminClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).eq("workspace_id", workspaceId).maybeSingle();
  if (!membership || !project || !canArchiveProject(membership.role, membership.id, project.lead_membership_id)) return null;

  const { data: row } = await supabase
    .from("projects")
    .update({ archived_at: restore ? null : new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("workspace_id", workspaceId)
    .select()
    .maybeSingle();

  if (row) await recordActivity(workspaceId, userId, restore ? "project.restored" : "project.archived", "project", projectId);
  return row ? toProjectDtoSupabase(row) : null;
}

async function toProjectDtoSupabase(project: ProjectRow) {
  const supabase = createSupabaseAdminClient();
  const { data: taskRows } = await supabase
    .from("tasks")
    .select("columns!inner(name)")
    .eq("project_id", project.id)
    .is("archived_at", null);

  const total = taskRows?.length ?? 0;
  const done = (taskRows as ProjectTaskRow[] | null)?.filter((t) => t.columns?.name === "Hoàn thành").length ?? 0;

  return projectDtoFromDb(project, total, done);
}

function projectDtoFromDb(project: ProjectRow, total: number, done: number) {
  return {
    id: project.id,
    workspaceId: project.workspace_id ?? project.workspaceId,
    name: project.name,
    description: project.description ?? "",
    visibility: project.visibility,
    taskCount: total,
    progress: total ? Math.round((done / total) * 100) : 0,
    archivedAt: project.archived_at
      ? new Date(project.archived_at).toISOString()
      : project.archivedAt
        ? new Date(project.archivedAt).toISOString()
        : null,
  };
}

export async function listProjectBoards(workspaceId: string, projectId: string, userId: string) {
  if (!(await authorizeProject(workspaceId, projectId, userId, "task.read"))) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("boards").select("*").eq("workspace_id", workspaceId).eq("project_id", projectId);
  return data ?? [];
}

export async function createBoard(workspaceId: string, projectId: string, userId: string, name: string) {
  if (!(await authorizeProject(workspaceId, projectId, userId, "project.update"))) return null;
  const supabase = createSupabaseAdminClient();
  const id = crypto.randomUUID();
  await supabase.from("boards").insert({ id, workspace_id: workspaceId, project_id: projectId, name });
  await recordActivity(workspaceId, userId, "board.created", "board", id, { projectId, name });
  const { data } = await supabase.from("boards").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function listBoardColumns(workspaceId: string, boardId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: board } = await supabase.from("boards").select("*").eq("id", boardId).eq("workspace_id", workspaceId).maybeSingle();
  if (!board || !(await authorizeProject(workspaceId, board.project_id, userId, "task.read"))) return null;

  const { data } = await supabase.from("columns").select("*").eq("workspace_id", workspaceId).eq("board_id", boardId).order("position", { ascending: true });
  return data ?? [];
}
