import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { createAttachmentDownload } from "@/db/attachments";

export async function POST(_: Request, { params }: { params: Promise<{ workspaceId: string; taskId: string; attachmentId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId, taskId, attachmentId } = await params;
    const result = await createAttachmentDownload(workspaceId, taskId, attachmentId, auth.user.id);
    if (result.kind === "ok") return ok({ url: result.url, expiresIn: result.expiresIn });
    return fail(result.kind === "not_found" ? "NOT_FOUND" : "PERMISSION_DENIED", "Không thể tải tệp này.", result.kind === "not_found" ? 404 : 403);
  } catch (error) { return routeError(error); }
}
