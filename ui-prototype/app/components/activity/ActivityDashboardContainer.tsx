 
"use client";

import React from "react";
import {
  Calendar,
  Inbox,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useWorkspace } from "../providers/workspace-provider";
import { useActivityLog } from "./useActivityLog";
import { ActivityToolbar } from "./ActivityToolbar";
import { ActivityCard } from "./ActivityCard";
import { TaskDetailDrawer } from "../tasks/TaskDetailDrawer";

export const ActivityDashboardContainer: React.FC = () => {
  const workspace = useWorkspace();
  const {
    groupedTimeline,
    totalCount,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    exportCSV,
    selectedTaskId,
    setSelectedTaskId,
    closeDrawer,
    toast,
  } = useActivityLog();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Filter Controls Toolbar */}
        <ActivityToolbar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          totalCount={totalCount}
          onExportCSV={exportCSV}
        />

        {/* Grouped Timeline Feed */}
        {groupedTimeline.length > 0 ? (
          <div className="space-y-8">
            {groupedTimeline.map((group) => (
              <div key={group.groupKey} className="space-y-4">
                {/* Timeline Group Header */}
                <div className="sticky top-16 z-10 bg-zinc-950/90 backdrop-blur-md py-2 border-b border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                      {group.groupTitle}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {group.items.length} nhật ký
                    </span>
                  </div>
                </div>

                {/* Timeline Cards Stream */}
                <div className="pt-2 pl-2 sm:pl-4">
                  {group.items.map((item, idx) => (
                    <ActivityCard
                      key={item.id}
                      item={item}
                      onSelectTask={setSelectedTaskId}
                      isLastInGroup={idx === group.items.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Infinite Scroll / Bottom Indicator */}
            <div className="py-8 text-center border-t border-zinc-800/60">
              <div className="inline-flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã hiển thị toàn bộ {totalCount} nhật ký kiểm toán phù hợp</span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center my-8">
            <div className="w-16 h-16 rounded-full bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <Inbox className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-1">
              Không tìm thấy nhật ký hoạt động phù hợp
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              Không có bản ghi nào tương ứng với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bỏ bộ lọc và xem tất cả</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Slide-over Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          workspaceId={workspace.id}
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
};
