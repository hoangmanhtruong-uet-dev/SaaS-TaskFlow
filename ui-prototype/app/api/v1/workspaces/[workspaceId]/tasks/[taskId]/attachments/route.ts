import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { parseJson, requiredString } from "@/app/lib/validation";
import { beginAttachmentUpload, cleanupExpiredAttachmentUploads, listAttachments, MAX_ATTACHMENT_BYTES } from "@/db/attachments";

type Context = { params: Promise<{ workspaceId: string; taskId: string }> };

export async function GET(_: Request, { params }: Context) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId, taskId } = await params;
  const data = await listAttachments(workspaceId, taskId, auth.user.id);
  return data ? ok(data) : fail("NOT_FOUND", "Task not found", 404);
}

export async function POST(request: Request, { params }: Context) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId, taskId } = await params;
    const body = await parseJson(request);
    const fileName = requiredString(body, "fileName", 240).replace(/[\\/\0]/g, "_");
    const mimeType = requiredString(body, "mimeType", 160).toLowerCase();
    if (!Number.isSafeInteger(body.size)) return fail("VALIDATION_ERROR", "Kích thước tệp không hợp lệ", 400);
    void cleanupExpiredAttachmentUploads().catch(() => undefined);
    const result = await beginAttachmentUpload(workspaceId, taskId, auth.user.id, { fileName, mimeType, size: body.size as number });
    if (result.kind === "ok") return ok(result.upload, 201);
    if (result.kind === "quota") return fail("ATTACHMENT_QUOTA_REACHED", "Workspace đã hết dung lượng tệp đính kèm.", 402);
    if (result.kind === "task_limit") return fail("ATTACHMENT_TASK_LIMIT", "Mỗi công việc tối đa 25 tệp.", 422);
    if (result.kind === "invalid") return fail("ATTACHMENT_INVALID", `Tệp không được hỗ trợ hoặc lớn hơn ${MAX_ATTACHMENT_BYTES / 1024 / 1024} MB.`, 422);
    return fail("PERMISSION_DENIED", "Bạn không có quyền đính kèm tệp.", 403);
  } catch (error) { return routeError(error); }
}
