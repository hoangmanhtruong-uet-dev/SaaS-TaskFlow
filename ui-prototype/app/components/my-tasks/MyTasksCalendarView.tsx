 
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { MyTask } from "./types";

interface MyTasksCalendarViewProps {
  tasks: MyTask[];
  onSelectTask: (id: string) => void;
}

export function MyTasksCalendarView({ tasks, onSelectTask }: MyTasksCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sept 2026

  const daysInMonth = 30; // Sept has 30 days
  const startDayOffset = 2; // Tuesday start

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const dayCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    dayCells.push({ empty: true, day: 0 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `2026-09-${d.toString().padStart(2, "0")}`;
    const dayTasks = tasks.filter((t) => t.dueAt === dateStr);
    dayCells.push({ empty: false, day: d, dateStr, tasks: dayTasks });
  }

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4 shadow-xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-base text-zinc-100">
            Tháng {currentDate.getMonth() + 1} - {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-zinc-400 py-1 border-b border-zinc-800/60">
        {weekDays.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 min-h-[400px]">
        {dayCells.map((cell, idx) => {
          if (cell.empty) {
            return <div key={idx} className="bg-zinc-950/20 rounded-xl p-2" />;
          }

          const isToday = cell.dateStr === new Date().toISOString().split("T")[0];

          return (
            <div
              key={idx}
              className={`p-2 rounded-xl border flex flex-col justify-start transition-colors space-y-1 min-h-[90px] ${
                isToday
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-zinc-950/80 border-zinc-850 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold px-1.5 py-0.5 rounded ${
                    isToday ? "bg-emerald-500 text-zinc-950" : "text-zinc-400"
                  }`}
                >
                  {cell.day}
                </span>
                {cell.tasks && cell.tasks.length > 0 && (
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {cell.tasks.length} task
                  </span>
                )}
              </div>

              {/* Task Items in Day Cell */}
              <div className="space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                {cell.tasks?.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTask(t.id)}
                    className={`w-full text-left p-1 rounded text-[11px] font-semibold truncate block transition-colors ${
                      t.completed
                        ? "bg-zinc-800 text-zinc-500 line-through"
                        : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
