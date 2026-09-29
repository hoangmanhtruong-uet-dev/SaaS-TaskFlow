 
"use client";

import { Filter, RotateCcw, ChevronDown } from "lucide-react";

export interface FilterState {
  status: string;
  priority: string;
  assigneeId: string;
  dateRange: string;
}

interface MemberOption {
  id: string;
  name: string;
  avatar?: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  members?: MemberOption[];
}

export function SearchFilters({
  filters,
  onFilterChange,
  onResetFilters,
  members = [
    { id: "m1", name: "Hoàng Mạnh Trường" },
    { id: "m2", name: "Nguyễn Văn A" },
    { id: "m3", name: "Trần Thị B" },
    { id: "m4", name: "Phạm Văn C" },
  ],
}: SearchFiltersProps) {
  const activeCount = Object.values(filters).filter((val) => val && val !== "all").length;

  return (
    <div className="flex flex-wrap items-center gap-3 py-2 text-xs sm:text-sm">
      <div className="flex items-center gap-1.5 text-zinc-400 font-medium mr-1">
        <Filter className="w-4 h-4 text-emerald-400" />
        <span>Bộ lọc:</span>
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
            filters.status !== "all"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
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

      {/* Priority Filter */}
      <div className="relative">
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange("priority", e.target.value)}
          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
            filters.priority !== "all"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <option value="all">Độ ưu tiên: Tất cả</option>
          <option value="HIGH">Ưu tiên Cao</option>
          <option value="MEDIUM">Ưu tiên Trung bình</option>
          <option value="LOW">Ưu tiên Thấp</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
      </div>

      {/* Assignee Filter */}
      <div className="relative">
        <select
          value={filters.assigneeId}
          onChange={(e) => onFilterChange("assigneeId", e.target.value)}
          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
            filters.assigneeId !== "all"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <option value="all">Người thực hiện: Tất cả</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange("dateRange", e.target.value)}
          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
            filters.dateRange !== "all"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <option value="all">Thời gian: Tất cả</option>
          <option value="today">Hôm nay</option>
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
      </div>

      {/* Reset Filters Button */}
      {activeCount > 0 && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors ml-auto sm:ml-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Xóa {activeCount} bộ lọc</span>
        </button>
      )}
    </div>
  );
}
