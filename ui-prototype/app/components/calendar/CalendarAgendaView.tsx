 
"use client";

import { Calendar, Check, Clock } from "lucide-react";
import { CalendarTask } from "./types";

interface CalendarAgendaViewProps {
  tasks: CalendarTask[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export function CalendarAgendaView({
  tasks,
  onToggleComplete,
  onSelectTask,
}: CalendarAgendaViewProps) {
  // Group tasks by date
  const sortedTasks = [...tasks].sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  const agendaMap = new Map<string, CalendarTask[]>();
  sortedTasks.forEach((t) => {
    const key = t.dueAt || "Không có hạn";
    if (!agendaMap.has(key)) {
      agendaMap.set(key, []);
    }
    agendaMap.get(key)!.push(t);
  });

  return (
    <div className="space-y-4">
      {Array.from(agendaMap.entries()).map(([dateStr, dateTasks]) => (
        <div key={dateStr} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-bold text-zinc-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-extrabold text-zinc-100">{dateStr}</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
              {dateTasks.length} task
            </span>
          </div>

          <div className="space-y-2">
            {dateTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectTask(t.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(t.id);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      t.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-600"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500">{t.code}</span>
                      <span className={`font-bold ${t.completed ? "line-through text-zinc-500" : "text-zinc-100"}`}>
                        {t.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{t.projectName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  {t.time && (
                    <div className="flex items-center gap-1 font-mono text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t.time}</span>
                    </div>
                  )}
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
