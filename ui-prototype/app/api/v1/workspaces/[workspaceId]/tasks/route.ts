import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { enumValue, optionalString, parseJson, requiredString } from "@/app/lib/validation";
import { createTask, listTasks } from "@/db/tasks";
import { executeIdempotent, readIdempotencyKey } from "@/db/idempotency";
import { pageSize } from "@/db/pagination";

export async function GET(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params; const query = new URL(request.url).searchParams;
  const data = await listTasks(workspaceId, auth.user.id, query.get("projectId") ?? undefined, query.get("archived") === "true", query.get("cursor"), pageSize(query.get("limit")));
  return data ? ok(data) : fail("NOT_FOUND", "Workspace or project not found", 404);
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId } = await params; const key = readIdempotencyKey(request);
    if (!key) return fail("IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key hợp lệ là bắt buộc", 400);
    const body = await parseJson(request);
    const assigneeIds = Array.isArray(body.assigneeIds) && body.assigneeIds.every((value) => typeof value === "string") ? body.assigneeIds as string[] : [];
    const input = { projectId: requiredString(body, "projectId"), boardId: requiredString(body, "boardId"), columnId: requiredString(body, "columnId"), title: requiredString(body, "title", 240), description: optionalString(body, "description", 5000) ?? "", priority: enumValue(body, "priority", ["LOW", "MEDIUM", "HIGH", "URGENT"] as const, "MEDIUM"), dueAt: optionalString(body, "dueAt", 40) ?? null, assigneeIds };
    const result = await executeIdempotent({
      workspaceId,
      actorUserId: auth.user.id,
      key,
      operation: "task.create",
      payload: input,
      execute: async () => {
        const task = await createTask(workspaceId, auth.user.id, input);
        return { status: task ? 201 : 404, body: task ? { kind: "ok", task } : { kind: "not_found" } };
      }
    });
    if (result.kind === "mismatch") return fail("IDEMPOTENCY_PAYLOAD_MISMATCH", "Idempotency-Key đã được dùng với payload khác", 409);
    return result.body.kind === "ok" && "task" in result.body ? ok(result.body.task, result.status) : fail("NOT_FOUND", "Project, board hoặc column không hợp lệ", 404);
  } catch (error) { return routeError(error); }
}
