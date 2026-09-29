export type ArchivedType = "project" | "task" | "file";

export type ArchiveTab = "all" | "project" | "task" | "file";

export interface ArchivedItem {
  id: string;
  code?: string;
  title: string;
  type: ArchivedType;
  originalPath: string; // e.g. "Thuộc dự án SaaS TaskFlow Core / Cột In Progress"
  archivedByName: string;
  archivedByAvatar?: string;
  archivedAt: string; // ISO date string
  expiresAt: string; // ISO date string (30 days after archivedAt)
  remainingDays: number; // 1 - 30
}

export interface ArchiveFilterState {
  searchQuery: string;
  activeTab: ArchiveTab;
  archivedBy: string;
  dateRange: "all" | "30days" | "90days" | "older";
}

export interface CategoryCounts {
  all: number;
  project: number;
  task: number;
  file: number;
}
