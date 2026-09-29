"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Project, ViewMode, KpiStats, ProjectStatus } from "./types";
import { MOCK_PROJECTS } from "./constants";

export function useProjectManagement(initialProjects?: Project[]) {
  // Master projects dataset
  const [projects, setProjects] = useState<Project[]>(initialProjects || MOCK_PROJECTS);
  const [loading] = useState(false);

  // Search input & 300ms debounce
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Filters & Sort
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "progress">("newest");

  // View Mode state (persisted to localStorage)
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("taskflow_project_view") as ViewMode;
      if (saved === "grid" || saved === "list") {
        window.setTimeout(() => setViewModeState(saved), 0);
      }
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("taskflow_project_view", mode);
    }
  };

  // Collapsible KPI Header state
  const [isKpiExpanded, setIsKpiExpanded] = useState(true);
  const toggleKpiExpanded = () => setIsKpiExpanded((prev) => !prev);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Modals state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Optimistic UI Favorite toggle
  const toggleFavorite = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newFavState = !p.isFavorite;
          showToast(
            newFavState ? `Đã ghim "${p.name}" vào danh sách Yêu thích` : `Đã bỏ ghim "${p.name}" khỏi Yêu thích`,
            "info"
          );
          return { ...p, isFavorite: newFavState };
        }
        return p;
      })
    );
  }, [showToast]);

  // Copy Project Link
  const copyProjectLink = useCallback((project: Project) => {
    const url = `${window.location.origin}/app/projects/${project.id}/board`;
    navigator.clipboard.writeText(url);
    showToast(`Đã sao chép liên kết dự án "${project.name}"!`, "success");
  }, [showToast]);

  // Archive / Restore project
  const toggleArchive = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isArchiving = !p.archivedAt;
          const updatedStatus: ProjectStatus = isArchiving ? "ARCHIVED" : "ACTIVE";
          showToast(
            isArchiving ? `Đã lưu trữ dự án "${p.name}"` : `Đã khôi phục dự án "${p.name}"`,
            "info"
          );
          return {
            ...p,
            status: updatedStatus,
            archivedAt: isArchiving ? new Date().toISOString() : null,
          };
        }
        return p;
      })
    );
  }, [showToast]);

  // Save Edit Project
  const handleSaveEdit = (id: string, updatedFields: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields, updatedAt: "Vừa xong" } : p))
    );
    setEditingProject(null);
    showToast("Cập nhật thông tin dự án thành công!", "success");
  };

  // Confirm Delete Project
  const handleConfirmDelete = (id: string) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeletingProject(null);
    if (target) {
      showToast(`Đã xóa dự án "${target.name}"`, "error");
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setInputQuery("");
    setDebouncedQuery("");
    setStatusFilter("all");
    setOwnerFilter("all");
    setSortBy("newest");
  };

  // Computed Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    let list = [...projects];

    // 1. Search Query (Title, Description, Code)
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    // 3. Owner Filter
    if (ownerFilter !== "all") {
      list = list.filter((p) => p.members.some((m) => m.id === ownerFilter));
    }

    // 4. Sort Strategy (Starred/Favorites ALWAYS pinned on top!)
    list.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "vi");
      } else if (sortBy === "progress") {
        return b.progress - a.progress;
      } else {
        // newest (by id / date)
        return b.id.localeCompare(a.id);
      }
    });

    return list;
  }, [projects, debouncedQuery, statusFilter, ownerFilter, sortBy]);

  // Compute KPI Summary Stats
  const kpiStats: KpiStats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
    const totalProgress = projects.reduce((acc, p) => acc + p.progress, 0);
    const completionRate = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;
    const overdueTasks = projects.reduce((acc, p) => acc + p.overdueTaskCount, 0);

    return {
      totalProjects,
      activeProjects,
      completionRate,
      overdueTasks,
    };
  }, [projects]);

  const hasActiveFilters =
    Boolean(debouncedQuery.trim()) || statusFilter !== "all" || ownerFilter !== "all";

  return {
    projects: filteredProjects,
    rawProjects: projects,
    loading,
    kpiStats,
    // Search
    inputQuery,
    setInputQuery,
    clearSearch: () => setInputQuery(""),
    // Filters & Sort
    statusFilter,
    setStatusFilter,
    ownerFilter,
    setOwnerFilter,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    // View mode
    viewMode,
    setViewMode,
    // KPI Expand
    isKpiExpanded,
    toggleKpiExpanded,
    // Toast
    toast,
    // Actions
    toggleFavorite,
    copyProjectLink,
    toggleArchive,
    // Modals
    editingProject,
    setEditingProject,
    handleSaveEdit,
    deletingProject,
    setDeletingProject,
    handleConfirmDelete,
  };
}
