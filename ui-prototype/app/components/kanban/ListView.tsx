"use client";

import Link from "next/link";
import { CalendarDays, CheckSquare, ChevronRight } from "lucide-react";
import type { TaskItem } from "./TaskCard";

interface ListViewProps {
  tasks: TaskItem[];
  onStatusChange: (taskId: string, newColumnId: "todo" | "in-progress" | "in-review" | "completed") => void;
}

export function ListView({ tasks, onStatusChange }: ListViewProps) {
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

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800/80 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên công việc</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Mức ưu tiên</th>
              <th className="px-4 py-3 font-semibold">Checklist</th>
              <th className="px-4 py-3 font-semibold">Hạn hoàn thành</th>
              <th className="px-4 py-3 font-semibold">Người thực hiện</th>
              <th className="px-4 py-3 font-semibold text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const subtasksTotal = task.subtasksTotal ?? 4;
                const subtasksCompleted = task.subtasksCompleted ?? (task.columnId === "completed" ? subtasksTotal : 1);

                return (
                  <tr key={task.id} className="hover:bg-zinc-900/80 transition-colors group">
                    {/* Title */}
                    <td className="px-4 py-3 font-medium text-zinc-100 max-w-xs">
                      <Link href={`/app/tasks/${task.id}`} className="hover:text-emerald-400 font-semibold transition-colors block truncate">
                        {task.title}
                      </Link>
                      <span className="text-[11px] text-zinc-500 truncate block mt-0.5">{task.description}</span>
                    </td>

                    {/* Column Status */}
                    <td className="px-4 py-3">
                      <select
                        value={task.columnId}
                        onChange={(e) =>
                          onStatusChange(
                            task.id,
                            e.target.value as "todo" | "in-progress" | "in-review" | "completed"
                          )
                        }
                        className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="todo">Cần làm</option>
                        <option value="in-progress">Đang làm</option>
                        <option value="in-review">Đang đánh giá</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${priorityStyles[task.priority]}`}>
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                    </td>

                    {/* Checklist */}
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <CheckSquare size={13} className={subtasksCompleted === subtasksTotal ? "text-emerald-400" : "text-zinc-500"} />
                        {subtasksCompleted}/{subtasksTotal}
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="px-4 py-3 text-zinc-400">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <CalendarDays size={13} className="text-zinc-500" />
                        {task.dueAt}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-emerald-100 shadow-sm">
                          {task.assignee.avatar}
                        </div>
                        <span className="text-xs font-medium text-zinc-300">{task.assignee.name}</span>
                      </div>
                    </td>

                    {/* Link */}
                    <td className="px-4 py-3 text-right">
                      <Link href={`/app/tasks/${task.id}`} className="inline-flex items-center gap-0.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                        Xem <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs text-zinc-500">
                  Không tìm thấy công việc nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
