import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { completeAttachmentUpload } from "@/db/attachments";

export async function POST(_: Request, { params }: { params: Promise<{ workspaceId: string; taskId: string; uploadId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId, taskId, uploadId } = await params;
    const result = await completeAttachmentUpload(workspaceId, taskId, uploadId, auth.user.id);
    if (result.kind === "ok") return ok(result.attachment, 201);
    if (result.kind === "mismatch") return fail("ATTACHMENT_MISMATCH", "Tệp tải lên không khớp metadata đã khai báo.", 422);
    if (result.kind === "not_found") return fail("UPLOAD_NOT_FOUND", "Phiên tải lên đã hết hạn hoặc không tồn tại.", 404);
    return fail("PERMISSION_DENIED", "Bạn không có quyền đính kèm tệp.", 403);
  } catch (error) { return routeError(error); }
}
