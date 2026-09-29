"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CalendarTask,
  CalendarViewMode,
  UnscheduledTask,
  CalendarFilterState,
  GoogleCalendarEvent,
} from "./types";
import {
  MOCK_CALENDAR_TASKS,
  MOCK_UNSCHEDULED_TASKS,
  MOCK_GOOGLE_CALENDAR_EVENTS,
} from "./constants";

const INITIAL_FILTERS: CalendarFilterState = {
  projectId: "all",
  priority: "all",
  assigneeId: "all",
  showCompleted: true,
};

export function useCalendarEngine() {
  // Current view date (Default Sept 2026 to match mock data)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 25));
  const [viewMode, setViewModeState] = useState<CalendarViewMode>("month");

  // Load view mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("taskflow_calendar_view") as CalendarViewMode;
      if (saved === "month" || saved === "week" || saved === "day" || saved === "agenda") {
        window.setTimeout(() => setViewModeState(saved), 0);
      }
    }
  }, []);

  const setViewMode = (mode: CalendarViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("taskflow_calendar_view", mode);
    }
  };

  // Master datasets
  const [tasks, setTasks] = useState<CalendarTask[]>(MOCK_CALENDAR_TASKS);
  const [unscheduledTasks, setUnscheduledTasks] = useState<UnscheduledTask[]>(MOCK_UNSCHEDULED_TASKS);
  const [googleEvents] = useState<GoogleCalendarEvent[]>(MOCK_GOOGLE_CALENDAR_EVENTS);

  // Filters
  const [filters, setFilters] = useState<CalendarFilterState>(INITIAL_FILTERS);

  // Drag & Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Quick Create Modal & Drawer state
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Time navigation
  const goToday = useCallback(() => {
    setCurrentDate(new Date(2026, 8, 25)); // Set to Sept 25, 2026
    showToast("Đã quay về Ngày hôm nay (25/09/2026)", "info");
  }, [showToast]);

  const goPrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() - 1);
      else if (viewMode === "week") d.setDate(d.getDate() - 7);
      else if (viewMode === "day") d.setDate(d.getDate() - 1);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewMode]);

  const goNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() + 1);
      else if (viewMode === "week") d.setDate(d.getDate() + 7);
      else if (viewMode === "day") d.setDate(d.getDate() + 1);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewMode]);

  // Keyboard Navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        goToday();
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        setViewMode("month");
      } else if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        setViewMode("week");
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        setViewMode("day");
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        setViewMode("agenda");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, goToday]);

  // Toggle Fast Task Completion
  const toggleTaskComplete = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          showToast(
            nextState ? `🎉 Hoàn thành công việc: "${t.title}"` : `Khôi phục công việc: "${t.title}"`,
            nextState ? "success" : "info"
          );
          return {
            ...t,
            completed: nextState,
            status: nextState ? "DONE" : "IN_PROGRESS",
            checklistCompleted: nextState ? t.checklistTotal || 0 : t.checklistCompleted,
          };
        }
        return t;
      })
    );
  }, [showToast]);

  // Drag & Drop Drop Task On Target Date
  const handleDropTaskOnDate = useCallback((targetDateStr: string) => {
    if (!draggedTaskId) return;

    // Check if task came from Unscheduled Pool
    const unschedIndex = unscheduledTasks.findIndex((u) => u.id === draggedTaskId);
    if (unschedIndex !== -1) {
      const unschedItem = unscheduledTasks[unschedIndex];
      const newTask: CalendarTask = {
        id: unschedItem.id,
        workspaceId: "ws-1",
        projectId: "proj-101",
        projectName: unschedItem.projectName,
        code: unschedItem.code,
        title: unschedItem.title,
        priority: unschedItem.priority,
        status: "TODO",
        startDate: targetDateStr,
        endDate: targetDateStr,
        dueAt: targetDateStr,
        completed: false,
        assigneeName: "Hoàng Mạnh Trường",
        assigneeAvatar: "H",
        colorTone: "emerald",
      };

      setUnscheduledTasks((prev) => prev.filter((u) => u.id !== draggedTaskId));
      setTasks((prev) => [...prev, newTask]);
      showToast(`Đã xếp lịch "${unschedItem.title}" vào ngày ${targetDateStr}!`, "success");
      setDraggedTaskId(null);
      return;
    }

    // Task came from Calendar grid (Reschedule)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === draggedTaskId) {
          showToast(`Đã chuyển hạn chót "${t.title}" sang ngày ${targetDateStr}!`, "success");
          return {
            ...t,
            dueAt: targetDateStr,
            startDate: targetDateStr,
            endDate: targetDateStr,
          };
        }
        return t;
      })
    );
    setDraggedTaskId(null);
  }, [draggedTaskId, unscheduledTasks, showToast]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!filters.showCompleted && t.completed) return false;
      if (filters.projectId !== "all" && t.projectId !== filters.projectId) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, filters]);

  // Reset Filters
  const resetFilters = () => setFilters(INITIAL_FILTERS);

  return {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    tasks: filteredTasks,
    rawTasks: tasks,
    unscheduledTasks,
    googleEvents,
    filters,
    setFilters,
    resetFilters,
    // Navigation
    goToday,
    goPrev,
    goNext,
    // Drag & drop
    draggedTaskId,
    setDraggedTaskId,
    handleDropTaskOnDate,
    // Fast complete
    toggleTaskComplete,
    // Modals & Drawer
    selectedDateForCreate,
    setSelectedDateForCreate,
    selectedTaskId,
    setSelectedTaskId,
    // Toast
    toast,
  };
}
