 
"use client";

import React from "react";
import {
  Search,
  X,
  Download,
  Filter,
  User,
  Activity,
  Folder,
  Calendar,
  RotateCcw,
  Sparkles,
  Wifi,
} from "lucide-react";
import { ActivityFilterState, ActivityActionType } from "./types";

interface ActivityToolbarProps {
  filters: ActivityFilterState;
  onFilterChange: (filters: ActivityFilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
  onExportCSV: () => void;
}

export const ActivityToolbar: React.FC<ActivityToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  totalCount,
  onExportCSV,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, searchQuery: "" });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              Lịch sử hoạt động
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              {totalCount} nhật ký
            </span>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Realtime Stream Active</span>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Theo dõi nhật ký kiểm toán hệ thống (Audit Trail) & mọi thao tác thay đổi thời gian thực trong Workspace
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-700/70 hover:bg-zinc-800 text-zinc-200 hover:text-white text-sm font-medium transition-all shadow-sm group"
            title="Xuất file CSV kiểm toán hệ thống"
          >
            <Download className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Xuất nhật ký (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Control Toolbar */}
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl space-y-3">
        {/* Search Bar Row */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm theo tên thành viên, tên công việc, mã task (#TK-101) hoặc dự án..."
            className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/70 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 transition-all outline-none"
          />
          {filters.searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* 1. Member / Actor Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-medium">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thành viên</span>
            </div>
            <select
              value={filters.actorName}
              onChange={(e) => onFilterChange({ ...filters, actorName: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">Tất cả thành viên</option>
              <option value="Hoàng Mạnh Trường">Hoàng Mạnh Trường (Owner)</option>
              <option value="Lê Thị Mai">Lê Thị Mai (PM)</option>
              <option value="Trần Việt Hùng">Trần Việt Hùng (UI/UX)</option>
              <option value="Phạm Quốc Bảo">Phạm Quốc Bảo (Backend)</option>
              <option value="Nguyễn Thu Hà">Nguyễn Thu Hà (QA)</option>
            </select>
          </div>

          {/* 2. Action Type Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Loại hành động</span>
            </div>
            <select
              value={filters.actionType}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  actionType: e.target.value as ActivityActionType | "all",
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">Tất cả loại hành động</option>
              <option value="create">➕ Tạo mới (Task/Project)</option>
              <option value="update">✏️ Chỉnh sửa nội dung</option>
              <option value="move">🔄 Chuyển trạng thái Kanban</option>
              <option value="assign">👤 Gán người thực hiện</option>
              <option value="delete">🗑️ Đã xóa</option>
              <option value="attachment">📎 File & Bình luận</option>
            </select>
          </div>

          {/* 3. Scope / Project Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-medium">
              <Folder className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phạm vi dự án</span>
            </div>
            <select
              value={filters.projectId}
              onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">Tất cả dự án</option>
              <option value="Website E-Commerce V2">Website E-Commerce V2</option>
              <option value="Mobile Banking App">Mobile Banking App</option>
              <option value="Hệ thống CRM Doanh nghiệp">Hệ thống CRM Doanh nghiệp</option>
              <option value="Chiến dịch Marketing Q4">Chiến dịch Marketing Q4</option>
            </select>
          </div>

          {/* 4. Date Range Filter */}
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Khoảng thời gian</span>
            </div>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  dateRange: e.target.value as ActivityFilterState["dateRange"],
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đang áp dụng bộ lọc nâng cao</span>
            </div>
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bỏ tất cả lọc</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
