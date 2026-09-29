 
"use client";

import React from "react";
import {
  Users,
  UserPlus,
  Search,
  X,
  Shield,
  Mail,
  RotateCcw,
} from "lucide-react";
import { MemberFilterState, UserRole, MemberStatus } from "./types";

interface MembersToolbarProps {
  activeTab: "members" | "pending" | "permissions";
  onTabChange: (tab: "members" | "pending" | "permissions") => void;
  pendingCount: number;
  membersCount: number;
  filters: MemberFilterState;
  onFilterChange: (filters: MemberFilterState) => void;
  onResetFilters: () => void;
  onOpenInviteModal: () => void;
}

export const MembersToolbar: React.FC<MembersToolbarProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  membersCount,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenInviteModal,
}) => {
  const hasActiveFilters =
    Boolean(filters.searchQuery.trim()) ||
    filters.role !== "all" ||
    filters.status !== "all" ||
    filters.sortBy !== "name";

  return (
    <div className="space-y-5 mb-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Thành viên & vai trò
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản lý thành viên trong Workspace, cấp quyền phân vai và kiểm soát ma trận phân quyền
          </p>
        </div>

        <button
          onClick={onOpenInviteModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/50 transition-all shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Mời thành viên mới</span>
        </button>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
        {/* Tab 1: Member List */}
        <button
          onClick={() => onTabChange("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "members"
              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách thành viên</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-zinc-900 border border-zinc-800 font-bold">
            {membersCount}
          </span>
        </button>

        {/* Tab 2: Pending Invites */}
        <button
          onClick={() => onTabChange("pending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "pending"
              ? "bg-amber-950/80 text-amber-400 border border-amber-800/60 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Lời mời đang chờ</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-zinc-950 font-extrabold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Tab 3: Permission Matrix */}
        <button
          onClick={() => onTabChange("permissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "permissions"
              ? "bg-purple-950/80 text-purple-400 border border-purple-800/60 shadow-md"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Bảng phân quyền (Role Matrix)</span>
        </button>
      </div>

      {/* Control Toolbar (Only rendered for Tab 1: Member List) */}
      {activeTab === "members" && (
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) =>
                  onFilterChange({ ...filters, searchQuery: e.target.value })
                }
                placeholder="Tìm theo tên thành viên hoặc địa chỉ email..."
                className="w-full pl-10 pr-10 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 transition-all outline-none"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Sort */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Role Filter */}
              <select
                value={filters.role}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    role: e.target.value as "all" | UserRole,
                  })
                }
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="owner">👑 Owner</option>
                <option value="admin">🛡️ Admin</option>
                <option value="member">👤 Member</option>
                <option value="guest">🌐 Guest</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    status: e.target.value as "all" | MemberStatus,
                  })
                }
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">🟢 Đang hoạt động</option>
                <option value="suspended">🔴 Tạm dừng</option>
              </select>

              {/* Sort By */}
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    sortBy: e.target.value as "name" | "joinDate" | "taskCount",
                  })
                }
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="name">Tên (A-Z)</option>
                <option value="taskCount">Số task phụ trách</option>
                <option value="joinDate">Mới gia nhập</option>
              </select>

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bỏ lọc</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
