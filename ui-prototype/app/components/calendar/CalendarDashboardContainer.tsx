"use client";

import { useWorkspace } from "../providers/workspace-provider";
import { useCalendarEngine } from "./useCalendarEngine";
import { CalendarHeaderToolbar } from "./CalendarHeaderToolbar";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarWeekGrid } from "./CalendarWeekGrid";
import { CalendarDayGrid } from "./CalendarDayGrid";
import { CalendarAgendaView } from "./CalendarAgendaView";
import { CalendarSmartSidebar } from "./CalendarSmartSidebar";
import { TaskDetailDrawer } from "../tasks/TaskDetailDrawer";
import { QuickCreateTaskModal } from "../tasks/QuickCreateTaskModal";
import { Toast } from "../projects/Toast";

export function CalendarDashboardContainer() {
  const workspace = useWorkspace();
  const {
    currentDate,
    viewMode,
    setViewMode,
    tasks,
    unscheduledTasks,
    googleEvents,
    filters,
    setFilters,
    // Navigation
    goToday,
    goPrev,
    goNext,
    // Drag & Drop
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
  } = useCalendarEngine();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. HEADER & TOOLBAR BAR ── */}
      <CalendarHeaderToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onGoToday={goToday}
        onGoPrev={goPrev}
        onGoNext={goNext}
        filters={filters}
        onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
      />

      {/* ── 2. MAIN LAYOUT GRID (GRID + SIDEBAR) ── */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* Main Calendar View Area */}
        <div className="flex-1 w-full space-y-4">
          {viewMode === "month" && (
            <CalendarMonthGrid
              currentDate={currentDate}
              tasks={tasks}
              onToggleComplete={toggleTaskComplete}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onCreateTaskOnDate={(dateStr) => setSelectedDateForCreate(dateStr)}
              onDropTaskOnDate={handleDropTaskOnDate}
              setDraggedTaskId={setDraggedTaskId}
            />
          )}

          {viewMode === "week" && (
            <CalendarWeekGrid
              currentDate={currentDate}
              tasks={tasks}
              onToggleComplete={toggleTaskComplete}
              onSelectTask={(id) => setSelectedTaskId(id)}
            />
          )}

          {viewMode === "day" && (
            <CalendarDayGrid
              currentDate={currentDate}
              tasks={tasks}
              onToggleComplete={toggleTaskComplete}
              onSelectTask={(id) => setSelectedTaskId(id)}
            />
          )}

          {viewMode === "agenda" && (
            <CalendarAgendaView
              tasks={tasks}
              onToggleComplete={toggleTaskComplete}
              onSelectTask={(id) => setSelectedTaskId(id)}
            />
          )}
        </div>

        {/* Smart Sidebar */}
        <CalendarSmartSidebar
          tasks={tasks}
          unscheduledTasks={unscheduledTasks}
          googleEvents={googleEvents}
          onSelectTask={(id) => setSelectedTaskId(id)}
          setDraggedTaskId={setDraggedTaskId}
        />
      </div>

      {/* ── 3. QUICK DETAIL DRAWER ── */}
      {selectedTaskId && (
        <TaskDetailDrawer
          workspaceId={workspace.id}
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* ── 4. QUICK CREATE TASK MODAL (PREFILLED DUE DATE) ── */}
      <QuickCreateTaskModal
        workspaceId={workspace.id}
        isOpen={Boolean(selectedDateForCreate)}
        onClose={() => setSelectedDateForCreate(null)}
        onTaskCreated={() => {}}
      />

      {/* ── 5. TOAST FEEDBACK ── */}
      <Toast toast={toast} />
    </div>
  );
}
