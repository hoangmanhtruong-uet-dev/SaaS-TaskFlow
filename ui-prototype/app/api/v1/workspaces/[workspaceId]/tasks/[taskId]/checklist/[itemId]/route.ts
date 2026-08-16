import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { parseJson, requiredString, ValidationError } from "@/app/lib/validation";
import { deleteChecklistItem, updateChecklistItem } from "@/db/task-checklist";

export async function PATCH(request: Request, { params }: { params: Promise<{ workspaceId: string; taskId: string; itemId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId, taskId, itemId } = await params;
    const body = await parseJson(request);
    const input: { title?: string; completed?: boolean } = {};
    if (body.title !== undefined) input.title = requiredString(body, "title", 240);
    if (body.completed !== undefined) {
      if (typeof body.completed !== "boolean") throw new ValidationError({ completed: "Giá trị phải là true hoặc false" });
      input.completed = body.completed;
    }
    if (input.title === undefined && input.completed === undefined) throw new ValidationError({ body: "Cần có title hoặc completed" });
    const data = await updateChecklistItem(workspaceId, taskId, itemId, auth.user.id, input);
    return data ? ok(data) : fail("NOT_FOUND", "Không tìm thấy mục checklist hoặc bạn không có quyền sửa", 404);
  } catch (error) { return routeError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ workspaceId: string; taskId: string; itemId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId, taskId, itemId } = await params;
    const deleted = await deleteChecklistItem(workspaceId, taskId, itemId, auth.user.id);
    return deleted ? ok({ deleted: true }) : fail("NOT_FOUND", "Không tìm thấy mục checklist hoặc bạn không có quyền xóa", 404);
  } catch (error) { return routeError(error); }
}
