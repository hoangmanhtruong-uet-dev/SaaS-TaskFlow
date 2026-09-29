 
"use client";

import { Check } from "lucide-react";
import { CalendarTask } from "./types";

interface CalendarWeekGridProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onToggleComplete: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export function CalendarWeekGrid({
  currentDate,
  tasks,
  onToggleComplete,
  onSelectTask,
}: CalendarWeekGridProps) {
  // Get start of week (Monday)
  const d = new Date(currentDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateStr = dayDate.toISOString().split("T")[0];
    const dayTasks = tasks.filter((t) => t.dueAt === dateStr);
    weekDays.push({
      date: dayDate,
      dateStr,
      dayName: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i],
      tasks: dayTasks,
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[500px]">
      {weekDays.map((col, idx) => {
        const isToday = col.dateStr === todayStr;
        return (
          <div
            key={idx}
            className={`p-3 rounded-2xl border flex flex-col justify-between space-y-3 ${
              isToday
                ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg"
                : "bg-zinc-900/80 border-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-bold text-xs text-zinc-400">{col.dayName}</span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                  isToday ? "bg-emerald-500 text-zinc-950" : "text-zinc-200"
                }`}
              >
                {col.date.getDate()}
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {col.tasks.length === 0 ? (
                <p className="text-[11px] text-zinc-600 italic py-4 text-center">Trống</p>
              ) : (
                col.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectTask(task.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all space-y-1 ${
                      task.completed
                        ? "bg-zinc-800 text-zinc-500 line-through border-zinc-750"
                        : "bg-zinc-950 border-zinc-800 hover:border-emerald-500/40 text-zinc-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">{task.code}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-600"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    </div>
                    <p className="font-bold line-clamp-2">{task.title}</p>
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
