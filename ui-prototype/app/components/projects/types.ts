export type ViewMode = "grid" | "list";

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type ProjectVisibility = "WORKSPACE" | "PRIVATE";

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  code: string;
  description: string;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  progress: number; // 0 - 100
  taskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  archivedAt: string | null;
  isFavorite: boolean;
  colorTone?: "emerald" | "blue" | "purple" | "amber" | "rose";
  members: ProjectMember[];
  updatedAt: string;
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  status: "all" | ProjectStatus;
  ownerId: string;
  sortBy: "newest" | "name" | "progress";
}

export interface KpiStats {
  totalProjects: number;
  activeProjects: number;
  completionRate: number; // %
  overdueTasks: number;
}
