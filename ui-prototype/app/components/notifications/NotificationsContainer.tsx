 
"use client";

import { Bell, Sparkles, RefreshCw } from "lucide-react";
import { useWorkspace } from "../providers/workspace-provider";
import { useNotifications } from "./useNotifications";
import { NotificationToolbar } from "./NotificationToolbar";
import { NotificationCard } from "./NotificationCard";
import { NotificationSettingsModal } from "./NotificationSettingsModal";
import { TaskDetailDrawer } from "../tasks/TaskDetailDrawer";
import { Toast } from "../projects/Toast";

export function NotificationsContainer() {
  const workspace = useWorkspace();
  const {
    groupedTimeline,
    unreadCount,
    categoryCounts,
    // Filters
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    clearSearch,
    // Actions
    toggleReadStatus,
    markAllAsRead,
    deleteNotification,
    sendQuickReply,
    handleSelectNotification,
    // Settings & Sound
    settings,
    setSettings,
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    soundEnabled,
    toggleSound,
    // Drawer
    selectedTaskId,
    closeDrawer,
    // Toast
    toast,
  } = useNotifications();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ── 1. PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Workspace: {workspace.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              Thông báo
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-zinc-950 shadow-md animate-pulse">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Cập nhật các hoạt động @mention, phân công công việc và cảnh báo hạn chót.
          </p>
        </div>
      </div>

      {/* ── 2. CONTROL TOOLBAR & FILTERS ── */}
      <NotificationToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={categoryCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        onMarkAllAsRead={markAllAsRead}
        onOpenSettings={openSettingsModal}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* ── 3. INTERACTIVE NOTIFICATION FEED (GROUPED BY TIMELINE) ── */}
      {groupedTimeline.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40 my-4 space-y-5">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Sparkles className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">
              {searchQuery.trim() || activeTab !== "all"
                ? "Không tìm thấy thông báo phù hợp"
                : "Bạn đã cập nhật tất cả thông báo! ☕"}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {searchQuery.trim() || activeTab !== "all"
                ? "Không có thông báo nào khớp với từ khóa tìm kiếm hoặc tab đang chọn."
                : "Không có việc gì mới cần xử lý thêm. Hãy nghỉ ngơi một chút nhé!"}
            </p>
          </div>

          {(searchQuery.trim() || activeTab !== "all") && (
            <button
              onClick={() => {
                clearSearch();
                setActiveTab("all");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xem tất cả thông báo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTimeline.map((group) => (
            <div key={group.groupKey} className="space-y-3">
              {/* Group Timeline Title */}
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 border-b border-zinc-850 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{group.groupTitle}</span>
                <span className="text-zinc-600 font-normal">({group.items.length})</span>
              </div>

              {/* Group Items */}
              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onToggleRead={toggleReadStatus}
                    onDelete={deleteNotification}
                    onSelect={handleSelectNotification}
                    onSendReply={sendQuickReply}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. QUICK TASK DETAIL DRAWER SLIDE-OVER ── */}
      {selectedTaskId && (
        <TaskDetailDrawer
          workspaceId={workspace.id}
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={closeDrawer}
        />
      )}

      {/* ── 5. NOTIFICATION PREFERENCES MODAL ── */}
      <NotificationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* ── 6. TOAST FEEDBACK ── */}
      <Toast toast={toast} />
    </div>
  );
}
