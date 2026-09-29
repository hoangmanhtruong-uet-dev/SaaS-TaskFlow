 
"use client";

import { Plus, CheckSquare, Sparkles, RefreshCw } from "lucide-react";
import { useWorkspace } from "../providers/workspace-provider";
import { useMyTasks } from "./useMyTasks";
import { MyTasksKpiHeader } from "./MyTasksKpiHeader";
import { MyTasksSmartTabs } from "./MyTasksSmartTabs";
import { MyTasksToolbar } from "./MyTasksToolbar";
import { MyTasksListTable } from "./MyTasksListTable";
import { MyTasksBoardView } from "./MyTasksBoardView";
import { MyTasksCalendarView } from "./MyTasksCalendarView";
import { TaskDetailDrawer } from "../tasks/TaskDetailDrawer";
import { QuickCreateTaskModal } from "../tasks/QuickCreateTaskModal";
import { Toast } from "../projects/Toast";
import { useApiResource } from "@/app/hooks/use-api-resource";
import { taskService } from "@/app/services/task-service";
import { ErrorState, ListSkeleton } from "../ui";
import { useMemo } from "react";
import { MyTask } from "./types";

export function MyTasksDashboardContainer() {
  const workspace = useWorkspace();
  
  const resource = useApiResource(async () => {
    return await taskService.list(workspace.id);
  }, `my-tasks:${workspace.id}`);

  const transformedTasks = useMemo(() => {
    if (!resource.data) return undefined;
    return resource.data.map(t => {
      const colName = (t.columnName || "").toLowerCase();
      const isDone = colName.includes("hoàn thành") || colName.includes("done");
      const isProgress = colName.includes("đang làm") || colName.includes("progress") || colName.includes("thực hiện");
      const isReview = colName.includes("đánh giá") || colName.includes("review") || colName.includes("kiểm thử");
      
      const task: MyTask = {
        id: t.id,
        workspaceId: t.workspaceId,
        projectId: t.projectId,
        projectName: t.projectName || "Dự án chung",
        boardId: t.boardId,
        columnId: t.columnId,
        columnName: t.columnName || "Cần làm",
        code: `TASK-${t.id.slice(0, 4).toUpperCase()}`,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: isDone ? "DONE" : isProgress ? "IN_PROGRESS" : isReview ? "REVIEW" : "TODO",
        dueAt: t.dueAt ? t.dueAt.split("T")[0] : null,
        assigneeName: "Tôi",
        assigneeAvatar: "T",
        tags: t.projectName ? [t.projectName] : [],
        checklistTotal: t.checklistTotal || 0,
        checklistCompleted: t.checklistCompleted || 0,
        attachmentCount: 0,
        commentCount: 0,
        completed: isDone,
        updatedAt: t.archivedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      return task;
    });
  }, [resource.data]);

  const {
    tasks,
    groupedSections,
    kpiStats,
    tabCounts,
    // Search
    inputQuery,
    setInputQuery,
    clearSearch,
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
    toggleKpiExpanded,
    // Fast Complete Task
    toggleTaskComplete,
    // Drawer Detail
    selectedTaskId,
    setSelectedTaskId,
    closeDrawer,
    // Quick Create Modal
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    // Toast
    toast,
  } = useMyTasks(transformedTasks);

  if (resource.loading && !resource.data) {
    return <div className="space-y-6 max-w-7xl mx-auto pb-16 pt-8"><ListSkeleton rows={5} /></div>;
  }
  if (resource.error) {
    return <div className="space-y-6 max-w-7xl mx-auto pb-16 pt-8"><ErrorState retry={resource.reload} /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Workspace: {workspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-1">
            Việc của tôi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Danh sách công việc cá nhân được phân công, cần hoàn thành trong workspace.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5 group"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo công việc</span>
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-700/80 text-[10px] font-mono text-emerald-100 select-none ml-1">
              <span>C</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 2. COLLAPSIBLE KPI HEADER ── */}
      <MyTasksKpiHeader
        stats={kpiStats}
        isExpanded={isKpiExpanded}
        onToggleExpand={toggleKpiExpanded}
      />

      {/* ── 3. SMART TABS BAR ── */}
      <MyTasksSmartTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
      />

      {/* ── 4. TOOLBAR BAR ── */}
      <MyTasksToolbar
        searchQuery={inputQuery}
        onSearchChange={setInputQuery}
        onClearSearch={clearSearch}
        projectIdFilter={projectIdFilter}
        onProjectFilterChange={setProjectIdFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── 5. MAIN TASK CONTENT (List, Board, Calendar) ── */}
      {tasks.length === 0 ? (
        /* Empty State / Onboarding */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40 my-4 space-y-5">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Sparkles className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">
              {hasActiveFilters ? "Không tìm thấy công việc nào" : "Bạn đã hoàn thành hết công việc! 🚀"}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {hasActiveFilters ? (
                <>
                  Không có công việc phù hợp với từ khóa &quot;
                  <span className="text-emerald-400 font-semibold">{inputQuery}</span>&quot; hoặc các bộ lọc đang chọn.
                </>
              ) : (
                "Hiện tại không có công việc tồn đọng. Hãy nghỉ ngơi hoặc tạo công việc mới cho dự án tiếp theo!"
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Xóa tất cả bộ lọc</span>
              </button>
            )}

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo công việc mới ngay</span>
            </button>
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* List View (Table with grouping) */
        <MyTasksListTable
          groupedSections={groupedSections}
          onToggleComplete={toggleTaskComplete}
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      ) : viewMode === "board" ? (
        /* Kanban Board View */
        <MyTasksBoardView
          tasks={tasks}
          onToggleComplete={toggleTaskComplete}
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      ) : (
        /* Calendar Monthly View */
        <MyTasksCalendarView
          tasks={tasks}
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      )}

      {/* ── 6. QUICK SLIDE-OVER DETAIL DRAWER ── */}
      {selectedTaskId && (
        <TaskDetailDrawer
          workspaceId={workspace.id}
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={closeDrawer}
        />
      )}

      {/* ── 7. QUICK CREATE TASK MODAL ── */}
      <QuickCreateTaskModal
        workspaceId={workspace.id}
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onTaskCreated={() => {}}
      />

      {/* ── 8. TOAST NOTIFICATION ── */}
      <Toast toast={toast} />
    </div>
  );
}
