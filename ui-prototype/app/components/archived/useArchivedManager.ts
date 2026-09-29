"use client";

import { useState, useMemo, useCallback } from "react";
import { ArchivedItem, ArchiveTab, CategoryCounts } from "./types";
import { MOCK_ARCHIVED_ITEMS } from "./constants";

export function useArchivedManager(initialItems?: ArchivedItem[]) {
  const [items, setItems] = useState<ArchivedItem[]>(initialItems || MOCK_ARCHIVED_ITEMS);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters state
  const [activeTab, setActiveTab] = useState<ArchiveTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [archivedByFilter, setArchivedByFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "30days" | "90days" | "older">("all");

  // Permanent Delete Modal state
  const [deletingItem, setDeletingItem] = useState<ArchivedItem | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Selection Handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Restore Engine
  const restoreItem = useCallback((id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (target) {
      showToast(`Đã khôi phục "${target.title}" quay về danh sách làm việc!`, "success");
    }
  }, [items, showToast]);

  const bulkRestore = useCallback(() => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    showToast(`Đã khôi phục thành công ${count} mục đã chọn!`, "success");
  }, [selectedIds, showToast]);

  // Permanent Delete Engine
  const confirmPermanentDelete = useCallback(() => {
    if (isBulkDeleting) {
      const count = selectedIds.size;
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      setIsBulkDeleting(false);
      showToast(`Đã xóa vĩnh viễn ${count} mục khỏi hệ thống!`, "error");
    } else if (deletingItem) {
      const targetTitle = deletingItem.title;
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingItem.id);
        return next;
      });
      setDeletingItem(null);
      showToast(`Đã xóa vĩnh viễn "${targetTitle}"`, "error");
    }
  }, [isBulkDeleting, deletingItem, selectedIds, showToast]);

  // Category counts
  const categoryCounts: CategoryCounts = useMemo(() => {
    return {
      all: items.length,
      project: items.filter((i) => i.type === "project").length,
      task: items.filter((i) => i.type === "task").length,
      file: items.filter((i) => i.type === "file").length,
    };
  }, [items]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code?.toLowerCase().includes(q);
        const matchPath = item.originalPath.toLowerCase().includes(q);
        const matchUser = item.archivedByName.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchPath && !matchUser) return false;
      }

      // 2. Tab Filter
      if (activeTab !== "all" && item.type !== activeTab) {
        return false;
      }

      // 3. Archived By Filter
      if (archivedByFilter !== "all" && item.archivedByName !== archivedByFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, activeTab, archivedByFilter]);

  // Select All state
  const isAllSelected = useMemo(() => {
    if (filteredItems.length === 0) return false;
    return filteredItems.every((i) => selectedIds.has(i.id));
  }, [filteredItems, selectedIds]);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  }, [isAllSelected, filteredItems]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setArchivedByFilter("all");
    setDateRangeFilter("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    activeTab !== "all" ||
    archivedByFilter !== "all" ||
    dateRangeFilter !== "all";

  return {
    items: filteredItems,
    rawItems: items,
    categoryCounts,
    selectedIds,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    // Filters
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    clearSearch: () => setSearchQuery(""),
    archivedByFilter,
    setArchivedByFilter,
    dateRangeFilter,
    setDateRangeFilter,
    resetFilters,
    hasActiveFilters,
    // Actions
    restoreItem,
    bulkRestore,
    // Delete Modal
    deletingItem,
    setDeletingItem,
    isBulkDeleting,
    openBulkDeleteModal: () => setIsBulkDeleting(true),
    closeDeleteModal: () => {
      setDeletingItem(null);
      setIsBulkDeleting(false);
    },
    confirmPermanentDelete,
    // Toast
    toast,
  };
}
