import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { parseJson, requiredString } from "@/app/lib/validation";
import { createChecklistItem, listChecklistItems } from "@/db/task-checklist";

export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string; taskId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId, taskId } = await params;
  const data = await listChecklistItems(workspaceId, taskId, auth.user.id);
  return data ? ok(data) : fail("NOT_FOUND", "Task not found", 404);
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string; taskId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId, taskId } = await params;
    const body = await parseJson(request);
    const data = await createChecklistItem(workspaceId, taskId, auth.user.id, requiredString(body, "title", 240));
    return data ? ok(data, 201) : fail("PERMISSION_DENIED", "Bạn không có quyền sửa checklist", 403);
  } catch (error) {
    if (error instanceof Error && error.message === "CHECKLIST_LIMIT_REACHED") return fail("CHECKLIST_LIMIT_REACHED", "Mỗi công việc có tối đa 100 mục checklist", 409);
    return routeError(error);
  }
}
