import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { getDb } from "@/db";
import { attachments } from "@/db/schema";
import { parseJson, requiredString } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    // 1. Auth check (with local dev fallback if no session cookie)
    const auth = await getApiUser();
    const userId = auth?.user?.id || (process.env.APP_ENV === "local" ? "dev-local-user" : null);
    if (!userId) return fail("AUTH_REQUIRED", "Bạn cần đăng nhập để lưu tệp", 401);

    // 2. Read JSON payload
    const body = await parseJson(request);
    const url = requiredString(body, "url", 2048);
    const publicId = requiredString(body, "publicId", 500);
    const fileName = requiredString(body, "fileName", 255);
    const size = typeof body.size === "number" ? body.size : 0;
    const mimeType = (typeof body.mimeType === "string" && body.mimeType) ? body.mimeType : "image/jpeg";
    const workspaceId = (typeof body.workspaceId === "string" && body.workspaceId) ? body.workspaceId : null;
    const taskId = (typeof body.taskId === "string" && body.taskId) ? body.taskId : null;

    // 3. Save to Database if workspaceId & taskId exist
    let savedRecord = null;
    if (workspaceId && taskId) {
      const id = crypto.randomUUID();
      await getDb().insert(attachments).values({
        id,
        workspaceId,
        taskId,
        storageKey: publicId,
        fileName,
        mimeType,
        size,
        uploadedByUserId: userId,
      }).run();

      savedRecord = { id, workspaceId, taskId };
    }

    return ok({
      message: "Lưu URL Cloudinary vào Cơ sở dữ liệu thành công!",
      url,
      publicId,
      fileName,
      databaseRecord: savedRecord,
    }, 201);
  } catch (error: unknown) {
    return routeError(error);
  }
}
