import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ALLOWED_ATTACHMENT_TYPES, ATTACHMENT_QUOTA_BYTES, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_PER_TASK } from "../../db/attachments";
import { attachmentFileNameIsSafe, validateAttachmentContent } from "../../app/lib/attachment-content";

test("attachment limits are explicit and plan-aware", () => {
  assert.equal(MAX_ATTACHMENT_BYTES, 10 * 1024 * 1024);
  assert.equal(MAX_ATTACHMENTS_PER_TASK, 25);
  assert.equal(ATTACHMENT_QUOTA_BYTES.FREE, 100 * 1024 * 1024);
  assert.equal(ATTACHMENT_QUOTA_BYTES.PRO, 2 * 1024 * 1024 * 1024);
  assert.equal(ALLOWED_ATTACHMENT_TYPES.has("application/pdf"), true);
  assert.equal(ALLOWED_ATTACHMENT_TYPES.has("text/html"), false);
});

test("double extensions, active content, and MIME polyglots are rejected by content inspection", () => {
  assert.equal(attachmentFileNameIsSafe("report.pdf.exe", "application/pdf"), false);
  assert.equal(attachmentFileNameIsSafe("report.exe.pdf", "application/pdf"), false);
  assert.equal(attachmentFileNameIsSafe("report.pdf", "application/pdf"), true);
  assert.equal(validateAttachmentContent(new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<<>>"), "application/pdf", "report.pdf").safe, true);
  assert.equal(validateAttachmentContent(new TextEncoder().encode("%PDF-1.7\n/JavaScript (alert)"), "application/pdf", "report.pdf").safe, false);
  assert.equal(validateAttachmentContent(new TextEncoder().encode("<script>alert(1)</script>"), "text/plain", "notes.txt").safe, false);
  assert.equal(validateAttachmentContent(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), "application/pdf", "report.pdf").safe, false);
});

test("storage is private and pending uploads are server-only", async () => {
  const migration = await readFile(new URL("../../supabase/migrations/20260816110000_secure_task_attachments.sql", import.meta.url), "utf8");
  assert.match(migration, /'task-attachments',[\s\S]*false/);
  assert.match(migration, /revoke all on public\.attachment_uploads from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy[\s\S]*storage\.objects/i);
});

test("attachment operations scope every resource to workspace and task", async () => {
  const source = await readFile(new URL("../../db/attachments.ts", import.meta.url), "utf8");
  assert.match(source, /eq\(tasks\.workspaceId, workspaceId\)/);
  assert.match(source, /eq\(attachmentUploads\.workspaceId, workspaceId\)/);
  assert.match(source, /eq\(attachmentUploads\.taskId, taskId\)/);
  assert.match(source, /eq\(attachments\.workspaceId, workspaceId\)/);
  assert.match(source, /eq\(attachments\.taskId, taskId\)/);
  assert.match(source, /createSignedUrl\(row\.storageKey, 60/);
  assert.match(source, /storage\.download\(pending\.storageKey\)/);
  assert.match(source, /validateAttachmentContent/);
  assert.match(source, /scanAttachment/);
});
