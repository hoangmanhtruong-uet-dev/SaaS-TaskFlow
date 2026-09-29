export type UserRole = "owner" | "admin" | "member" | "guest";
export type MemberStatus = "active" | "suspended" | "pending";

export interface MemberTaskSummary {
  id: string;
  title: string;
  code: string;
  projectName: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "HIGH" | "MEDIUM" | "LOW" | "URGENT";
  dueDate: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: MemberStatus;
  isCurrentUser?: boolean;
  projects: string[]; // List of project names assigned
  taskCount: number; // Active assigned tasks count
  tasks?: MemberTaskSummary[];
  joinDate: string; // Formatted e.g. "15/01/2026"
}

export interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  projects: string[];
}

export interface PermissionMatrixItem {
  id: string;
  category: "Workspace" | "Projects" | "Tasks" | "Members & Billing";
  permissionName: string;
  description: string;
  ownerAllowed: boolean;
  adminAllowed: boolean;
  memberAllowed: boolean;
  guestAllowed: boolean;
}

export interface MemberFilterState {
  searchQuery: string;
  role: "all" | UserRole;
  status: "all" | MemberStatus;
  sortBy: "name" | "joinDate" | "taskCount";
}
