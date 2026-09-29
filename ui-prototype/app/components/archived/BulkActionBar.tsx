 
"use client";

import { RotateCcw, Trash2, CheckSquare, Square, X } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onToggleSelectAll,
  onClearSelection,
  onBulkRestore,
  onBulkDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/50 shadow-2xl animate-scaleUp text-xs sm:text-sm">
      <div className="flex items-center gap-3">
        {/* Select All Checkbox Toggle */}
        <button
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 text-zinc-200 font-semibold hover:text-emerald-400 transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          ) : (
            <Square className="w-4 h-4 text-zinc-500" />
          )}
          <span>{isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}</span>
        </button>

        <span className="text-zinc-500">|</span>

        {/* Selected Count Indicator */}
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30">
          Đã chọn {selectedCount} / {totalCount} mục
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBulkRestore}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục các mục đã chọn</span>
        </button>

        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa vĩnh viễn</span>
        </button>

        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Bỏ chọn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
