export type CalendarViewMode = "month" | "week" | "day" | "agenda";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface CalendarTask {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName: string;
  code: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (for multi-day span tasks)
  dueAt: string; // YYYY-MM-DD
  time?: string; // e.g. "09:00"
  completed: boolean;
  assigneeName?: string;
  assigneeAvatar?: string;
  checklistTotal?: number;
  checklistCompleted?: number;
  attachmentCount?: number;
  colorTone?: "emerald" | "blue" | "purple" | "amber" | "rose";
}

export interface UnscheduledTask {
  id: string;
  code: string;
  title: string;
  projectName: string;
  priority: Priority;
  estimatedHours?: number;
}

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  dateStr: string;
  color: string;
  isExternal: true;
}

export interface CalendarFilterState {
  projectId: string;
  priority: string;
  assigneeId: string;
  showCompleted: boolean;
}
