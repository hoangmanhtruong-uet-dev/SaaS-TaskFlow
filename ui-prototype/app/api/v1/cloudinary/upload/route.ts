import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { uploadBufferToCloudinary } from "@/app/lib/cloudinary";
import { getDb } from "@/db";
import { attachments } from "@/db/schema";
import { isTrustedMutationRequest } from "@/app/lib/request-security";

export const maxDuration = 60; // 60 seconds max execution

export async function POST(request: Request) {
  try {
    if (!isTrustedMutationRequest(request)) return fail("CSRF_REJECTED", "Cross-site request rejected", 403);
    // 1. Auth check — strict in all environments
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Bạn cần đăng nhập để upload tệp", 401);
    const userId = auth.user.id;

    // 2. Read FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workspaceId = (formData.get("workspaceId") as string) || null;
    const taskId = (formData.get("taskId") as string) || null;
    const folder = (formData.get("folder") as string) || "taskflow_uploads";

    if (!file) {
      return fail("MISSING_FILE", "Vui lòng chọn tệp tin cần upload", 400);
    }

    // 3. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(buffer, folder);

    // 5. Save record to Postgres Database if workspaceId and taskId are provided
    let savedRecord = null;
    if (workspaceId && taskId) {
      const id = crypto.randomUUID();
      await getDb().insert(attachments).values({
        id,
        workspaceId,
        taskId,
        storageKey: uploadResult.public_id,
        fileName: file.name,
        mimeType: file.type || `image/${uploadResult.format}`,
        size: uploadResult.bytes,
        uploadedByUserId: userId,
      }).run();

      savedRecord = { id, workspaceId, taskId };
    }

    return ok({
      message: "Tải ảnh lên Cloudinary thành công!",
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.name,
      size: uploadResult.bytes,
      mimeType: file.type,
      databaseRecord: savedRecord,
    }, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("MISSING_CLOUDINARY_CONFIG")) {
      return fail("CONFIG_REQUIRED", error.message, 400);
    }
    return routeError(error);
  }
}
