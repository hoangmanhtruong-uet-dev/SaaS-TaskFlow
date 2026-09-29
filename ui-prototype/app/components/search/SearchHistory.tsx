 
"use client";

import { History, Sparkles, X, Trash2, ArrowUpRight } from "lucide-react";

interface SearchHistoryProps {
  history: string[];
  onSelectQuery: (query: string) => void;
  onRemoveItem: (query: string) => void;
  onClearAll: () => void;
}

export const TRENDING_TAGS = [
  { label: "#Bug", query: "Bug" },
  { label: "#UI/UX", query: "UI/UX" },
  { label: "#API", query: "API" },
  { label: "#Security", query: "Security" },
  { label: "#Backend", query: "Backend" },
  { label: "#Database", query: "Database" },
  { label: "#Auth", query: "Auth" },
  { label: "#Performance", query: "Performance" },
];

export function SearchHistory({
  history,
  onSelectQuery,
  onRemoveItem,
  onClearAll,
}: SearchHistoryProps) {
  return (
    <div className="space-y-8 py-4">
      {/* 1. Recent Searches Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold text-sm">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Tìm kiếm gần đây</span>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lịch sử</span>
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs sm:text-sm transition-all shadow-sm"
              >
                <button
                  onClick={() => onSelectQuery(item)}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <History className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  <span>{item}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item);
                  }}
                  className="text-zinc-500 hover:text-rose-400 p-0.5 rounded-full hover:bg-zinc-800 transition-colors"
                  title="Xóa"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">Chưa có lịch sử tìm kiếm gần đây.</p>
        )}
      </div>

      {/* 2. Trending Tags Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Từ khóa phổ biến / Gợi ý</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {TRENDING_TAGS.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuery(tag.query)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-300 text-xs sm:text-sm font-medium transition-all group"
            >
              <span>{tag.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
