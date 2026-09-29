export type NotificationType = "mention" | "assignment" | "deadline" | "system" | "invite";

export type NotificationCategoryTab = "all" | "unread" | "mention" | "assignment" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actorName: string;
  actorAvatar?: string;
  title: string;
  body?: string;
  targetId?: string; // Task ID or Project ID
  targetType?: "task" | "project" | "system";
  targetTitle?: string;
  read: boolean;
  createdAt: string; // ISO string or relative string
  timeGroup: "today" | "yesterday" | "this_week" | "older";
  quickReplySupported?: boolean;
  replyText?: string;
}

export interface NotificationSettings {
  emailMentions: boolean;
  emailDeadlines: boolean;
  emailAssignments: boolean;
  pushMentions: boolean;
  pushDeadlines: boolean;
  pushAssignments: boolean;
  soundEnabled: boolean;
}

export interface CategoryTabCounts {
  all: number;
  unread: number;
  mention: number;
  assignment: number;
  system: number;
}
