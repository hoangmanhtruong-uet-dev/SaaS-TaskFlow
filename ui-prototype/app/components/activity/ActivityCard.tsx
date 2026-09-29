 
"use client";

import React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  UserPlus,
  Paperclip,
  Clock,
  Folder,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ActivityLogItem, ActivityActionType } from "./types";

interface ActivityCardProps {
  item: ActivityLogItem;
  onSelectTask: (taskId: string) => void;
  isLastInGroup?: boolean;
}

// Action type icon & color map
const ACTION_CONFIG: Record<
  ActivityActionType,
  {
    icon: React.ElementType;
    badgeBg: string;
    badgeColor: string;
    borderColor: string;
    label: string;
  }
> = {
  create: {
    icon: Plus,
    badgeBg: "bg-emerald-500",
    badgeColor: "text-zinc-950",
    borderColor: "border-emerald-500/40",
    label: "Tạo mới",
  },
  update: {
    icon: Pencil,
    badgeBg: "bg-amber-500",
    badgeColor: "text-zinc-950",
    borderColor: "border-amber-500/40",
    label: "Chỉnh sửa",
  },
  move: {
    icon: ArrowRight,
    badgeBg: "bg-blue-500",
    badgeColor: "text-zinc-950",
    borderColor: "border-blue-500/40",
    label: "Đổi trạng thái",
  },
  assign: {
    icon: UserPlus,
    badgeBg: "bg-purple-500",
    badgeColor: "text-zinc-950",
    borderColor: "border-purple-500/40",
    label: "Gán người làm",
  },
  delete: {
    icon: Trash2,
    badgeBg: "bg-red-500",
    badgeColor: "text-zinc-950",
    borderColor: "border-red-500/40",
    label: "Đã xóa",
  },
  attachment: {
    icon: Paperclip,
    badgeBg: "bg-cyan-500",
    badgeColor: "text-zinc-950",
    borderColor: "border-cyan-500/40",
    label: "File đính kèm",
  },
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  onSelectTask,
  isLastInGroup = false,
}) => {
  const actionMeta = ACTION_CONFIG[item.actionType] || ACTION_CONFIG.update;
  const ActionIcon = actionMeta.icon;

  // Render Humanized text with highlighted clickable target
  const renderHumanizedDescription = () => {
    return (
      <div className="text-sm text-zinc-300 leading-relaxed">
        <span className="font-semibold text-zinc-100 hover:text-emerald-400 cursor-pointer">
          {item.actorName}
        </span>{" "}
        <span className="text-zinc-400 font-normal">{item.actionText}</span>{" "}
        {item.targetId ? (
          <button
            onClick={() => onSelectTask(item.targetId!)}
            className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-950/40 border border-emerald-800/40 rounded px-1.5 py-0.5 ml-1 transition-all"
          >
            {item.targetCode && (
              <span className="text-xs opacity-75 font-mono">[{item.targetCode}]</span>
            )}
            <span>{item.targetTitle}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>
        ) : (
          <span className="font-semibold text-zinc-200">&quot;{item.targetTitle}&quot;</span>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex gap-4 group">
      {/* Left Column: Timeline Line & Actor Avatar Overlay */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Avatar */}
          <img
            src={item.actorAvatar}
            alt={item.actorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-zinc-800 shadow-md group-hover:border-emerald-500/60 transition-colors"
          />
          {/* Icon Badge Overlay */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${actionMeta.badgeBg} ${actionMeta.badgeColor} flex items-center justify-center ring-2 ring-zinc-950 shadow-sm`}
            title={actionMeta.label}
          >
            <ActionIcon className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        {/* Vertical Connecting Line (Jira/GitHub audit log style) */}
        {!isLastInGroup && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-zinc-700/60 via-zinc-800 to-transparent my-2 group-hover:from-emerald-500/40 transition-colors"></div>
        )}
      </div>

      {/* Right Column: Main Activity Content Card */}
      <div className="flex-1 pb-6">
        <div className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-700/80 rounded-xl p-4 transition-all shadow-sm">
          {/* Header Row: Action humanized sentence & timestamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            {renderHumanizedDescription()}

            {/* Time badge */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0 bg-zinc-950/50 px-2.5 py-1 rounded-md border border-zinc-800/60">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{item.exactTime}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{item.relativeTime}</span>
            </div>
          </div>

          {/* Scope / Project Badge Tag */}
          {item.projectName && (
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                <Folder className="w-3 h-3 text-amber-400" />
                <span>{item.projectName}</span>
              </span>
            </div>
          )}

          {/* Visual Diff Block (Old Value ➔ New Value) */}
          {item.diff && (
            <div className="mt-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 text-xs space-y-2">
              <div className="text-zinc-400 font-medium flex items-center gap-1.5">
                <span>Chi tiết thay đổi trường:</span>
                <span className="font-semibold text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                  {item.diff.fieldName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                {/* Old Value Box */}
                {item.diff.oldValue && (
                  <div className="flex-1 bg-red-950/30 border border-red-900/40 text-red-300 rounded px-2.5 py-1.5 font-mono line-through opacity-85 break-all">
                    <span className="text-[10px] text-red-400 uppercase tracking-wider block font-sans font-semibold mb-0.5">
                      Giá trị cũ
                    </span>
                    {item.diff.oldValue}
                  </div>
                )}

                {/* Arrow Icon */}
                <div className="self-center text-zinc-500 font-bold shrink-0">
                  <ChevronRight className="w-4 h-4 hidden sm:block text-zinc-400" />
                  <span className="sm:hidden text-xs">⬇</span>
                </div>

                {/* New Value Box */}
                <div className="flex-1 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded px-2.5 py-1.5 font-mono font-medium break-all">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-sans font-semibold mb-0.5">
                    Giá trị mới
                  </span>
                  {item.diff.newValue}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
