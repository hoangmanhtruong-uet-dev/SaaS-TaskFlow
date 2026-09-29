 
"use client";

import { Check, Calendar as CalendarIcon } from "lucide-react";
import { CalendarTask } from "./types";

interface CalendarDayGridProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export function CalendarDayGrid({
  currentDate,
  tasks,
  onToggleComplete,
  onSelectTask,
}: CalendarDayGridProps) {
  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
  const dd = String(currentDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const dayTasks = tasks.filter((t) => t.dueAt === dateStr);

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 AM to 7:00 PM

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="font-extrabold text-lg text-zinc-100 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <span>Lịch công việc ngày {dateStr}</span>
        </h3>
        <span className="text-xs text-zinc-400 font-semibold">{dayTasks.length} công việc</span>
      </div>

      <div className="space-y-3">
        {hours.map((h) => {
          const timeSlot = `${String(h).padStart(2, "0")}:00`;
          const slotTasks = dayTasks.filter((t) => t.time?.startsWith(String(h).padStart(2, "0")));

          return (
            <div key={h} className="flex items-start gap-4 p-2 rounded-xl hover:bg-zinc-850/50 transition-colors">
              <div className="w-16 font-mono text-xs text-zinc-500 font-bold pt-1">{timeSlot}</div>

              <div className="flex-1 space-y-2 border-l-2 border-zinc-800 pl-4 py-1 min-h-[44px]">
                {slotTasks.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">Trống</span>
                ) : (
                  slotTasks.map((t) => (
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
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500">{t.code}</span>
                          <span className="font-bold text-zinc-100">{t.title}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{t.projectName}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(t.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          t.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-600"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
