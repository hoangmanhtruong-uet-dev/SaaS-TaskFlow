 
"use client";

import {
  Search,
  LayoutGrid,
  List,
  Download,
  Upload,
  ChevronDown,
  X,
} from "lucide-react";

export type ViewMode = "grid" | "list";

export interface ProjectFilterState {
  searchQuery: string;
  status: string;
  ownerId: string;
  sortBy: "newest" | "name" | "progress";
}

interface MemberOption {
  id: string;
  name: string;
}

interface ProjectToolbarProps {
  filters: ProjectFilterState;
  onFilterChange: (key: keyof ProjectFilterState, value: string) => void;
  onResetFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExport: () => void;
  onImport: () => void;
  members?: MemberOption[];
}

export function ProjectToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  onExport,
  onImport,
  members = [
    { id: "m1", name: "Hoàng Mạnh Trường" },
    { id: "m2", name: "Nguyễn Văn A" },
    { id: "m3", name: "Trần Thị B" },
  ],
}: ProjectToolbarProps) {
  const isFiltered =
    filters.searchQuery || filters.status !== "all" || filters.ownerId !== "all";

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
      {/* Left: Search input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange("searchQuery", e.target.value)}
          placeholder="Tìm nhanh theo tên hoặc mô tả dự án..."
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange("searchQuery", "")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Middle: Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              filters.status !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Owner Filter */}
        <div className="relative">
          <select
            value={filters.ownerId}
            onChange={(e) => onFilterChange("ownerId", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              filters.ownerId !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Chủ sở hữu: Tất cả</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 text-xs font-medium cursor-pointer focus:outline-none"
          >
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="name">Sắp xếp: Tên A-Z</option>
            <option value="progress">Sắp xếp: Tiến độ %</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Reset filter button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
            title="Xóa tất cả bộ lọc"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Import/Export + View Mode Toggle */}
      <div className="flex items-center gap-2">
        {/* Import / Export Buttons */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
          title="Xuất CSV / Excel"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Xuất CSV</span>
        </button>

        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
          title="Nhập dự án từ file"
        >
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Nhập file</span>
        </button>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-zinc-950 border border-zinc-800">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Xem dạng Lưới (Grid)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "list"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Xem dạng Bảng (List)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
