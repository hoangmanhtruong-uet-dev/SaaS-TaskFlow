"use client";

import Link from "next/link";
import { CalendarDays, CheckSquare, MessageSquare, Paperclip, GripVertical } from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Urgent";
  tags: string[];
  dueAt: string;
  assignee: { name: string; avatar: string; colorClass: string; email?: string };
  columnId: "todo" | "in-progress" | "in-review" | "completed";
  subtasksTotal?: number;
  subtasksCompleted?: number;
  attachmentCount?: number;
  commentCount?: number;
}

interface TaskCardProps {
  task: TaskItem;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd }: TaskCardProps) {
  // Muted soft priority badges
  const priorityStyles = {
    Urgent: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    High: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };

  const priorityLabels = {
    Urgent: "Khẩn cấp",
    High: "Cao",
    Medium: "Trung bình",
    Low: "Thấp",
  };

  // Avatar background colors
  const avatarColors: Record<string, string> = {
    nv: "bg-emerald-600 text-emerald-100",
    hl: "bg-blue-600 text-blue-100",
    tp: "bg-purple-600 text-purple-100",
    default: "bg-zinc-700 text-zinc-200",
  };

  const subtasksTotal = task.subtasksTotal ?? 4;
  const subtasksCompleted = task.subtasksCompleted ?? (task.columnId === "completed" ? subtasksTotal : task.columnId === "in-review" ? subtasksTotal - 1 : 1);
  const attachmentCount = task.attachmentCount ?? (task.priority === "High" ? 2 : 0);
  const commentCount = task.commentCount ?? (task.priority === "High" ? 3 : 1);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:shadow-md hover:bg-zinc-900 ${
        isDragging ? "opacity-40 scale-95 border-emerald-500/50" : ""
      }`}
    >
      {/* Drag handle */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} />
      </div>

      <Link href={`/app/tasks/${task.id}`} className="block space-y-3">
        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              priorityStyles[task.priority] || priorityStyles.Medium
            }`}
          >
            {priorityLabels[task.priority] || task.priority}
          </span>

          {/* Tags */}
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {task.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Sub-task Progress Bar */}
        {subtasksTotal > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 font-medium">
                <CheckSquare size={12} className={subtasksCompleted === subtasksTotal ? "text-emerald-400" : "text-zinc-500"} />
                Checklist
              </span>
              <span className="font-mono text-[10px]">
                {subtasksCompleted}/{subtasksTotal}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  subtasksCompleted === subtasksTotal
                    ? "bg-emerald-500"
                    : "bg-emerald-600/80"
                }`}
                style={{ width: `${(subtasksCompleted / subtasksTotal) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Meta: Date, Attachments, Comments, Assignee */}
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            {/* Due date */}
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <CalendarDays size={12} className="text-zinc-500" />
              {task.dueAt}
            </span>

            {/* Attachments */}
            {attachmentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-zinc-400" title={`${attachmentCount} tệp đính kèm`}>
                <Paperclip size={12} className="text-zinc-500" />
                {attachmentCount}
              </span>
            )}

            {/* Comments */}
            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-zinc-400" title={`${commentCount} bình luận`}>
                <MessageSquare size={12} className="text-zinc-500" />
                {commentCount}
              </span>
            )}
          </div>

          {/* Assignee Avatar */}
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-1 ring-zinc-800 ${
              avatarColors[task.assignee.colorClass?.toLowerCase()] || avatarColors.default
            }`}
            title={`Người thực hiện: ${task.assignee.name}`}
          >
            {task.assignee.avatar}
          </div>
        </div>
      </Link>
    </div>
  );
}
