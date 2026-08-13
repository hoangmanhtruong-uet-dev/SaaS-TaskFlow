import type { Project, Task, User, Workspace } from "./domain";

export interface ApiMeta { requestId: string }
export interface ApiSuccess<T> { data: T; meta: ApiMeta }
export interface ApiFailure {
  error: { code: string; message: string; details?: Record<string, unknown> };
  meta: ApiMeta;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface AuthSessionDto {
  id: string;
  current: boolean;
  provider: "email" | "google";
  createdAt: string | null;
}

export interface CurrentUserDto extends User {
  workspaces: Workspace[];
}

export type CreateWorkspaceRequest = Pick<Workspace, "name" | "slug">;
export type CreateProjectRequest = Pick<Project, "name" | "description" | "visibility">;
export type CreateTaskRequest = Pick<Task, "projectId" | "boardId" | "columnId" | "title" | "description" | "priority" | "dueAt" | "assigneeIds">;
export type UpdateTaskRequest = Partial<CreateTaskRequest> & { expectedVersion: number };
export interface MoveTaskRequest {
  destinationColumnId: string;
  beforeTaskId: string | null;
  afterTaskId: string | null;
  expectedVersion: number;
}
