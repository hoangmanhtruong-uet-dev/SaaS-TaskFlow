export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
export type MembershipStatus = "ACTIVE" | "SUSPENDED" | "LEFT";
export type ProjectVisibility = "WORKSPACE" | "PRIVATE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Tone = "green" | "red" | "amber" | "blue" | "gray";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  timezone: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "PRO";
  role: WorkspaceRole;
  archivedAt: string | null;
  deletionRequestedAt?: string | null;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  visibility: ProjectVisibility;
  taskCount: number;
  progress: number;
  archivedAt: string | null;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  dueAt: string | null;
  assigneeIds: string[];
  version: number;
  archivedAt: string | null;
}

export interface TaskSummary extends Task {
  projectName: string;
  columnName: string;
  tone: Tone;
}

export interface Notification {
  id: string;
  type: "ASSIGNMENT" | "MENTION" | "DEADLINE" | "SYSTEM";
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface Member {
  id: string; userId: string; name: string; email: string;
  role: WorkspaceRole; status: MembershipStatus; createdAt: string;
}
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "USED" | "REVOKED";
export interface Invitation {
  id: string; workspaceId: string; workspaceName: string; email: string;
  role: Exclude<WorkspaceRole, "OWNER">; status: InvitationStatus; expiresAt: string; createdAt: string;
}
export interface ActivityEvent {
  id: string; action: string; targetType: string; targetId: string;
  actorName: string | null; metadata: Record<string, unknown>; createdAt: string;
}
export interface TaskComment {
  id: string; taskId: string; body: string; authorName: string; authorUserId: string;
  hidden: boolean; deleted: boolean; createdAt: string; updatedAt: string;
}
export interface TaskAttachment {
  id: string; taskId: string; fileName: string; mimeType: string; size: number;
  uploadedByUserId: string | null; createdAt: string;
}
export interface TaskChecklistItem {
  id: string; taskId: string; title: string; completed: boolean; position: number;
  createdByUserId: string | null; completedByUserId: string | null;
  completedAt: string | null; createdAt: string; updatedAt: string;
}
