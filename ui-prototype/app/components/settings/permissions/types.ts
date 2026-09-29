export type RoleKey = "owner" | "admin" | "member" | "guest" | string;

export interface RoleInfo {
  key: RoleKey;
  label: string;
  description: string;
  memberCount: number;
  isSystem: boolean;
  color: string; // Tailwind color class or hex
  badgeBg: string;
  badgeText: string;
}

export interface PermissionItem {
  id: string; // e.g. "workspace_config"
  name: string; // e.g. "Cấu hình Workspace & Subdomain"
  description: string;
}

export interface PermissionGroup {
  id: string; // e.g. "group_workspace"
  title: string; // e.g. "Quản trị Workspace & Billing"
  description: string;
  permissions: PermissionItem[];
}

export type MatrixState = Record<RoleKey, Record<string, boolean>>;

export interface CustomRole {
  key: string;
  label: string;
  description: string;
  color: string;
  initialPermissions: string[];
}

export interface ProjectPermissionOverride {
  id: string;
  projectId: string;
  projectName: string;
  roleKey: RoleKey;
  permissionId: string;
  permissionName: string;
  accessState: "allow" | "deny";
}

export interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
