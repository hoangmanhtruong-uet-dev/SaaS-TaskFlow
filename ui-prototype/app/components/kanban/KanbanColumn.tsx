"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TaskCard, type TaskItem } from "./TaskCard";

interface KanbanColumnProps {
  id: "todo" | "in-progress" | "in-review" | "completed";
  title: string;
  dotColorClass: string;
  tasks: TaskItem[];
  draggingTaskId: string | null;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDropTask: (taskId: string, targetColumnId: "todo" | "in-progress" | "in-review" | "completed") => void;
}

export function KanbanColumn({
  id,
  title,
  dotColorClass,
  tasks,
  draggingTaskId,
  onDragStart,
  onDragEnd,
  onDropTask,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    if (taskId) {
      onDropTask(taskId, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full rounded-2xl border p-3.5 transition-all duration-200 ${
        isOver
          ? "border-emerald-500/60 bg-emerald-500/5 ring-2 ring-emerald-500/20"
          : "border-zinc-800/60 bg-zinc-900/40"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColorClass}`} />
          <h2 className="text-sm font-bold text-zinc-100">{title}</h2>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-800 px-1.5 text-[11px] font-semibold text-zinc-400">
            {tasks.length}
          </span>
        </div>

        <Link
          href={`/app/tasks/new?columnId=${id}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="Thêm công việc vào cột này"
        >
          <Plus size={15} />
        </Link>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 min-h-[160px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={draggingTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-zinc-800/80 text-xs text-zinc-500">
            Kéo thả công việc vào đây
          </div>
        )}
      </div>

      {/* Footer Dashed Add Button */}
      <div className="pt-3 mt-1">
        <Link
          href={`/app/tasks/new?columnId=${id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700/60 py-2.5 text-xs font-medium text-zinc-400 hover:border-emerald-500/70 hover:bg-emerald-500/5 hover:text-emerald-400 transition-all duration-200"
        >
          <Plus size={14} />
          <span>Thêm công việc</span>
        </Link>
      </div>
    </div>
  );
}
