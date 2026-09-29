 
"use client";

import { SearchX, FilterX, RefreshCw, Lightbulb } from "lucide-react";
import { ResultCard, SearchResultItem } from "./ResultCard";

interface ResultListProps {
  results: SearchResultItem[];
  query: string;
  isLoading?: boolean;
  onSelectTask?: (taskId: string) => void;
  onResetFilters?: () => void;
  onClearQuery?: () => void;
  hasActiveFilters?: boolean;
}

export function ResultList({
  results,
  query,
  isLoading = false,
  onSelectTask,
  onResetFilters,
  onClearQuery,
  hasActiveFilters = false,
}: ResultListProps) {
  // Empty result state when search returns no match
  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40 my-4 space-y-6">
        {/* Glow Icon Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
          <div className="relative p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <SearchX className="w-10 h-10 text-emerald-400/80" />
          </div>
        </div>

        {/* Heading & Text */}
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold text-zinc-100">
            Không tìm thấy kết quả phù hợp
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Không tìm thấy thông tin phù hợp cho từ khóa &quot;
            <span className="text-emerald-400 font-semibold">{query}</span>&quot;.
          </p>
        </div>

        {/* Suggestions Box */}
        <div className="w-full max-w-md p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2 font-semibold text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span>Gợi ý dành cho bạn:</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-zinc-400 pl-1">
            <li>Thử tìm với từ khóa chung hơn hoặc ngắn hơn.</li>
            <li>Kiểm tra lại lỗi chính tả hoặc khoảng trắng.</li>
            {hasActiveFilters && (
              <li className="text-amber-300 font-medium">
                Thử bỏ bớt bộ lọc đang chọn để mở rộng phạm vi tìm kiếm.
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {hasActiveFilters && onResetFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700"
            >
              <FilterX className="w-4 h-4 text-emerald-400" />
              <span>Bỏ tất cả bộ lọc</span>
            </button>
          )}

          {onClearQuery && (
            <button
              onClick={onClearQuery}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors border border-emerald-500/40"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Xóa từ khóa tìm kiếm</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Search Header Counter */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 border-b border-zinc-800/80 pb-3">
        <div>
          Tìm thấy{" "}
          <strong className="text-emerald-400 font-bold text-base px-1">
            {results.length}
          </strong>{" "}
          kết quả {query ? <>cho từ khóa &quot;<span className="text-zinc-200">{query}</span>&quot;</> : ""}
        </div>

        <span className="text-zinc-500 text-xs">Phù hợp nhất</span>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-3">
        {results.map((item) => (
          <ResultCard
            key={`${item.type}-${item.id}`}
            item={item}
            query={query}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </div>
  );
}
