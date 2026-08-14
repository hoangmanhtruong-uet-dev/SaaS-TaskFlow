import type { CursorPage } from "@/app/types/api";
import type { ActivityEvent, Invitation, Member, Notification, WorkspaceRole } from "@/app/types/domain";
import { apiRequest } from "./http-client";
const ws = (workspaceId: string) => `/api/v1/workspaces/${workspaceId}`;
export const collaborationService = {
  members: (workspaceId: string) => apiRequest<Member[]>(`${ws(workspaceId)}/members`),
  updateMember: (workspaceId: string, membershipId: string, input: { role?: WorkspaceRole; status?: "ACTIVE" | "SUSPENDED" | "LEFT" }) => apiRequest<Member>(`${ws(workspaceId)}/members/${membershipId}`, { method: "PATCH", body: JSON.stringify(input) }),
  removeMember: (workspaceId: string, membershipId: string) => apiRequest<Member>(`${ws(workspaceId)}/members/${membershipId}`, { method: "DELETE" }),
  invitations: (workspaceId: string) => apiRequest<Invitation[]>(`${ws(workspaceId)}/invitations`),
  invite: (workspaceId: string, input: { email: string; role: "ADMIN" | "MEMBER" | "GUEST" }) => apiRequest<{ id: string; token: string; inviteUrl: string; expiresAt: string; emailDelivery: "sent" | "failed" }>(`${ws(workspaceId)}/invitations`, { method: "POST", body: JSON.stringify(input) }),
  revokeInvitation: (workspaceId: string, invitationId: string) => apiRequest<{ revoked: true }>(`${ws(workspaceId)}/invitations/${invitationId}`, { method: "DELETE" }),
  activity: (workspaceId: string) => apiRequest<CursorPage<ActivityEvent>>(`${ws(workspaceId)}/activity`).then((page) => page.items),
  notifications: () => apiRequest<CursorPage<Notification>>("/api/v1/notifications").then((page) => page.items),
  markRead: (notificationId: string) => apiRequest<{ read: true }>(`/api/v1/notifications/${notificationId}/read`, { method: "POST" }),
  markAllRead: () => apiRequest<{ read: true }>("/api/v1/notifications/read-all", { method: "POST" }),
  invitation: (token: string) => apiRequest<Invitation>(`/api/v1/invitations/${token}`),
  respondInvitation: (token: string, action: "accept" | "decline") => apiRequest<{ kind: "ok"; workspaceId?: string }>(`/api/v1/invitations/${token}/${action}`, { method: "POST" }),
};
