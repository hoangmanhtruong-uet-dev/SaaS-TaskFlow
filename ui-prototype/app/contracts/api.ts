import type {
  ApiResponse, AuthSessionDto, CreateProjectRequest, CreateTaskRequest,
  CreateWorkspaceRequest, CurrentUserDto, CursorPage, MoveTaskRequest, UpdateTaskRequest,
} from "@/app/types/api";
import type { Project, Task, Workspace } from "@/app/types/domain";

export const API_BASE = "/api/v1" as const;

export const apiRoutes = {
  auth: { me: `${API_BASE}/auth/me`, sessions: `${API_BASE}/auth/sessions`, logout: `${API_BASE}/auth/logout` },
  workspaces: `${API_BASE}/workspaces`,
  workspace: (workspaceId: string) => `${API_BASE}/workspaces/${workspaceId}`,
  projects: (workspaceId: string) => `${API_BASE}/workspaces/${workspaceId}/projects`,
  project: (workspaceId: string, projectId: string) => `${API_BASE}/workspaces/${workspaceId}/projects/${projectId}`,
  tasks: (workspaceId: string) => `${API_BASE}/workspaces/${workspaceId}/tasks`,
  task: (workspaceId: string, taskId: string) => `${API_BASE}/workspaces/${workspaceId}/tasks/${taskId}`,
  moveTask: (workspaceId: string, taskId: string) => `${API_BASE}/workspaces/${workspaceId}/tasks/${taskId}/move`,
  taskAttachments: (workspaceId: string, taskId: string) => `${API_BASE}/workspaces/${workspaceId}/tasks/${taskId}/attachments`,
} as const;

export interface ApiContract {
  "GET /auth/me": { response: ApiResponse<CurrentUserDto> };
  "GET /auth/sessions": { response: ApiResponse<AuthSessionDto[]> };
  "GET /workspaces": { response: ApiResponse<Workspace[]> };
  "POST /workspaces": { body: CreateWorkspaceRequest; response: ApiResponse<Workspace> };
  "GET /projects": { response: ApiResponse<CursorPage<Project>> };
  "POST /projects": { body: CreateProjectRequest; response: ApiResponse<Project> };
  "POST /tasks": { body: CreateTaskRequest; response: ApiResponse<Task> };
  "PATCH /tasks/:taskId": { body: UpdateTaskRequest; response: ApiResponse<Task> };
  "POST /tasks/:taskId/move": { body: MoveTaskRequest; response: ApiResponse<Task> };
}
