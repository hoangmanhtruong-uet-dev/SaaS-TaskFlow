import type { CreateTaskRequest, MoveTaskRequest, UpdateTaskRequest } from "@/app/types/api";
import { authorizeProject, getActiveMembership } from "./authorization";
import { insertActivity, recordActivity } from "./audit";
import { canAccessProject, canArchiveTask } from "@/app/lib/permissions";
import { decodeCursor, encodeCursor } from "./pagination";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function listTasks(
  workspaceId: string,
  userId: string,
  projectId?: string,
  includeArchived = false,
  cursor?: string | null,
  limit = 50,
  search?: string
) {
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership) return null;
  if (projectId && !(await authorizeProject(workspaceId, projectId, userId, "task.read"))) return null;

  const boundedLimit = Math.min(Math.max(limit, 1), 100);
  const decoded = decodeCursor<{ position: number; id: string }>(cursor);
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("tasks")
    .select("*, projects!inner(name), columns!inner(name)")
    .eq("workspace_id", workspaceId);

  if (includeArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  if (search) {
    query = query.ilike("title", `%${search.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`);
  }

  if (decoded) {
    query = query.gt("position", decoded.position);
  }

  const { data: rows, error } = await query
    .order("position", { ascending: true })
    .order("id", { ascending: true })
    .limit(boundedLimit + 1);

  if (error || !rows) {
    console.error("listTasks error:", error);
    return { items: [], nextCursor: null };
  }

  const pageRows = rows.slice(0, boundedLimit);
  const taskIds = pageRows.map((r: any) => r.id);

  const assigneesMap = new Map<string, string[]>();
  const checklistMap = new Map<string, { total: number; completed: number }>();

  if (taskIds.length > 0) {
    const [assigneesRes, checklistRes] = await Promise.all([
      supabase.from("task_assignees").select("task_id, membership_id").eq("workspace_id", workspaceId).in("task_id", taskIds),
      supabase.from("task_checklist_items").select("task_id, completed").eq("workspace_id", workspaceId).in("task_id", taskIds),
    ]);

    if (assigneesRes.data) {
      for (const row of assigneesRes.data) {
        const existing = assigneesMap.get(row.task_id) ?? [];
        assigneesMap.set(row.task_id, [...existing, row.membership_id]);
      }
    }

    if (checklistRes.data) {
      for (const item of checklistRes.data) {
        const stats = checklistMap.get(item.task_id) ?? { total: 0, completed: 0 };
        stats.total += 1;
        if (item.completed) stats.completed += 1;
        checklistMap.set(item.task_id, stats);
      }
    }
  }

  const items = pageRows.map((r: any) => {
    const projName = r.projects?.name ?? "";
    const colName = r.columns?.name ?? "";
    const assigneeIds = assigneesMap.get(r.id) ?? [];
    const stats = checklistMap.get(r.id) ?? { total: 0, completed: 0 };

    return taskDtoFromDb(r, projName, colName, assigneeIds, stats.total, stats.completed);
  });

  const last = pageRows.at(-1);
  return {
    items,
    nextCursor: rows.length > boundedLimit && last ? encodeCursor({ position: last.position, id: last.id }) : null,
  };
}

export async function getTask(workspaceId: string, taskId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("tasks")
    .select("*, projects!inner(name), columns!inner(name)")
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !row || !(await authorizeProject(workspaceId, row.project_id, userId, "task.read"))) return null;

  return toTaskDtoSupabase(row, row.projects?.name ?? "", row.columns?.name ?? "");
}

export async function createTask(workspaceId: string, userId: string, input: CreateTaskRequest) {
  const supabase = createSupabaseAdminClient();
  const membership = await getActiveMembership(workspaceId, userId);
  if (!membership) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", input.projectId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!project) return null;

  const { data: projectAccess } = await supabase
    .from("project_members")
    .select("access_level")
    .eq("project_id", project.id)
    .eq("membership_id", membership.id)
    .maybeSingle();

  if (!canAccessProject({ role: membership.role, visibility: project.visibility, permission: "task.create", accessLevel: projectAccess?.access_level as any })) return null;

  const { data: board } = await supabase.from("boards").select("id").eq("id", input.boardId).eq("project_id", input.projectId).eq("workspace_id", workspaceId).maybeSingle();
  const { data: column } = await supabase.from("columns").select("id, name").eq("id", input.columnId).eq("workspace_id", workspaceId).maybeSingle();

  if (!board || !column) return null;

  const { data: maxPosRow } = await supabase
    .from("tasks")
    .select("position")
    .eq("workspace_id", workspaceId)
    .eq("column_id", input.columnId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const id = crypto.randomUUID();
  const position = Number(maxPosRow?.position ?? 0) + 1000;

  const assigneeUsers: Array<{ membershipId: string; userId: string }> = [];
  for (const membershipId of input.assigneeIds) {
    const { data: assignee } = await supabase.from("memberships").select("id, user_id, role").eq("id", membershipId).eq("workspace_id", workspaceId).eq("status", "ACTIVE").maybeSingle();
    if (!assignee) return null;
    const { data: assigneeAccess } = await supabase.from("project_members").select("access_level").eq("project_id", project.id).eq("membership_id", assignee.id).maybeSingle();
    if (!canAccessProject({ role: assignee.role, visibility: project.visibility, permission: "task.read", accessLevel: assigneeAccess?.access_level as any })) return null;
    assigneeUsers.push({ membershipId, userId: assignee.user_id });
  }

  const dueAt = input.dueAt ? new Date(input.dueAt).toISOString() : null;

  const taskData = {
    id,
    workspace_id: workspaceId,
    project_id: input.projectId,
    board_id: input.boardId,
    column_id: input.columnId,
    creator_membership_id: membership.id,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority,
    due_at: dueAt,
    position,
  };

  const { data: inserted, error } = await supabase.from("tasks").insert(taskData).select().single();
  if (error || !inserted) throw new Error(`createTask insert failed: ${error?.message}`);

  for (const assignee of assigneeUsers) {
    await supabase.from("task_assignees").insert({ workspace_id: workspaceId, task_id: id, membership_id: assignee.membershipId });
    await supabase.from("notifications").insert({ id: crypto.randomUUID(), workspace_id: workspaceId, recipient_user_id: assignee.userId, type: "ASSIGNMENT", title: "Bạn được giao một công việc", body: input.title });
  }

  await insertActivity(null, workspaceId, userId, "task.created", "task", id, { title: input.title, projectId: input.projectId });

  return taskDtoFromDb(inserted, project.name, column.name, assigneeUsers.map((a) => a.membershipId), 0, 0);
}

export async function updateTask(workspaceId: string, taskId: string, userId: string, input: UpdateTaskRequest) {
  const supabase = createSupabaseAdminClient();
  const { data: current } = await supabase.from("tasks").select("*").eq("id", taskId).eq("workspace_id", workspaceId).maybeSingle();
  if (!current || !(await authorizeProject(workspaceId, current.project_id, userId, "task.update"))) return { kind: "not_found" as const };

  const { expectedVersion, assigneeIds: _assigneeIds, dueAt, ...rest } = input;

  const updateData: any = {
    ...rest,
    ...(dueAt !== undefined ? { due_at: dueAt ? new Date(dueAt).toISOString() : null } : {}),
    version: current.version + 1,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .eq("version", expectedVersion)
    .select()
    .maybeSingle();

  if (error || !updated) return { kind: "conflict" as const, current: await getTask(workspaceId, taskId, userId) };
  await recordActivity(workspaceId, userId, "task.updated", "task", taskId, { expectedVersion });
  return { kind: "ok" as const, task: await getTask(workspaceId, taskId, userId) };
}

export async function moveTask(workspaceId: string, taskId: string, userId: string, input: MoveTaskRequest) {
  const supabase = createSupabaseAdminClient();
  const { data: current } = await supabase.from("tasks").select("*").eq("id", taskId).eq("workspace_id", workspaceId).maybeSingle();
  if (!current || !(await authorizeProject(workspaceId, current.project_id, userId, "task.update"))) return { kind: "not_found" as const };

  const { data: destination } = await supabase.from("columns").select("*").eq("id", input.destinationColumnId).eq("workspace_id", workspaceId).eq("board_id", current.board_id).maybeSingle();
  if (!destination) return { kind: "invalid_destination" as const };

  const { data: maxPosRow } = await supabase.from("tasks").select("position").eq("workspace_id", workspaceId).eq("column_id", destination.id).order("position", { ascending: false }).limit(1).maybeSingle();
  const position = Number(maxPosRow?.position ?? 0) + 1000;

  const { data: updated, error } = await supabase
    .from("tasks")
    .update({ column_id: destination.id, position, version: current.version + 1, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .eq("version", input.expectedVersion)
    .select()
    .maybeSingle();

  if (error || !updated) return { kind: "conflict" as const, current: await getTask(workspaceId, taskId, userId) };
  await recordActivity(workspaceId, userId, "task.moved", "task", taskId, { destinationColumnId: destination.id });
  return { kind: "ok" as const, task: await getTask(workspaceId, taskId, userId) };
}

export async function archiveTask(workspaceId: string, taskId: string, userId: string, restore = false) {
  const supabase = createSupabaseAdminClient();
  const { data: current } = await supabase.from("tasks").select("*").eq("id", taskId).eq("workspace_id", workspaceId).maybeSingle();
  if (!current || !(await authorizeProject(workspaceId, current.project_id, userId, "task.read"))) return null;

  const membership = await getActiveMembership(workspaceId, userId);
  const { data: project } = await supabase.from("projects").select("*").eq("id", current.project_id).eq("workspace_id", workspaceId).maybeSingle();
  if (!membership || !project || !canArchiveTask(membership.role, membership.id, current.creator_membership_id, project.lead_membership_id)) return null;

  await supabase
    .from("tasks")
    .update({ archived_at: restore ? null : new Date().toISOString(), version: current.version + 1, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("workspace_id", workspaceId);

  await recordActivity(workspaceId, userId, restore ? "task.restored" : "task.archived", "task", taskId);
  return getTask(workspaceId, taskId, userId);
}

async function toTaskDtoSupabase(task: any, projectName: string, columnName: string) {
  const supabase = createSupabaseAdminClient();
  const [assigneesRes, checklistRes] = await Promise.all([
    supabase.from("task_assignees").select("membership_id").eq("workspace_id", task.workspace_id).eq("task_id", task.id),
    supabase.from("task_checklist_items").select("completed").eq("workspace_id", task.workspace_id).eq("task_id", task.id),
  ]);

  const assigneeIds = assigneesRes.data?.map((r: any) => r.membership_id) ?? [];
  const items = checklistRes.data ?? [];
  const total = items.length;
  const completed = items.filter((i: any) => i.completed).length;

  return taskDtoFromDb(task, projectName, columnName, assigneeIds, total, completed);
}

function taskDtoFromDb(task: any, projectName: string, columnName: string, assigneeIds: string[], checklistTotal: number, checklistCompleted: number) {
  const tone = ({ LOW: "blue", MEDIUM: "amber", HIGH: "red", URGENT: "red" } as const)[task.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"];
  return {
    id: task.id,
    workspaceId: task.workspace_id,
    projectId: task.project_id,
    boardId: task.board_id,
    columnId: task.column_id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueAt: task.due_at ? new Date(task.due_at).toISOString() : null,
    assigneeIds,
    version: task.version,
    archivedAt: task.archived_at ? new Date(task.archived_at).toISOString() : null,
    projectName,
    columnName,
    tone,
    checklistTotal,
    checklistCompleted,
  };
}
