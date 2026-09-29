export type ActivityActionType = "create" | "update" | "delete" | "move" | "assign" | "attachment";

export interface ActivityDiff {
  fieldName: string; // e.g. "Hạn hoàn thành", "Trạng thái", "Người thực hiện"
  oldValue: string;
  newValue: string;
}

export interface ActivityLogItem {
  id: string;
  workspaceId: string;
  actorName: string;
  actorAvatar?: string;
  actionType: ActivityActionType;
  actionCode: string; // e.g. "task.move", "task.update_due_date", "project.create"
  actionText?: string; // Humanized action phrase (e.g. "đã chuyển trạng thái công việc")
  targetId: string; // Task ID or Project ID
  targetType: "task" | "project" | "comment" | "attachment";
  targetTitle: string;
  targetCode?: string;
  projectName?: string;
  diff?: ActivityDiff;
  createdAt: string; // ISO string
  exactTime?: string; // e.g. "10:35 AM"
  relativeTime?: string; // e.g. "15 phút trước"
  timeAgo: string; // Relative string e.g. "15 phút trước"
  timeGroup: "today" | "yesterday" | "this_week" | "older";
}

export interface ActivityFilterState {
  searchQuery: string;
  actorName: string;
  actionType: "all" | ActivityActionType;
  projectId: string;
  dateRange: "all" | "today" | "7days" | "month";
}
