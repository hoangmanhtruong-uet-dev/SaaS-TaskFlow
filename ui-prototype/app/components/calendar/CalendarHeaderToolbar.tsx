 
"use client";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { CalendarViewMode, CalendarFilterState } from "./types";

type CalendarFilterValue = string | boolean;

interface ProjectOption {
  id: string;
  name: string;
}

interface CalendarHeaderToolbarProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onGoToday: () => void;
  onGoPrev: () => void;
  onGoNext: () => void;
  filters: CalendarFilterState;
  onFilterChange: (key: keyof CalendarFilterState, value: CalendarFilterValue) => void;
  projects?: ProjectOption[];
}

export function CalendarHeaderToolbar({
  currentDate,
  viewMode,
  onViewModeChange,
  onGoToday,
  onGoPrev,
  onGoNext,
  filters,
  onFilterChange,
  projects = [
    { id: "proj-101", name: "SaaS TaskFlow Core" },
    { id: "proj-102", name: "TaskFlow Mobile App" },
    { id: "proj-103", name: "UI/UX Design System" },
  ],
}: CalendarHeaderToolbarProps) {
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const dateLabel = `${monthNames[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
      {/* Left: View Mode Segmented Control + Date Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => onViewModeChange("month")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === "month"
                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Xem Tháng
          </button>

          <button
            onClick={() => onViewModeChange("week")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === "week"
                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Xem Tuần
          </button>

          <button
            onClick={() => onViewModeChange("day")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === "day"
                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Xem Ngày
          </button>

          <button
            onClick={() => onViewModeChange("agenda")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === "agenda"
                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Lịch trình
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGoPrev}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title="Trang trước (Phím mũi tên Trái)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToday}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
            title="Trở về Hôm nay (Phím T)"
          >
            Hôm nay
          </button>

          <button
            onClick={onGoNext}
            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title="Trang tiếp (Phím mũi tên Phải)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Month / Year Title */}
        <h2 className="text-lg font-bold text-zinc-100 min-w-[140px] flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <span>{dateLabel}</span>
        </h2>
      </div>

      {/* Right: Sync Status + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Google Calendar Sync Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>Google Calendar: Đã kết nối</span>
        </div>

        {/* Filter Project */}
        <div className="relative">
          <select
            value={filters.projectId}
            onChange={(e) => onFilterChange("projectId", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              filters.projectId !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Dự án: Tất cả</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Filter Priority */}
        <div className="relative">
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange("priority", e.target.value)}
            className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors focus:outline-none ${
              filters.priority !== "all"
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <option value="all">Ưu tiên: Tất cả</option>
            <option value="URGENT">Khẩn cấp</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
        </div>

        {/* Toggle Show Completed */}
        <button
          onClick={() => onFilterChange("showCompleted", !filters.showCompleted)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            filters.showCompleted
              ? "bg-zinc-950 border-zinc-800 text-zinc-300"
              : "bg-zinc-800 border-zinc-700 text-zinc-500"
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${filters.showCompleted ? "text-emerald-400" : ""}`} />
          <span>Hiện task đã xong</span>
        </button>
      </div>
    </div>
  );
}
