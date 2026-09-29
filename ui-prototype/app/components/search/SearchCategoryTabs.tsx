 
"use client";

import React from "react";
import { LayoutGrid, CheckSquare, FolderKanban, FileText, Users } from "lucide-react";

export type SearchCategory = "all" | "tasks" | "projects" | "docs" | "members";

export interface CategoryCounts {
  all: number;
  tasks: number;
  projects: number;
  docs: number;
  members: number;
}

interface SearchCategoryTabsProps {
  activeTab: SearchCategory;
  onTabChange: (tab: SearchCategory) => void;
  counts?: CategoryCounts;
}

export function SearchCategoryTabs({
  activeTab,
  onTabChange,
  counts = { all: 0, tasks: 0, projects: 0, docs: 0, members: 0 },
}: SearchCategoryTabsProps) {
  const tabs: { id: SearchCategory; label: string; icon: React.ElementType; count: number }[] = [
    { id: "all", label: "Tất cả", icon: LayoutGrid, count: counts.all },
    { id: "tasks", label: "Công việc", icon: CheckSquare, count: counts.tasks },
    { id: "projects", label: "Dự án", icon: FolderKanban, count: counts.projects },
    { id: "docs", label: "Tài liệu", icon: FileText, count: counts.docs },
    { id: "members", label: "Thành viên", icon: Users, count: counts.members },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              isActive
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive
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
