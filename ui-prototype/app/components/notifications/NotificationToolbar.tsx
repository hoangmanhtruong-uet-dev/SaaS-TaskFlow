 
"use client";

import React from "react";
import {
  Bell,
  CheckCheck,
  Settings,
  Search,
  X,
  Volume2,
  VolumeX,
  AtSign,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { NotificationCategoryTab, CategoryTabCounts } from "./types";

interface NotificationToolbarProps {
  activeTab: NotificationCategoryTab;
  onTabChange: (tab: NotificationCategoryTab) => void;
  counts: CategoryTabCounts;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onMarkAllAsRead: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function NotificationToolbar({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onMarkAllAsRead,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}: NotificationToolbarProps) {
  const tabs: { id: NotificationCategoryTab; label: string; icon: React.ElementType; count: number; isUnreadBadge?: boolean }[] = [
    { id: "all", label: "Tất cả", icon: Bell, count: counts.all },
    { id: "unread", label: "Chưa đọc", icon: Bell, count: counts.unread, isUnreadBadge: true },
    { id: "mention", label: "Nhắc đến", icon: AtSign, count: counts.mention },
    { id: "assignment", label: "Việc được giao", icon: UserCheck, count: counts.assignment },
    { id: "system", label: "Hệ thống", icon: ShieldAlert, count: counts.system },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm thông báo theo từ khóa, người gửi..."
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

        {/* Action Controls Right */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              soundEnabled
                ? "bg-zinc-950 border-zinc-800 text-emerald-400 hover:border-emerald-500/40"
                : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
            title={soundEnabled ? "Âm thanh thông báo: BẬT" : "Âm thanh thông báo: TẮT"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mark All As Read */}
          <button
            onClick={onMarkAllAsRead}
            disabled={counts.unread === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Cài đặt thông báo"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isUnreadBadgeHasCount = tab.isUnreadBadge && tab.count > 0;

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

              {/* Badge count */}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isUnreadBadgeHasCount
                    ? "bg-emerald-500 text-zinc-950 font-bold animate-pulse"
                    : isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-zinc-800 text-zinc-400"
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
