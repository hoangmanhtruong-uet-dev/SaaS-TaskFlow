"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MyTask, SmartTab, GroupOption, ViewMode, KpiStats, TaskStatus } from "./types";
import { MOCK_MY_TASKS } from "./constants";

export function useMyTasks(initialTasks?: MyTask[]) {
  const [tasks, setTasks] = useState<MyTask[]>(initialTasks || MOCK_MY_TASKS);

  useEffect(() => {
    if (initialTasks) setTasks(initialTasks);
  }, [initialTasks]);

  // Search input & 300ms debounce
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Filters & Smart Tab state
  const [activeTab, setActiveTab] = useState<SmartTab>("all");
  const [projectIdFilter, setProjectIdFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<GroupOption>("none");

  // View Mode state (persisted to localStorage)
  const [viewMode, setViewModeState] = useState<ViewMode>("list");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("taskflow_mytasks_view") as ViewMode;
      if (saved === "list" || saved === "board" || saved === "calendar") {
        window.setTimeout(() => setViewModeState(saved), 0);
      }
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("taskflow_mytasks_view", mode);
    }
  };

  // KPI Header collapse state
  const [isKpiExpanded, setIsKpiExpanded] = useState(true);

  // Selected Task ID for Drawer detail
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Quick Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Global 'C' shortcut key listener to trigger Quick Create Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fast Complete Task (Optimistic UI)
  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          const nextStatus: TaskStatus = nextCompleted ? "DONE" : "IN_PROGRESS";

          showToast(
            nextCompleted
              ? `🎉 Hoàn thành xuất sắc: "${t.title}"!`
              : `Đã đánh dấu cần làm: "${t.title}"`,
            nextCompleted ? "success" : "info"
          );

          return {
            ...t,
            completed: nextCompleted,
            status: nextStatus,
            columnId: nextCompleted ? "done" : "in_progress",
            columnName: nextCompleted ? "Hoàn thành" : "Đang thực hiện",
            checklistCompleted: nextCompleted ? t.checklistTotal || 0 : t.checklistCompleted,
            updatedAt: "Vừa xong",
          };
        }
        return t;
      })
    );
  }, [showToast]);

  // Reset Filters
  const resetFilters = () => {
    setInputQuery("");
    setDebouncedQuery("");
    setActiveTab("all");
    setProjectIdFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setGroupBy("none");
  };

  // Helper date parsing
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Smart Tab Badges Count Engine
  const tabCounts = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter((t) => !t.completed && t.dueAt === todayStr).length,
      upcoming: tasks.filter((t) => !t.completed && t.dueAt && t.dueAt > todayStr).length,
      overdue: tasks.filter((t) => !t.completed && t.dueAt && t.dueAt < todayStr).length,
      completed: tasks.filter((t) => t.completed).length,
    };
  }, [tasks, todayStr]);

  // Filtered Task Dataset
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchCode = task.code.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchProject = task.projectName.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDesc && !matchProject) return false;
      }

      // 2. Smart Tab filter
      if (activeTab === "today") {
        if (task.completed || task.dueAt !== todayStr) return false;
      } else if (activeTab === "upcoming") {
        if (task.completed || !task.dueAt || task.dueAt <= todayStr) return false;
      } else if (activeTab === "overdue") {
        if (task.completed || !task.dueAt || task.dueAt >= todayStr) return false;
      } else if (activeTab === "completed") {
        if (!task.completed) return false;
      }

      // 3. Project Filter
      if (projectIdFilter !== "all" && task.projectId !== projectIdFilter) {
        return false;
      }

      // 4. Priority Filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      // 5. Status Filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, debouncedQuery, activeTab, projectIdFilter, priorityFilter, statusFilter, todayStr]);

  // Grouped Tasks Engine
  const groupedTaskSections = useMemo(() => {
    if (groupBy === "none") {
      return [{ groupKey: "default", groupTitle: "Tất cả công việc", tasks: filteredTasks }];
    }

    const groupsMap = new Map<string, { title: string; tasks: MyTask[] }>();

    filteredTasks.forEach((task) => {
      let key = "Khác";
      let title = "Khác";

      if (groupBy === "project") {
        key = task.projectId;
        title = task.projectName;
      } else if (groupBy === "dueDate") {
        if (!task.dueAt) {
          key = "no_date";
          title = "Không có hạn hoàn thành";
        } else if (task.dueAt === todayStr) {
          key = "today";
          title = "Hạn hôm nay";
        } else if (task.dueAt < todayStr) {
          key = "overdue";
          title = "Đã quá hạn";
        } else {
          key = "upcoming";
          title = "Sắp tới";
        }
      } else if (groupBy === "status") {
        key = task.status;
        title =
          task.status === "DONE"
            ? "Hoàn thành"
            : task.status === "IN_PROGRESS"
            ? "Đang thực hiện"
            : task.status === "REVIEW"
            ? "Đang kiểm thử"
            : "Cần làm";
      }

      if (!groupsMap.has(key)) {
        groupsMap.set(key, { title, tasks: [] });
      }
      groupsMap.get(key)!.tasks.push(task);
    });

    return Array.from(groupsMap.entries()).map(([groupKey, value]) => ({
      groupKey,
      groupTitle: value.title,
      tasks: value.tasks,
    }));
  }, [filteredTasks, groupBy, todayStr]);

  // KPI Summary Engine
  const kpiStats: KpiStats = useMemo(() => {
    const dueToday = tasks.filter((t) => !t.completed && t.dueAt === todayStr).length;
    const overdue = tasks.filter((t) => !t.completed && t.dueAt && t.dueAt < todayStr).length;
    const inProgress = tasks.filter((t) => !t.completed && t.status === "IN_PROGRESS").length;
    const completedThisWeek = tasks.filter((t) => t.completed).length;

    return {
      dueToday,
      overdue,
      inProgress,
      completedThisWeek,
    };
  }, [tasks, todayStr]);

  const hasActiveFilters =
    Boolean(debouncedQuery.trim()) ||
    activeTab !== "all" ||
    projectIdFilter !== "all" ||
    priorityFilter !== "all" ||
    statusFilter !== "all";

  return {
    tasks: filteredTasks,
    groupedSections: groupedTaskSections,
    rawTasks: tasks,
    kpiStats,
    tabCounts,
    // Search
    inputQuery,
    setInputQuery,
    clearSearch: () => setInputQuery(""),
    // Filters & Tabs
    activeTab,
    setActiveTab,
    projectIdFilter,
    setProjectIdFilter,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    groupBy,
    setGroupBy,
    resetFilters,
    hasActiveFilters,
    // View mode
    viewMode,
    setViewMode,
    // KPI Header Collapse
    isKpiExpanded,
    toggleKpiExpanded: () => setIsKpiExpanded((prev) => !prev),
    // Fast Complete Task
    toggleTaskComplete,
    // Drawer Detail
    selectedTaskId,
    setSelectedTaskId,
    closeDrawer: () => setSelectedTaskId(null),
    // Quick Create Modal
    isCreateModalOpen,
    setIsCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    // Toast
    toast,
  };
}
