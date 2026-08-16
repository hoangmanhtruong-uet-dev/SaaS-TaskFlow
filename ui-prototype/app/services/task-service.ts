import { apiRoutes } from "@/app/contracts/api";
import type { CreateTaskRequest, CursorPage, MoveTaskRequest, UpdateTaskRequest } from "@/app/types/api";
import type { TaskAttachment, TaskChecklistItem, TaskComment, TaskSummary } from "@/app/types/domain";
import { apiRequest } from "./http-client";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser";
export const taskService = {
  list: (workspaceId: string, projectId?: string) => apiRequest<CursorPage<TaskSummary>>(`${apiRoutes.tasks(workspaceId)}${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`).then((page) => page.items),
  archived: (workspaceId: string) => apiRequest<CursorPage<TaskSummary>>(`${apiRoutes.tasks(workspaceId)}?archived=true`).then((page) => page.items),
  get: (workspaceId: string, taskId: string) => apiRequest<TaskSummary>(apiRoutes.task(workspaceId, taskId)),
  create: (workspaceId: string, input: CreateTaskRequest) => apiRequest<TaskSummary>(apiRoutes.tasks(workspaceId), { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(input) }),
  update: (workspaceId: string, taskId: string, input: UpdateTaskRequest) => apiRequest<TaskSummary>(apiRoutes.task(workspaceId, taskId), { method: "PATCH", body: JSON.stringify(input) }),
  move: (workspaceId: string, taskId: string, input: MoveTaskRequest) => apiRequest<TaskSummary>(apiRoutes.moveTask(workspaceId, taskId), { method: "POST", body: JSON.stringify(input) }),
  comments: (workspaceId: string, taskId: string) => apiRequest<TaskComment[]>(`${apiRoutes.task(workspaceId, taskId)}/comments`),
  comment: (workspaceId: string, taskId: string, body: string) => apiRequest<TaskComment>(`${apiRoutes.task(workspaceId, taskId)}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
  deleteComment: (workspaceId: string, commentId: string) => apiRequest<{ deleted: true }>(`/api/v1/workspaces/${workspaceId}/comments/${commentId}`, { method: "DELETE" }),
  hideComment: (workspaceId: string, commentId: string) => apiRequest<{ hidden: true }>(`/api/v1/workspaces/${workspaceId}/comments/${commentId}`, { method: "PATCH" }),
  restore: (workspaceId: string, taskId: string) => apiRequest<TaskSummary>(`${apiRoutes.task(workspaceId, taskId)}/archive?restore=true`, { method: "POST" }),
  attachments: (workspaceId: string, taskId: string) => apiRequest<TaskAttachment[]>(apiRoutes.taskAttachments(workspaceId, taskId)),
  uploadAttachment: async (workspaceId: string, taskId: string, file: File) => {
    const base = apiRoutes.taskAttachments(workspaceId, taskId);
    const upload = await apiRequest<{ id: string; path: string; token: string }>(base, { method: "POST", body: JSON.stringify({ fileName: file.name, mimeType: file.type, size: file.size }) });
    const { error } = await createSupabaseBrowserClient().storage.from("task-attachments").uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type });
    if (error) throw error;
    return apiRequest<TaskAttachment>(`${base}/${upload.id}/complete`, { method: "POST" });
  },
  attachmentDownload: (workspaceId: string, taskId: string, attachmentId: string) => apiRequest<{ url: string; expiresIn: number }>(`${apiRoutes.taskAttachments(workspaceId, taskId)}/${attachmentId}/download`, { method: "POST" }),
  deleteAttachment: (workspaceId: string, taskId: string, attachmentId: string) => apiRequest<{ deleted: true }>(`${apiRoutes.taskAttachments(workspaceId, taskId)}/${attachmentId}`, { method: "DELETE" }),
  checklist: (workspaceId: string, taskId: string) => apiRequest<TaskChecklistItem[]>(apiRoutes.taskChecklist(workspaceId, taskId)),
  createChecklistItem: (workspaceId: string, taskId: string, title: string) => apiRequest<TaskChecklistItem>(apiRoutes.taskChecklist(workspaceId, taskId), { method: "POST", body: JSON.stringify({ title }) }),
  updateChecklistItem: (workspaceId: string, taskId: string, itemId: string, input: { title?: string; completed?: boolean }) => apiRequest<TaskChecklistItem>(`${apiRoutes.taskChecklist(workspaceId, taskId)}/${itemId}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteChecklistItem: (workspaceId: string, taskId: string, itemId: string) => apiRequest<{ deleted: true }>(`${apiRoutes.taskChecklist(workspaceId, taskId)}/${itemId}`, { method: "DELETE" }),
};
