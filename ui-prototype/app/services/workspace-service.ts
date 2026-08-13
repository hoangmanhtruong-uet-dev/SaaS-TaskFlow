import type { CursorPage } from "@/app/types/api";
import type { TaskSummary, Workspace } from "@/app/types/domain";
import { apiRequest } from "./http-client";
const path = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}`;
export const workspaceService = {
  update: (workspaceId: string, input: { name?: string; slug?: string }) => apiRequest<Workspace>(path(workspaceId), { method: "PATCH", body: JSON.stringify(input) }),
  archive: (workspaceId: string, restore = false) => apiRequest<Workspace>(`${path(workspaceId)}/archive${restore ? "?restore=true" : ""}`, { method: "POST" }),
  requestDeletion: (workspaceId: string, confirmation: string) => apiRequest<{ requestedAt: string; scheduledFor: string }>(`${path(workspaceId)}/deletion-request`, { method: "POST", body: JSON.stringify({ confirmation }) }),
  cancelDeletion: (workspaceId: string) => apiRequest<{ cancelled: true }>(`${path(workspaceId)}/deletion-request`, { method: "DELETE" }),
  transferOwnership: (workspaceId: string, targetMembershipId: string) => apiRequest<{ transferred: true }>(`${path(workspaceId)}/ownership`, { method: "POST", body: JSON.stringify({ targetMembershipId }) }),
  search: (workspaceId: string, query: string) => apiRequest<CursorPage<TaskSummary>>(`${path(workspaceId)}/search?q=${encodeURIComponent(query)}`).then((page) => page.items),
};
