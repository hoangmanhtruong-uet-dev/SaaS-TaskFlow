"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { SearchBar } from "./SearchBar";
import { SearchCategoryTabs, SearchCategory, CategoryCounts } from "./SearchCategoryTabs";
import { SearchFilters, FilterState } from "./SearchFilters";
import { SearchHistory } from "./SearchHistory";
import { ResultList } from "./ResultList";
import { SearchResultItem } from "./ResultCard";
import { useWorkspace } from "../providers/workspace-provider";
import { taskService } from "@/app/services/task-service";
import { TaskDetailDrawer } from "../tasks/TaskDetailDrawer";
import type { TaskSummary } from "@/app/types/domain";
import { projectService } from "@/app/services/project-service";
import { collaborationService } from "@/app/services/collaboration-service";



const INITIAL_FILTERS: FilterState = {
  status: "all",
  priority: "all",
  assigneeId: "all",
  dateRange: "all",
};

type SearchTask = TaskSummary & {
  code?: string;
  projectTitle?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  tags?: string[];
  updatedAt?: string;
};

// No mock data

export function SearchPageContainer() {
  const workspace = useWorkspace();
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchCategory>("all");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Auth",
    "Bug CORS",
    "UI/UX Design",
    "Security",
  ]);

  // Task Drawer detail preview
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Real workspace tasks & members integration
  const [workspaceItems, setWorkspaceItems] = useState<SearchResultItem[]>([]);

  // Load real workspace items
  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        const [tasks, projects, members] = await Promise.all([
          taskService.list(workspace.id).catch(() => []),
          projectService.list(workspace.id).catch(() => []),
          collaborationService.members(workspace.id).catch(() => []),
        ]);

        const mappedTasks: SearchResultItem[] = tasks.map((task) => {
          const t = task as SearchTask;
          const status = t.columnName?.toUpperCase().includes("DONE")
            ? "DONE"
            : t.columnName?.toUpperCase().includes("PROGRESS")
            ? "IN_PROGRESS"
            : t.columnName?.toUpperCase().includes("REVIEW")
            ? "REVIEW"
            : "TODO";

          return {
          id: t.id,
          type: "task",
          code: t.code || `TASK-${t.id.slice(0, 4).toUpperCase()}`,
          title: t.title,
          snippet: t.description || undefined,
          projectTitle: t.projectName || workspace.name,
          status,
          priority: t.priority === "URGENT" ? "HIGH" : t.priority,
          assigneeName: "Thành viên",
          assigneeAvatar: "T",
          tags: t.projectName ? [t.projectName] : [],
          updatedAt: new Date(t.archivedAt || Date.now()).toLocaleDateString("vi-VN"),
          };
        });

        const mappedProjects: SearchResultItem[] = projects.map((p) => ({
          id: p.id,
          type: "project",
          title: p.name,
          snippet: p.description || "",
          statusLabel: `Đang hoạt động · ${p.taskCount} công việc`,
          href: `/app/projects/${p.id}/board`,
        }));

        const mappedMembers: SearchResultItem[] = members.map((m) => ({
          id: m.id,
          type: "member",
          title: m.name,
          memberEmail: m.email,
          memberRole: m.role,
          assigneeAvatar: m.name ? m.name.charAt(0).toUpperCase() : "M",
          memberTaskCount: 0,
        }));

        setWorkspaceItems([...mappedTasks, ...mappedProjects, ...mappedMembers]);
      } catch (err) {
        console.error("Error loading search workspace data:", err);
      }
    }
    loadWorkspaceData();
  }, [workspace.id, workspace.name]);

  // Combined dataset
  const allItems = useMemo(() => {
    return workspaceItems;
  }, [workspaceItems]);

  // Debounce input search query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  const isLoading = inputQuery !== debouncedQuery;

  // Save query to recent searches
  const handleExecuteSearch = useCallback((queryToSave?: string) => {
    const q = (queryToSave !== undefined ? queryToSave : inputQuery).trim();
    if (!q) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== q.toLowerCase());
      return [q, ...filtered].slice(0, 8); // Keep top 8
    });
  }, [inputQuery]);

  // Filter handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSelectQueryFromHistory = (q: string) => {
    setInputQuery(q);
    handleExecuteSearch(q);
  };

  const handleRemoveHistoryItem = (q: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== q));
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  // Filtered dataset logic
  const filteredResults = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    return allItems.filter((item) => {
      // 1. Tab category filter
      if (activeTab === "tasks" && item.type !== "task") return false;
      if (activeTab === "projects" && item.type !== "project") return false;
      if (activeTab === "docs" && item.type !== "doc") return false;
      if (activeTab === "members" && item.type !== "member") return false;

      // 2. Text Keyword matching (title, snippet, code, projectTitle, tags)
      const matchesTitle = item.title?.toLowerCase().includes(q);
      const matchesSnippet = item.snippet?.toLowerCase().includes(q);
      const matchesCode = item.code?.toLowerCase().includes(q);
      const matchesProject = item.projectTitle?.toLowerCase().includes(q);
      const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesText = matchesTitle || matchesSnippet || matchesCode || matchesProject || matchesTags;
      if (!matchesText) return false;

      // 3. Status Filter (Only applies if item is a task)
      if (filters.status !== "all" && item.type === "task") {
        if (item.status !== filters.status) return false;
      }

      // 4. Priority Filter (Only applies if item is a task)
      if (filters.priority !== "all" && item.type === "task") {
        if (item.priority !== filters.priority) return false;
      }

      return true;
    });
  }, [allItems, debouncedQuery, activeTab, filters]);

  // Compute category counts for tabs
  const categoryCounts: CategoryCounts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return { all: 0, tasks: 0, projects: 0, docs: 0, members: 0 };

    const matchingAll = allItems.filter((item) => {
      const matchesTitle = item.title?.toLowerCase().includes(q);
      const matchesSnippet = item.snippet?.toLowerCase().includes(q);
      const matchesCode = item.code?.toLowerCase().includes(q);
      const matchesProject = item.projectTitle?.toLowerCase().includes(q);
      const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchesTitle || matchesSnippet || matchesCode || matchesProject || matchesTags;
    });

    return {
      all: matchingAll.length,
      tasks: matchingAll.filter((i) => i.type === "task").length,
      projects: matchingAll.filter((i) => i.type === "project").length,
      docs: matchingAll.filter((i) => i.type === "doc").length,
      members: matchingAll.filter((i) => i.type === "member").length,
    };
  }, [allItems, debouncedQuery]);

  const hasActiveFilters = Object.values(filters).some((val) => val !== "all");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Search Header Section */}
      <div className="space-y-4">
        <SearchBar
          value={inputQuery}
          onChange={setInputQuery}
          onSubmit={() => handleExecuteSearch()}
          onClear={() => setInputQuery("")}
          isLoading={isLoading}
        />

        {/* Category Tabs */}
        {debouncedQuery.trim() !== "" && (
          <SearchCategoryTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={categoryCounts}
          />
        )}

        {/* Advanced Filters */}
        {debouncedQuery.trim() !== "" && (
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        )}
      </div>

      {/* Main Content Area: History vs Results */}
      {debouncedQuery.trim() === "" ? (
        <SearchHistory
          history={recentSearches}
          onSelectQuery={handleSelectQueryFromHistory}
          onRemoveItem={handleRemoveHistoryItem}
          onClearAll={handleClearHistory}
        />
      ) : (
        <ResultList
          results={filteredResults}
          query={debouncedQuery}
          isLoading={isLoading}
          onSelectTask={(id) => setSelectedTaskId(id)}
          onResetFilters={handleResetFilters}
          onClearQuery={() => setInputQuery("")}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Slide-over Task Detail Drawer for quick inspection of selected task */}
      {selectedTaskId && (
        <TaskDetailDrawer
          workspaceId={workspace.id}
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

    </div>
  );
}
