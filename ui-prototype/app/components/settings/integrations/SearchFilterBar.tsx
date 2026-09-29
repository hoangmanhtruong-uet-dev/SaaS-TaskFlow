 
import React from "react";
import { Search, Filter, MessageSquare, Code2, Zap, Cloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppCategory } from "./types";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: AppCategory;
  onCategoryChange: (cat: AppCategory) => void;
  totalAppsCount: number;
}

const categories: { id: AppCategory; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "Tất cả ứng dụng", icon: Filter },
  { id: "communication", label: "Trò chuyện & Nhóm", icon: MessageSquare },
  { id: "developer", label: "Lập trình & Code", icon: Code2 },
  { id: "automation", label: "Tự động hóa", icon: Zap },
  { id: "cloud_design", label: "Lưu trữ & Thiết kế", icon: Cloud },
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl space-y-4 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm ứng dụng (Slack, GitHub, Jira...)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
