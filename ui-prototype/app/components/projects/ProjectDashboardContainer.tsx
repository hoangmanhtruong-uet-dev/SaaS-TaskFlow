 
"use client";

import Link from "next/link";
import { Plus, FolderKanban, SearchX } from "lucide-react";
import { useWorkspace } from "../providers/workspace-provider";
import { useProjectManagement } from "./useProjectManagement";
import { ProjectKpiHeader } from "./ProjectKpiHeader";
import type { ProjectStatus } from "./types";
import { ProjectToolbar } from "./ProjectToolbar";
import { ProjectGridCard } from "./ProjectGridCard";
import { ProjectListTable } from "./ProjectListTable";
import { ProjectEditModal } from "./ProjectEditModal";
import { ProjectDeleteModal } from "./ProjectDeleteModal";
import { Toast } from "./Toast";

export function ProjectDashboardContainer() {
  const workspace = useWorkspace();
  const {
    projects,
    loading,
    kpiStats,
    // Search & Filters
    inputQuery,
    setInputQuery,
    statusFilter,
    setStatusFilter,
    ownerFilter,
    setOwnerFilter,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    // View mode & KPI Expand
    viewMode,
    setViewMode,
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
  } = useProjectManagement();

  // Export CSV handler
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Mã,Tên dự án,Mô tả,Tiến độ %,Trạng thái"]
        .concat(
          projects.map(
            (p) =>
              `"${p.id}","${p.code}","${p.name}","${p.description}",${p.progress},"${p.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taskflow-projects-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = () => {
    alert("Vui lòng chọn file CSV / Excel để nhập dữ liệu dự án.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── 1. PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <FolderKanban className="w-4 h-4" />
            <span>Workspace: {workspace.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-1">
            Danh sách Dự án
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Quản lý tiến độ, phân công thành viên và giám sát các dự án trong workspace.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/app/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </Link>
        </div>
      </div>

      {/* ── 2. COLLAPSIBLE KPI HEADER ── */}
      <ProjectKpiHeader
        stats={kpiStats}
        isExpanded={isKpiExpanded}
        onToggleExpand={toggleKpiExpanded}
      />

      {/* ── 3. TOOLBAR BAR (Search, Filters, Sort, View Switcher) ── */}
      <ProjectToolbar
        filters={{
          searchQuery: inputQuery,
          status: statusFilter,
          ownerId: ownerFilter,
          sortBy,
        }}
        onFilterChange={(key, val) => {
          if (key === "searchQuery") setInputQuery(val);
          if (key === "status") setStatusFilter(val as "all" | ProjectStatus);
          if (key === "ownerId") setOwnerFilter(val);
          if (key === "sortBy") setSortBy(val as "newest" | "name" | "progress");
        }}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExportCSV}
        onImport={handleImportFile}
      />

      {/* ── 4. MAIN PROJECT LISTINGS (GRID vs LIST) ── */}
      {loading ? (
        /* Skeleton Grid Loader */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-850 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-zinc-850 rounded" />
              <div className="h-2 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State / Onboarding */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40 my-4 space-y-5">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <SearchX className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">Không tìm thấy dự án nào</h3>
            <p className="text-sm text-zinc-400">
              {hasActiveFilters ? (
                <>
                  Không tìm thấy dự án phù hợp với từ khóa &quot;
                  <span className="text-emerald-400 font-semibold">{inputQuery}</span>&quot; hoặc bộ lọc đang chọn.
                </>
              ) : (
                "Workspace này chưa có dự án nào. Bắt đầu tạo dự án đầu tiên để gom board và quản lý công việc."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            )}

            <Link
              href="/app/projects/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo dự án mới ngay</span>
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View (Responsive 3-4 columns) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {projects.map((project) => (
            <ProjectGridCard
              key={project.id}
              project={project}
              onToggleFavorite={toggleFavorite}
              onCopyLink={copyProjectLink}
              onToggleArchive={toggleArchive}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
        </div>
      ) : (
        /* List View Table */
        <ProjectListTable
          projects={projects}
          onToggleFavorite={toggleFavorite}
          onCopyLink={copyProjectLink}
          onToggleArchive={toggleArchive}
          onEdit={(p) => setEditingProject(p)}
          onDelete={(p) => setDeletingProject(p)}
        />
      )}

      {/* ── 5. MODALS & TOAST FEEDBACK ── */}
      <ProjectEditModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveEdit}
      />

      <ProjectDeleteModal
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
