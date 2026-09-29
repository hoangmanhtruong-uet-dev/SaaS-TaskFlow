export type ViewMode = "list" | "board" | "calendar";

export type GroupOption = "none" | "project" | "dueDate" | "status";

export type SmartTab = "all" | "today" | "upcoming" | "overdue" | "completed";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface MyTask {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  boardId: string;
  columnId: string;
  columnName: string;
  code: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string | null; // ISO Date String
  assigneeName?: string;
  assigneeAvatar?: string;
  tags?: string[];
  checklistTotal?: number;
  checklistCompleted?: number;
  attachmentCount?: number;
  commentCount?: number;
  completed: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface MyTaskFilterState {
  searchQuery: string;
  projectId: string;
  priority: string;
  status: string;
  groupBy: GroupOption;
  activeTab: SmartTab;
}

export interface KpiStats {
  dueToday: number;
  overdue: number;
  inProgress: number;
  completedThisWeek: number;
}
