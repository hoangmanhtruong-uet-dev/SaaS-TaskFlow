import { apiRoutes } from "@/app/contracts/api";
import type { CreateTaskRequest, CursorPage, MoveTaskRequest, UpdateTaskRequest } from "@/app/types/api";
import type { TaskComment, TaskSummary } from "@/app/types/domain";
import { apiRequest } from "./http-client";
export const taskService = {
  list: (workspaceId: string, projectId?: string) => apiRequest<CursorPage<TaskSummary>>(`${apiRoutes.tasks(workspaceId)}${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`).then((page) => page.items),
  archived: (workspaceId: string) => apiRequest<CursorPage<TaskSummary>>(`${apiRoutes.tasks(workspaceId)}?archived=true`).then((page) => page.items),
  get: (workspaceId: string, taskId: string) => apiRequest<TaskSummary>(apiRoutes.task(workspaceId, taskId)),
  create: (workspaceId: string, input: CreateTaskRequest) => apiRequest<TaskSummary>(apiRoutes.tasks(workspaceId), { method: "POST", body: JSON.stringify(input) }),
  update: (workspaceId: string, taskId: string, input: UpdateTaskRequest) => apiRequest<TaskSummary>(apiRoutes.task(workspaceId, taskId), { method: "PATCH", body: JSON.stringify(input) }),
  move: (workspaceId: string, taskId: string, input: MoveTaskRequest) => apiRequest<TaskSummary>(apiRoutes.moveTask(workspaceId, taskId), { method: "POST", body: JSON.stringify(input) }),
  comments: (workspaceId: string, taskId: string) => apiRequest<TaskComment[]>(`${apiRoutes.task(workspaceId, taskId)}/comments`),
  comment: (workspaceId: string, taskId: string, body: string) => apiRequest<TaskComment>(`${apiRoutes.task(workspaceId, taskId)}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
  deleteComment: (workspaceId: string, commentId: string) => apiRequest<{ deleted: true }>(`/api/v1/workspaces/${workspaceId}/comments/${commentId}`, { method: "DELETE" }),
  hideComment: (workspaceId: string, commentId: string) => apiRequest<{ hidden: true }>(`/api/v1/workspaces/${workspaceId}/comments/${commentId}`, { method: "PATCH" }),
  restore: (workspaceId: string, taskId: string) => apiRequest<TaskSummary>(`${apiRoutes.task(workspaceId, taskId)}/archive?restore=true`, { method: "POST" }),
};
