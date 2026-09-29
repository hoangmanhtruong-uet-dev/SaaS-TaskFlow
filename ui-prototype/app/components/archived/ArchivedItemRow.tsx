 
"use client";

import {
  FolderKanban,
  CheckSquare,
  FileText,
  RotateCcw,
  Trash2,
  Clock,
  Check,
  Square,
} from "lucide-react";
import { ArchivedItem, ArchivedType } from "./types";

interface ArchivedItemRowProps {
  item: ArchivedItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (item: ArchivedItem) => void;
}

export function ArchivedItemRow({
  item,
  isSelected,
  onToggleSelect,
  onRestore,
  onPermanentDelete,
}: ArchivedItemRowProps) {
  const getTypeBadge = (type: ArchivedType) => {
    switch (type) {
      case "project":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            <span>Dự án</span>
          </span>
        );
      case "file":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 inline-flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Tệp tin</span>
          </span>
        );
      case "task":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />
            <span>Công việc</span>
          </span>
        );
    }
  };

  const isUrgentExpiry = item.remainingDays <= 5;

  return (
    <tr
      className={`hover:bg-zinc-850/60 transition-colors group ${
        isSelected ? "bg-emerald-500/10" : ""
      }`}
    >
      {/* Checkbox Column */}
      <td className="py-3.5 px-4 text-center">
        <button
          onClick={() => onToggleSelect(item.id)}
          className="p-1 rounded text-zinc-500 hover:text-emerald-400 transition-colors"
        >
          {isSelected ? (
            <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          ) : (
            <Square className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
          )}
        </button>
      </td>

      {/* Item Type Badge */}
      <td className="py-3.5 px-4">{getTypeBadge(item.type)}</td>

      {/* Title, Code & Original Path */}
      <td className="py-3.5 px-4 font-medium max-w-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {item.code && (
              <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                {item.code}
              </span>
            )}
            <h4 className="font-bold text-zinc-100 text-sm">{item.title}</h4>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-1">{item.originalPath}</p>
        </div>
      </td>

      {/* Archived By User */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
            {item.archivedByAvatar ?? item.archivedByName.charAt(0)}
          </div>
          <span>{item.archivedByName}</span>
        </div>
      </td>

      {/* Countdown Remaining Days Badge */}
      <td className="py-3.5 px-4">
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
            isUrgentExpiry
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700/60"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isUrgentExpiry ? "text-rose-400" : "text-zinc-400"}`} />
          <span>Còn {item.remainingDays} ngày</span>
        </div>
      </td>

      {/* Row Quick Action Buttons */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onRestore(item.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
            title="Khôi phục mục này"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục</span>
          </button>

          <button
            onClick={() => onPermanentDelete(item)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/40 transition-colors"
            title="Xóa vĩnh viễn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
