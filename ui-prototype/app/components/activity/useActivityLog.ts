"use client";

import { useState, useMemo, useCallback } from "react";
import { ActivityLogItem, ActivityFilterState } from "./types";
import { MOCK_ACTIVITY_LOGS } from "./constants";

const INITIAL_FILTERS: ActivityFilterState = {
  searchQuery: "",
  actorName: "all",
  actionType: "all",
  projectId: "all",
  dateRange: "all",
};

export function useActivityLog(initialLogs?: ActivityLogItem[]) {
  const [logs] = useState<ActivityLogItem[]>(initialLogs || MOCK_ACTIVITY_LOGS);

  // Filters state
  const [filters, setFilters] = useState<ActivityFilterState>(INITIAL_FILTERS);

  // Selected Task for Slide-over Drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search query (actor, target title, code, project name)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchActor = log.actorName.toLowerCase().includes(q);
        const matchTitle = log.targetTitle.toLowerCase().includes(q);
        const matchCode = log.targetCode?.toLowerCase().includes(q);
        const matchProject = log.projectName?.toLowerCase().includes(q);
        if (!matchActor && !matchTitle && !matchCode && !matchProject) return false;
      }

      // 2. Member/Actor Filter
      if (filters.actorName !== "all" && log.actorName !== filters.actorName) {
        return false;
      }

      // 3. Action Type Filter
      if (filters.actionType !== "all" && log.actionType !== filters.actionType) {
        return false;
      }

      // 4. Scope/Project Filter
      if (filters.projectId !== "all" && log.projectName !== filters.projectId) {
        return false;
      }

      return true;
    });
  }, [logs, filters]);

  // Grouped Timeline Engine ("Hôm nay", "Hôm qua", "Tuần này", "Cũ hơn")
  const groupedTimeline = useMemo(() => {
    const groups: { groupKey: string; groupTitle: string; items: ActivityLogItem[] }[] = [
      { groupKey: "today", groupTitle: "Hôm nay", items: [] },
      { groupKey: "yesterday", groupTitle: "Hôm qua", items: [] },
      { groupKey: "this_week", groupTitle: "Tuần này", items: [] },
      { groupKey: "older", groupTitle: "Cũ hơn", items: [] },
    ];

    filteredLogs.forEach((log) => {
      const g = groups.find((group) => group.groupKey === log.timeGroup);
      if (g) {
        g.items.push(log);
      } else {
        groups[3].items.push(log);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredLogs]);

  // Reset Filters
  const resetFilters = () => setFilters(INITIAL_FILTERS);

  // Export CSV Generator
  const exportCSV = useCallback(() => {
    const header = "ID,Thời gian,Thành viên,Hành động,Đối tượng,Dự án,Thay đổi";
    const rows = filteredLogs.map((log) => {
      const diffStr = log.diff
        ? `"${log.diff.fieldName}: ${log.diff.oldValue} -> ${log.diff.newValue}"`
        : "";
      return `"${log.id}","${log.createdAt}","${log.actorName}","${log.actionCode}","${log.targetTitle}","${log.projectName || ""}","${diffStr}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taskflow-activity-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Đã xuất ${filteredLogs.length} nhật ký kiểm toán thành công!`, "success");
  }, [filteredLogs, showToast]);

  const hasActiveFilters =
    Boolean(filters.searchQuery.trim()) ||
    filters.actorName !== "all" ||
    filters.actionType !== "all" ||
    filters.projectId !== "all" ||
    filters.dateRange !== "all";

  return {
    logs: filteredLogs,
    rawLogs: logs,
    groupedTimeline,
    totalCount: filteredLogs.length,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    exportCSV,
    // Drawer
    selectedTaskId,
    setSelectedTaskId,
    closeDrawer: () => setSelectedTaskId(null),
    // Toast
    toast,
  };
}
