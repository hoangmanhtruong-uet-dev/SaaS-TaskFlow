 
"use client";

import { Calendar, Check } from "lucide-react";
import { MyTask } from "./types";

interface MyTasksBoardViewProps {
  tasks: MyTask[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export function MyTasksBoardView({ tasks, onToggleComplete, onSelectTask }: MyTasksBoardViewProps) {
  const columns = [
    { id: "TODO", title: "Cần làm", border: "border-zinc-700", dot: "bg-zinc-400" },
    { id: "IN_PROGRESS", title: "Đang thực hiện", border: "border-blue-500/50", dot: "bg-blue-400" },
    { id: "REVIEW", title: "Đang kiểm thử", border: "border-purple-500/50", dot: "bg-purple-400" },
    { id: "DONE", title: "Hoàn thành", border: "border-emerald-500/50", dot: "bg-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className="font-bold text-sm text-zinc-100">{col.title}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-semibold">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {colTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Chưa có công việc
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-2.5 shadow-sm group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">{task.code}</span>
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-zinc-600 hover:border-emerald-400 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectTask(task.id)}
                      className={`font-semibold text-xs text-left text-zinc-100 group-hover:text-emerald-400 line-clamp-2 ${
                        task.completed ? "line-through text-zinc-500" : ""
                      }`}
                    >
                      {task.title}
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-900 pt-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium truncate max-w-[120px]">
                        {task.projectName}
                      </span>
                      {task.dueAt && (
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
