"use client";

import { CheckSquare } from "lucide-react";
import { CalendarTask } from "./types";

interface TaskHoverPopoverProps {
  task: CalendarTask | null;
  position: { x: number; y: number } | null;
}

export function TaskHoverPopover({ task, position }: TaskHoverPopoverProps) {
  if (!task || !position) return null;

  return (
    <div
      style={{
        top: position.y + 12,
        left: Math.min(position.x, window.innerWidth - 300),
      }}
      className="fixed z-50 w-72 p-4 rounded-2xl bg-zinc-950/95 border border-zinc-800 text-zinc-100 shadow-2xl space-y-3 pointer-events-none backdrop-blur-md animate-fadeIn"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-mono text-zinc-500 font-semibold">{task.code}</span>
        <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-medium text-[11px]">
          {task.projectName}
        </span>
      </div>

      <h4 className="font-bold text-sm text-zinc-100 leading-snug">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed bg-zinc-900/80 p-2 rounded-lg border border-zinc-850">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-850">
        {task.assigneeName && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
              {task.assigneeAvatar ?? task.assigneeName.charAt(0)}
            </div>
            <span className="text-zinc-300">{task.assigneeName}</span>
          </div>
        )}

        {task.checklistTotal && task.checklistTotal > 0 ? (
          <div className="flex items-center gap-1 text-zinc-400">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {task.checklistCompleted}/{task.checklistTotal}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
