import { apiRoutes } from "@/app/contracts/api";
import type { CreateProjectRequest, CursorPage } from "@/app/types/api";
import type { BoardColumn, Project } from "@/app/types/domain";
import { apiRequest } from "./http-client";
export interface BoardDto { id: string; workspaceId: string; projectId: string; name: string; version: number }
export const projectService = {
  list: (workspaceId: string) => apiRequest<CursorPage<Project>>(apiRoutes.projects(workspaceId)).then((page) => page.items),
  archived: (workspaceId: string) => apiRequest<CursorPage<Project>>(`${apiRoutes.projects(workspaceId)}?archived=true`).then((page) => page.items),
  get: (workspaceId: string, projectId: string) => apiRequest<Project>(apiRoutes.project(workspaceId, projectId)),
  create: (workspaceId: string, input: CreateProjectRequest) => apiRequest<Project>(apiRoutes.projects(workspaceId), { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(input) }),
  update: (workspaceId: string, projectId: string, input: Partial<CreateProjectRequest>) => apiRequest<Project>(apiRoutes.project(workspaceId, projectId), { method: "PATCH", body: JSON.stringify(input) }),
  restore: (workspaceId: string, projectId: string) => apiRequest<Project>(`${apiRoutes.project(workspaceId, projectId)}/archive?restore=true`, { method: "POST" }),
  listBoards: (workspaceId: string, projectId: string) => apiRequest<BoardDto[]>(`${apiRoutes.project(workspaceId, projectId)}/boards`),
  listColumns: (workspaceId: string, boardId: string) => apiRequest<BoardColumn[]>(`/api/v1/workspaces/${workspaceId}/boards/${boardId}/columns`),
};
