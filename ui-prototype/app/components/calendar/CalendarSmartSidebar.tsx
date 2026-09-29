 
"use client";

import { useState } from "react";
import { AlertTriangle, Calendar, GripVertical, ExternalLink } from "lucide-react";
import { CalendarTask, UnscheduledTask, GoogleCalendarEvent } from "./types";

interface CalendarSmartSidebarProps {
  tasks: CalendarTask[];
  unscheduledTasks: UnscheduledTask[];
  googleEvents: GoogleCalendarEvent[];
  onSelectTask: (id: string) => void;
  setDraggedTaskId: (id: string | null) => void;
}

export function CalendarSmartSidebar({
  tasks,
  unscheduledTasks,
  googleEvents,
  onSelectTask,
  setDraggedTaskId,
}: CalendarSmartSidebarProps) {
  const [activeTab, setActiveTab] = useState<"attention" | "unscheduled" | "sync">("unscheduled");

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueAt < todayStr);
  const todayTasks = tasks.filter((t) => !t.completed && t.dueAt === todayStr);

  return (
    <div className="w-full lg:w-80 shrink-0 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl">
      {/* Sidebar Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("unscheduled")}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            activeTab === "unscheduled"
              ? "bg-emerald-500/20 text-emerald-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Chưa có hạn ({unscheduledTasks.length})
        </button>

        <button
          onClick={() => setActiveTab("attention")}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            activeTab === "attention"
              ? "bg-rose-500/20 text-rose-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Chú ý ({overdueTasks.length + todayTasks.length})
        </button>

        <button
          onClick={() => setActiveTab("sync")}
          className={`flex-1 py-2 rounded-lg transition-colors text-center ${
            activeTab === "sync"
              ? "bg-blue-500/20 text-blue-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Google Sync
        </button>
      </div>

      {/* ── TAB 1: UNSCHEDULED TASKS POOL (DRAG & DROP) ── */}
      {activeTab === "unscheduled" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
              <GripVertical className="w-4 h-4 text-emerald-400" />
              <span>Kéo thả vào lịch để gán ngày</span>
            </h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Giữ và kéo thẻ task thả vào một ô ngày trên lịch để xếp hạn chót.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {unscheduledTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Không có task chưa xếp lịch
              </div>
            ) : (
              unscheduledTasks.map((u) => (
                <div
                  key={u.id}
                  draggable
                  onDragStart={() => setDraggedTaskId(u.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 cursor-grab active:cursor-grabbing space-y-1.5 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-500 font-bold">{u.code}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                      {u.projectName}
                    </span>
                  </div>

                  <h5 className="font-semibold text-xs text-zinc-100 group-hover:text-emerald-400 leading-snug">
                    {u.title}
                  </h5>

                  {u.estimatedHours && (
                    <div className="text-[10px] text-zinc-500 font-medium">
                      Dự kiến: {u.estimatedHours} giờ làm việc
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: ATTENTION QUICK FILTERS ── */}
      {activeTab === "attention" && (
        <div className="space-y-3">
          {/* Overdue */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-400">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Quá hạn ({overdueTasks.length})
              </span>
            </div>
            {overdueTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelectTask(t.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Mở task ${t.title}`}
                className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs font-medium cursor-pointer hover:border-rose-500/60"
              >
                <div className="text-zinc-200 font-bold">{t.title}</div>
                <div className="text-[10px] text-rose-300">Quá hạn từ {t.dueAt}</div>
              </div>
            ))}
          </div>

          {/* Due Today */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Hạn hôm nay ({todayTasks.length})
              </span>
            </div>
            {todayTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelectTask(t.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Mở task ${t.title}`}
                className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs font-medium cursor-pointer hover:border-amber-500/60"
              >
                <div className="text-zinc-200 font-bold">{t.title}</div>
                <div className="text-[10px] text-amber-300">Hạn chót 24h</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: GOOGLE CALENDAR SYNC ── */}
      {activeTab === "sync" && (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Google Calendar
            </div>
            <p className="text-[11px] text-blue-200/80 leading-normal">
              Các sự kiện từ tài khoản Google Calendar cá nhân tự động đồng bộ hai chiều.
            </p>
          </div>

          <div className="space-y-2">
            {googleEvents.map((g) => (
              <div key={g.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="font-bold text-zinc-100">{g.title}</div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {g.dateStr} · {g.startTime} - {g.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
