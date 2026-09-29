 
"use client";

import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, List, X, Check } from "lucide-react";

export interface MemberFilterItem {
  id: string;
  name: string;
  avatar: string;
  colorClass: string;
}

interface KanbanHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "board" | "list";
  onViewModeChange: (mode: "board" | "list") => void;
  selectedMember: string | null;
  onSelectMember: (memberId: string | null) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sortBy: "default" | "priority" | "dueAt";
  onSortByChange: (sort: "default" | "priority" | "dueAt") => void;
  members: MemberFilterItem[];
}

export function KanbanHeader({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedMember,
  onSelectMember,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  members,
}: KanbanHeaderProps) {
  const memberColors: Record<string, string> = {
    nv: "bg-emerald-600 text-emerald-100 ring-emerald-500",
    hl: "bg-blue-600 text-blue-100 ring-blue-500",
    tp: "bg-purple-600 text-purple-100 ring-purple-500",
    default: "bg-zinc-700 text-zinc-200 ring-zinc-500",
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Bar: Title & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Dashboard Workspace</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Quản lý và theo dõi tiến độ công việc dự án theo thời gian thực</p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1 shadow-inner">
          <button
            onClick={() => onViewModeChange("board")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "board"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <LayoutGrid size={14} />
            <span>Board View</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <List size={14} />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Unified Control Toolbar: Search, Priority Filter, Sort, Member Avatars */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 backdrop-blur-md">
        {/* Left Group: Search, Priority Filter, Sort */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Priority Select Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="appearance-none rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-2 pr-7 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả ưu tiên</option>
              <option value="Urgent">Khẩn cấp</option>
              <option value="High">Ưu tiên Cao</option>
              <option value="Medium">Trung bình</option>
              <option value="Low">Ưu tiên Thấp</option>
            </select>
            <SlidersHorizontal size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as "default" | "priority" | "dueAt")}
              className="appearance-none rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-2 pr-7 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="default">Sắp xếp mặc định</option>
              <option value="priority">Theo mức ưu tiên</option>
              <option value="dueAt">Theo hạn hoàn thành</option>
            </select>
            <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Right Group: Member Quick Filter Stack */}
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[11px] font-medium text-zinc-400 hidden lg:inline">Lọc người làm:</span>

          <div className="flex items-center -space-x-1.5">
            {members.map((member) => {
              const isSelected = selectedMember === member.avatar;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(isSelected ? null : member.avatar)}
                  title={`Lọc task của ${member.name}`}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 hover:z-20 hover:scale-110 ${
                    memberColors[member.colorClass.toLowerCase()] || memberColors.default
                  } ${
                    isSelected
                      ? "ring-2 ring-emerald-400 z-10 scale-105 shadow-md shadow-emerald-500/20"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {member.avatar}
                  {isSelected && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px]">
                      <Check size={8} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedMember && (
            <button
              onClick={() => onSelectMember(null)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold ml-1 flex items-center gap-0.5"
            >
              <X size={12} /> Tất cả
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
