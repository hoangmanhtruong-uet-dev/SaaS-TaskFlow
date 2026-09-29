 
"use client";

import React from "react";
import { CheckSquare, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SmartTab } from "./types";

interface TabCounts {
  all: number;
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
}

interface MyTasksSmartTabsProps {
  activeTab: SmartTab;
  onTabChange: (tab: SmartTab) => void;
  counts: TabCounts;
}

export function MyTasksSmartTabs({ activeTab, onTabChange, counts }: MyTasksSmartTabsProps) {
  const tabs: { id: SmartTab; label: string; icon: React.ElementType; count: number; isOverdueBadge?: boolean }[] = [
    { id: "all", label: "Tất cả công việc", icon: CheckSquare, count: counts.all },
    { id: "today", label: "Hôm nay", icon: Calendar, count: counts.today },
    { id: "upcoming", label: "Sắp tới", icon: Clock, count: counts.upcoming },
    { id: "overdue", label: "Quá hạn", icon: AlertTriangle, count: counts.overdue, isOverdueBadge: true },
    { id: "completed", label: "Đã hoàn thành", icon: CheckCircle2, count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isOverdueHasCount = tab.isOverdueBadge && tab.count > 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              isActive
                ? isOverdueHasCount
                  ? "border-rose-500 text-rose-400 bg-rose-500/10 font-bold"
                  : "border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold"
                : isOverdueHasCount
                ? "border-transparent text-rose-400/90 hover:bg-rose-500/10"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isOverdueHasCount
                  ? "text-rose-400"
                  : isActive
                  ? "text-emerald-400"
                  : "text-zinc-400"
              }`}
            />
            <span>{tab.label}</span>

            {/* Badge Count */}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isOverdueHasCount
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
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
  );
}
