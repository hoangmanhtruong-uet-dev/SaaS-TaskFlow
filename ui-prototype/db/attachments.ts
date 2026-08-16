import { and, eq, gt, lt, sql } from "drizzle-orm";
import { ATTACHMENTS_BUCKET, createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { getWorkspaceEntitlements } from "./billing";
import { authorizeProject } from "./authorization";
import { getDb } from "./index";
import { attachments, attachmentUploads, tasks } from "./schema";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_TASK = 25;
export const ATTACHMENT_UPLOAD_TTL_MS = 15 * 60 * 1000;
export const ATTACHMENT_QUOTA_BYTES = { FREE: 100 * 1024 * 1024, PRO: 2 * 1024 * 1024 * 1024 } as const;
export const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain", "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const extensionByType: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf",
  "text/plain": ".txt", "text/csv": ".csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

function dto(row: typeof attachments.$inferSelect) {
  return { id: row.id, taskId: row.taskId, fileName: row.fileName, mimeType: row.mimeType, size: row.size, uploadedByUserId: row.uploadedByUserId, createdAt: row.createdAt.toISOString() };
}

async function taskAccess(workspaceId: string, taskId: string, userId: string, write = false) {
  const task = await getDb().select({ projectId: tasks.projectId }).from(tasks).where(and(eq(tasks.workspaceId, workspaceId), eq(tasks.id, taskId))).get();
  if (!task) return null;
  return authorizeProject(workspaceId, task.projectId, userId, write ? "task.update" : "task.read");
}

export async function listAttachments(workspaceId: string, taskId: string, userId: string) {
  if (!await taskAccess(workspaceId, taskId, userId)) return null;
  const rows = await getDb().select().from(attachments).where(and(eq(attachments.workspaceId, workspaceId), eq(attachments.taskId, taskId))).orderBy(attachments.createdAt).all();
  return rows.map(dto);
}

export async function cleanupExpiredAttachmentUploads(now = new Date(), limit = 25) {
  const db = getDb();
  const expired = await db.select().from(attachmentUploads).where(lt(attachmentUploads.expiresAt, now)).limit(limit).all();
  if (!expired.length) return 0;
  const storage = createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET);
  await storage.remove(expired.map((item: typeof attachmentUploads.$inferSelect) => item.storageKey));
  for (const item of expired) await db.delete(attachmentUploads).where(eq(attachmentUploads.id, item.id)).run();
  return expired.length;
}

export async function beginAttachmentUpload(workspaceId: string, taskId: string, userId: string, input: { fileName: string; mimeType: string; size: number }) {
  if (!await taskAccess(workspaceId, taskId, userId, true)) return { kind: "denied" as const };
  if (!ALLOWED_ATTACHMENT_TYPES.has(input.mimeType) || !Number.isSafeInteger(input.size) || input.size <= 0 || input.size > MAX_ATTACHMENT_BYTES) return { kind: "invalid" as const };
  const db = getDb();
  const now = new Date();
  const [taskCount, usage, entitlements] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(attachments).where(and(eq(attachments.workspaceId, workspaceId), eq(attachments.taskId, taskId))).get(),
    db.select({ total: sql<number>`coalesce(sum(size), 0)` }).from(attachments).where(eq(attachments.workspaceId, workspaceId)).get(),
    getWorkspaceEntitlements(workspaceId),
  ]);
  const pending = await db.select({ total: sql<number>`coalesce(sum(size), 0)` }).from(attachmentUploads).where(and(eq(attachmentUploads.workspaceId, workspaceId), gt(attachmentUploads.expiresAt, now))).get();
  if (Number(taskCount?.count ?? 0) >= MAX_ATTACHMENTS_PER_TASK) return { kind: "task_limit" as const };
  if (Number(usage?.total ?? 0) + Number(pending?.total ?? 0) + input.size > ATTACHMENT_QUOTA_BYTES[entitlements.plan]) return { kind: "quota" as const };
  const id = crypto.randomUUID();
  const storageKey = `${workspaceId}/${taskId}/${id}${extensionByType[input.mimeType]}`;
  const expiresAt = new Date(now.getTime() + ATTACHMENT_UPLOAD_TTL_MS);
  await db.insert(attachmentUploads).values({ id, workspaceId, taskId, uploaderUserId: userId, storageKey, fileName: input.fileName, mimeType: input.mimeType, size: input.size, expiresAt }).run();
  const { data, error } = await createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET).createSignedUploadUrl(storageKey);
  if (error || !data) {
    await db.delete(attachmentUploads).where(eq(attachmentUploads.id, id)).run();
    throw error ?? new Error("Could not create signed upload URL");
  }
  return { kind: "ok" as const, upload: { id, path: data.path, token: data.token, signedUrl: data.signedUrl, expiresAt: expiresAt.toISOString() } };
}

export async function completeAttachmentUpload(workspaceId: string, taskId: string, uploadId: string, userId: string) {
  if (!await taskAccess(workspaceId, taskId, userId, true)) return { kind: "denied" as const };
  const db = getDb();
  const pending = await db.select().from(attachmentUploads).where(and(eq(attachmentUploads.id, uploadId), eq(attachmentUploads.workspaceId, workspaceId), eq(attachmentUploads.taskId, taskId), eq(attachmentUploads.uploaderUserId, userId), gt(attachmentUploads.expiresAt, new Date()))).get();
  if (!pending) return { kind: "not_found" as const };
  const storage = createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET);
  const { data: file, error } = await storage.info(pending.storageKey);
  const actualSize = Number(file?.size ?? -1);
  const actualType = String(file?.metadata?.mimetype ?? file?.metadata?.contentType ?? pending.mimeType);
  if (error || actualSize !== pending.size || actualType !== pending.mimeType) {
    await storage.remove([pending.storageKey]);
    await db.delete(attachmentUploads).where(eq(attachmentUploads.id, pending.id)).run();
    return { kind: "mismatch" as const };
  }
  const id = crypto.randomUUID();
  await db.batch([
    db.insert(attachments).values({ id, workspaceId, taskId, storageKey: pending.storageKey, fileName: pending.fileName, mimeType: pending.mimeType, size: pending.size, uploadedByUserId: userId }),
    db.delete(attachmentUploads).where(eq(attachmentUploads.id, pending.id)),
  ]);
  const row = await db.select().from(attachments).where(eq(attachments.id, id)).get();
  return { kind: "ok" as const, attachment: dto(row!) };
}

export async function createAttachmentDownload(workspaceId: string, taskId: string, attachmentId: string, userId: string) {
  if (!await taskAccess(workspaceId, taskId, userId)) return { kind: "denied" as const };
  const row = await getDb().select().from(attachments).where(and(eq(attachments.id, attachmentId), eq(attachments.workspaceId, workspaceId), eq(attachments.taskId, taskId))).get();
  if (!row) return { kind: "not_found" as const };
  const { data, error } = await createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET).createSignedUrl(row.storageKey, 60, { download: row.fileName });
  if (error || !data) throw error ?? new Error("Could not create download URL");
  return { kind: "ok" as const, url: data.signedUrl, expiresIn: 60 };
}

export async function deleteAttachment(workspaceId: string, taskId: string, attachmentId: string, userId: string) {
  const access = await taskAccess(workspaceId, taskId, userId, true);
  if (!access) return { kind: "denied" as const };
  const row = await getDb().select().from(attachments).where(and(eq(attachments.id, attachmentId), eq(attachments.workspaceId, workspaceId), eq(attachments.taskId, taskId))).get();
  if (!row) return { kind: "not_found" as const };
  if (row.uploadedByUserId !== userId && access.membership.role !== "OWNER" && access.membership.role !== "ADMIN") return { kind: "denied" as const };
  const { error } = await createSupabaseAdminClient().storage.from(ATTACHMENTS_BUCKET).remove([row.storageKey]);
  if (error) throw error;
  await getDb().delete(attachments).where(eq(attachments.id, row.id)).run();
  return { kind: "ok" as const };
}
