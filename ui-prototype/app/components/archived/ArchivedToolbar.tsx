 
"use client";

import React from "react";
import {
  Archive,
  Search,
  X,
  AlertCircle,
  FolderKanban,
  CheckSquare,
  FileText,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { ArchiveTab, CategoryCounts } from "./types";

interface ArchivedToolbarProps {
  activeTab: ArchiveTab;
  onTabChange: (tab: ArchiveTab) => void;
  counts: CategoryCounts;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  archivedByFilter: string;
  onArchivedByChange: (val: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function ArchivedToolbar({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  onClearSearch,
  archivedByFilter,
  onArchivedByChange,
  onResetFilters,
  hasActiveFilters,
}: ArchivedToolbarProps) {
  const tabs: { id: ArchiveTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "all", label: "Tất cả", icon: Archive, count: counts.all },
    { id: "project", label: "Dự án", icon: FolderKanban, count: counts.project },
    { id: "task", label: "Công việc", icon: CheckSquare, count: counts.task },
    { id: "file", label: "Tệp tin", icon: FileText, count: counts.file },
  ];

  return (
    <div className="space-y-4">
      {/* ── 1. RETENTION WARNING BANNER ── */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Chính sách lưu trữ:</strong> Các mục trong phần Lưu trữ sẽ được tự động lưu giữ trong <strong>30 ngày</strong> kể từ ngày ẩn trước khi bị hệ thống xóa vĩnh viễn. Bạn có thể khôi phục lại bất kỳ lúc nào.
        </p>
      </div>

      {/* ── 2. SEARCH & FILTERS BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên mục, mã task, vị trí gốc..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
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

        {/* Filters Right */}
        <div className="flex items-center gap-2">
          {/* Filter by Archived By User */}
          <div className="relative">
            <select
              value={archivedByFilter}
              onChange={(e) => onArchivedByChange(e.target.value)}
              className={`appearance-none pl-3 pr-8 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
                archivedByFilter !== "all"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <option value="all">Người lưu trữ: Tất cả</option>
              <option value="Hoàng Mạnh Trường">Hoàng Mạnh Trường</option>
              <option value="Nguyễn Văn A">Nguyễn Văn A</option>
              <option value="Trần Thị B">Trần Thị B</option>
              <option value="Phạm Văn C">Phạm Văn C</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
              title="Bỏ tất cả bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. CATEGORY TABS ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
              <span>{tab.label}</span>

              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
