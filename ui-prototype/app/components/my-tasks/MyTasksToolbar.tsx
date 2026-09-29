 
"use client";

import {
  Search,
  Layers,
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  RotateCcw,
} from "lucide-react";
import { ViewMode, GroupOption } from "./types";

interface ProjectOption {
  id: string;
  name: string;
}

interface MyTasksToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  projectIdFilter: string;
  onProjectFilterChange: (val: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  groupBy: GroupOption;
  onGroupByChange: (group: GroupOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  projects?: ProjectOption[];
}

export function MyTasksToolbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  projectIdFilter,
  onProjectFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  groupBy,
  onGroupByChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters,
  projects = [
    { id: "proj-101", name: "SaaS TaskFlow Core" },
    { id: "proj-102", name: "TaskFlow Mobile App" },
    { id: "proj-103", name: "UI/UX Design System" },
    { id: "proj-104", name: "Database & Security Audit" },
  ],
}: MyTasksToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm công việc theo tiêu đề, mã task, dự án..."
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters & GroupBy */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Project Filter */}
        <div className="relative">
          <select
            value={projectIdFilter}
            onChange={(e) => onProjectFilterChange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              projectIdFilter !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Dự án: Tất cả</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              priorityFilter !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Ưu tiên: Tất cả</option>
            <option value="URGENT">Khẩn cấp</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              statusFilter !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="TODO">Cần làm</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="REVIEW">Đang kiểm thử</option>
            <option value="DONE">Hoàn thành</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Group By Selector */}
        <div className="relative">
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as GroupOption)}
            className={`appearance-none pl-8 pr-8 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              groupBy !== "none"
                ? "bg-purple-500/10 border-purple-500/50 text-purple-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="none">Gom nhóm: Không</option>
            <option value="project">Gom nhóm: Theo Dự án</option>
            <option value="dueDate">Gom nhóm: Theo Hạn chót</option>
            <option value="status">Gom nhóm: Theo Trạng thái</option>
          </select>
          <Layers className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400" />
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
            title="Bỏ tất cả bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* View Mode Switcher Toggle */}
      <div className="flex items-center p-1 rounded-lg bg-zinc-950 border border-zinc-800">
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-1.5 rounded transition-colors ${
            viewMode === "list"
              ? "bg-emerald-500/20 text-emerald-400 font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          title="Xem dạng Bảng danh sách (List)"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => onViewModeChange("board")}
          className={`p-1.5 rounded transition-colors ${
            viewMode === "board"
              ? "bg-emerald-500/20 text-emerald-400 font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          title="Xem dạng Kanban (Board)"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        <button
          onClick={() => onViewModeChange("calendar")}
          className={`p-1.5 rounded transition-colors ${
            viewMode === "calendar"
              ? "bg-emerald-500/20 text-emerald-400 font-bold"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          title="Xem dạng Lịch (Calendar)"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
