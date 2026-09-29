 
"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { CalendarTask } from "./types";
import { TaskHoverPopover } from "./TaskHoverPopover";

interface CalendarMonthGridProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onCreateTaskOnDate: (dateStr: string) => void;
  onDropTaskOnDate: (dateStr: string) => void;
  setDraggedTaskId: (taskId: string | null) => void;
}

export function CalendarMonthGrid({
  currentDate,
  tasks,
  onToggleComplete,
  onSelectTask,
  onCreateTaskOnDate,
  onDropTaskOnDate,
  setDraggedTaskId,
}: CalendarMonthGridProps) {
  const [hoveredTask, setHoveredTask] = useState<CalendarTask | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [overflowDateStr, setOverflowDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate days in month matrix
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Shift Monday to start (0 = Mon, 6 = Sun)
  const mondayFirstOffset = (firstDayIndex + 6) % 7;

  const todayStr = new Date().toISOString().split("T")[0];

  const gridCells = [];
  for (let i = 0; i < mondayFirstOffset; i++) {
    gridCells.push({ empty: true, day: 0, dateStr: "" });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayTasks = tasks.filter((t) => {
      // Single day dueAt match or multi-day span (startDate <= dateStr <= endDate)
      if (t.startDate && t.endDate && t.startDate !== t.endDate) {
        return dateStr >= t.startDate && dateStr <= t.endDate;
      }
      return t.dueAt === dateStr;
    });

    gridCells.push({ empty: false, day: d, dateStr, tasks: dayTasks });
  }

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return "bg-rose-950/90 text-rose-200 border-rose-800/60 hover:bg-rose-900";
      case "MEDIUM":
        return "bg-amber-950/90 text-amber-200 border-amber-800/60 hover:bg-amber-900";
      case "LOW":
      default:
        return "bg-emerald-950/90 text-emerald-200 border-emerald-800/60 hover:bg-emerald-900";
    }
  };

  return (
    <div className="space-y-2">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-zinc-400 py-1 bg-zinc-950/80 rounded-xl border border-zinc-800">
        {weekDays.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-2 min-h-[580px]">
        {gridCells.map((cell, idx) => {
          if (cell.empty) {
            return <div key={idx} className="bg-zinc-950/20 rounded-2xl p-2 border border-zinc-900/40" />;
          }

          const isToday = cell.dateStr === todayStr;
          const displayLimit = 3;
          const visibleTasks = cell.tasks?.slice(0, displayLimit) || [];
          const hiddenCount = (cell.tasks?.length || 0) - displayLimit;

          return (
            <div
              key={idx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onDropTaskOnDate(cell.dateStr);
              }}
              onClick={(e) => {
                // If clicked on cell empty background, trigger quick create
                if (e.target === e.currentTarget) {
                  onCreateTaskOnDate(cell.dateStr);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
                  e.preventDefault();
                  onCreateTaskOnDate(cell.dateStr);
                }
              }}
              role="button"
              tabIndex={0}
              className={`group relative p-2 rounded-2xl border flex flex-col justify-between transition-all min-h-[110px] cursor-pointer ${
                isToday
                  ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/20"
                  : "bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between pointer-events-none">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    isToday
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {cell.day}
                </span>

                {/* Quick Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTaskOnDate(cell.dateStr);
                  }}
                  className="pointer-events-auto opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-emerald-600 transition-all"
                  title="Thêm nhanh công việc vào ngày này"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Tasks List */}
              <div className="space-y-1.5 my-1 flex-1 overflow-hidden">
                {visibleTasks.map((task) => {
                  const isMultiDay = task.startDate && task.endDate && task.startDate !== task.endDate;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTaskId(task.id)}
                      onMouseEnter={(e) => {
                        setHoveredTask(task);
                        setHoverPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoveredTask(null);
                        setHoverPosition(null);
                      }}
                      className={`group/item flex items-center justify-between gap-1 px-2 py-1 rounded-lg border text-xs font-semibold cursor-grab active:cursor-grabbing transition-all shadow-sm ${
                        task.completed
                          ? "bg-zinc-800/80 text-zinc-500 line-through border-zinc-750"
                          : getPriorityColor(task.priority)
                      } ${isMultiDay ? "ring-1 ring-emerald-400/40" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {/* Checkbox Fast Complete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task.id);
                          }}
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            task.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-zinc-500 hover:border-emerald-400 text-transparent"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task.id);
                          }}
                          className="truncate hover:underline text-[11px] text-left"
                        >
                          {task.title}
                        </button>
                      </div>

                      {/* Icons */}
                      <div className="flex items-center gap-1 shrink-0 text-[10px] opacity-70 group-hover/item:opacity-100">
                        {task.assigneeAvatar && (
                          <div className="w-4 h-4 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[9px]">
                            {task.assigneeAvatar}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overflow Hidden Count Badge */}
              {hiddenCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverflowDateStr(cell.dateStr);
                  }}
                  className="w-full py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors text-center"
                >
                  +{hiddenCount} task khác...
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover Preview Popover */}
      <TaskHoverPopover task={hoveredTask} position={hoverPosition} />

      {/* Overflow Hidden Popover Modal */}
      {overflowDateStr && (
        <>
          <button
            type="button"
            aria-label="Đóng danh sách công việc"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOverflowDateStr(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-zinc-100 flex items-center justify-between border-b border-zinc-800 pb-2">
              <span>Công việc ngày {overflowDateStr}</span>
              <button
                onClick={() => setOverflowDateStr(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Đóng
              </button>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tasks
                .filter((t) => t.dueAt === overflowDateStr)
                .map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => {
                      setOverflowDateStr(null);
                      onSelectTask(task.id);
                    }}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between text-xs text-left"
                  >
                    <span className={`font-semibold ${task.completed ? "line-through text-zinc-500" : ""}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">{task.code}</span>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
