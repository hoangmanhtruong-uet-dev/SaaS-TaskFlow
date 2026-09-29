 
"use client";

import { Archive, RefreshCw, CheckSquare, Square } from "lucide-react";
import { useWorkspace } from "../providers/workspace-provider";
import { useArchivedManager } from "./useArchivedManager";
import { ArchivedToolbar } from "./ArchivedToolbar";
import { BulkActionBar } from "./BulkActionBar";
import { ArchivedItemRow } from "./ArchivedItemRow";
import { PermanentDeleteModal } from "./PermanentDeleteModal";
import { Toast } from "../projects/Toast";

export function ArchivedDashboardContainer() {
  const workspace = useWorkspace();
  const {
    items,
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
    clearSearch,
    archivedByFilter,
    setArchivedByFilter,
    resetFilters,
    hasActiveFilters,
    // Actions
    restoreItem,
    bulkRestore,
    // Modals
    deletingItem,
    setDeletingItem,
    isBulkDeleting,
    openBulkDeleteModal,
    closeDeleteModal,
    confirmPermanentDelete,
    // Toast
    toast,
  } = useArchivedManager();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Archive className="w-4 h-4" />
            <span>Workspace: {workspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-1">
            Kho Mục Đã Lưu Trữ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Quản lý các dự án, công việc và tệp tin tạm ẩn khỏi workspace chính.
          </p>
        </div>
      </div>

      {/* ── 2. RETENTION BANNER, SEARCH & CATEGORY TABS ── */}
      <ArchivedToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={categoryCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        archivedByFilter={archivedByFilter}
        onArchivedByChange={setArchivedByFilter}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── 3. BULK ACTION BAR ── */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={items.length}
        isAllSelected={isAllSelected}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBulkRestore={bulkRestore}
        onBulkDelete={openBulkDeleteModal}
      />

      {/* ── 4. ARCHIVED ITEMS TABLE OR EMPTY STATE ── */}
      {items.length === 0 ? (
        /* Empty State / Onboarding */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40 my-4 space-y-5">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Archive className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">
              {hasActiveFilters ? "Không tìm thấy mục lưu trữ phù hợp" : "Kho lưu trữ trống 📦"}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {hasActiveFilters ? (
                <>
                  Không có mục nào phù hợp với từ khóa &quot;
                  <span className="text-emerald-400 font-semibold">{searchQuery}</span>&quot; hoặc các bộ lọc đang chọn.
                </>
              ) : (
                "Các công việc hoặc dự án bạn chọn 'Lưu trữ' sẽ tạm thời xuất hiện tại đây trước khi bị tự động xóa sau 30 ngày."
              )}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Bỏ tất cả bộ lọc</span>
            </button>
          )}
        </div>
      ) : (
        /* Table Layout */
        <div className="w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 font-semibold uppercase text-[11px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 rounded text-zinc-500 hover:text-emerald-400"
                    title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Loại mục</th>
                <th className="py-3.5 px-4">Tên mục / Vị trí gốc</th>
                <th className="py-3.5 px-4">Người lưu trữ</th>
                <th className="py-3.5 px-4">Đếm ngược tự hủy</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {items.map((item) => (
                <ArchivedItemRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                  onRestore={restoreItem}
                  onPermanentDelete={(i) => setDeletingItem(i)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 5. PERMANENT DELETE MODAL ── */}
      <PermanentDeleteModal
        item={deletingItem}
        isBulk={isBulkDeleting}
        isOpen={Boolean(deletingItem) || isBulkDeleting}
        onClose={closeDeleteModal}
        onConfirm={confirmPermanentDelete}
      />

      {/* ── 6. TOAST FEEDBACK ── */}
      <Toast toast={toast} />
    </div>
  );
}
