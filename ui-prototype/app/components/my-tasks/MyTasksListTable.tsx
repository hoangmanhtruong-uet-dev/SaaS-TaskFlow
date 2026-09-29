 
"use client";

import {
  CheckSquare,
  Square,
  FolderKanban,
  Calendar,
  Check,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { MyTask } from "./types";

interface GroupSection {
  groupKey: string;
  groupTitle: string;
  tasks: MyTask[];
}

interface MyTasksListTableProps {
  groupedSections: GroupSection[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export function MyTasksListTable({
  groupedSections,
  onToggleComplete,
  onSelectTask,
}: MyTasksListTableProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
            Khẩn cấp
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/50 text-rose-300 border border-rose-800/40">
            Cao
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/50 text-amber-300 border border-amber-800/40">
            Trung bình
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/40">
            Thấp
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {groupedSections.map((section) => (
        <div
          key={section.groupKey}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 shadow-md overflow-hidden"
        >
          {/* Section Header (Group Title & Count) */}
          <div className="flex items-center justify-between px-5 py-3 bg-zinc-950/80 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-bold text-zinc-100">{section.groupTitle}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px]">
                {section.tasks.length}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-zinc-300">
              <thead className="bg-zinc-950/40 text-zinc-400 font-semibold uppercase text-[11px] tracking-wider border-b border-zinc-800/60">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">Hoàn thành</th>
                  <th className="py-3 px-4">Tên công việc</th>
                  <th className="py-3 px-4">Dự án</th>
                  <th className="py-3 px-4">Mức ưu tiên</th>
                  <th className="py-3 px-4">Hạn hoàn thành</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/50">
                {section.tasks.map((task) => {
                  const isOverdue = !task.completed && task.dueAt && task.dueAt < todayStr;
                  const isDueToday = !task.completed && task.dueAt && task.dueAt === todayStr;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-zinc-850/60 transition-colors group ${
                        task.completed ? "opacity-60 bg-zinc-950/30" : ""
                      }`}
                    >
                      {/* Checkbox Column (Fast Complete) */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleComplete(task.id)}
                          className="p-1 rounded text-zinc-500 hover:text-emerald-400 transition-transform active:scale-95"
                          title={task.completed ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
                        >
                          {task.completed ? (
                            <div className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <Square className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                          )}
                        </button>
                      </td>

                      {/* Task Title & Code */}
                      <td className="py-3 px-4 font-medium max-w-md">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                              {task.code}
                            </span>
                            <button
                              onClick={() => onSelectTask(task.id)}
                              className={`text-left hover:text-emerald-400 focus:outline-none transition-all ${
                                task.completed
                                  ? "line-through text-zinc-500"
                                  : "text-zinc-100 font-semibold"
                              }`}
                            >
                              {task.title}
                            </button>
                          </div>

                          {/* Sub-meta icons (checklist, attachments, comments) */}
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                            {task.checklistTotal && task.checklistTotal > 0 ? (
                              <span className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3 text-zinc-400" />
                                {task.checklistCompleted}/{task.checklistTotal}
                              </span>
                            ) : null}

                            {task.attachmentCount && task.attachmentCount > 0 ? (
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3 text-zinc-400" />
                                {task.attachmentCount}
                              </span>
                            ) : null}

                            {task.commentCount && task.commentCount > 0 ? (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-zinc-400" />
                                {task.commentCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Project Badge */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700/60 inline-flex items-center gap-1.5">
                          <FolderKanban className="w-3 h-3 text-emerald-400" />
                          <span>{task.projectName}</span>
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>

                      {/* Due Date */}
                      <td className="py-3 px-4">
                        {task.dueAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar
                              className={`w-3.5 h-3.5 ${
                                isOverdue
                                  ? "text-rose-400"
                                  : isDueToday
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isOverdue
                                  ? "text-rose-400 font-bold"
                                  : isDueToday
                                  ? "text-emerald-400 font-bold"
                                  : "text-zinc-400"
                              }`}
                            >
                              {task.dueAt}
                              {isOverdue && " (Quá hạn)"}
                              {isDueToday && " (Hôm nay)"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs">Chưa có hạn</span>
                        )}
                      </td>

                      {/* Action Detail button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectTask(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-600/20 text-zinc-300 hover:text-emerald-300 border border-zinc-700 hover:border-emerald-500/40 text-xs font-semibold transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
