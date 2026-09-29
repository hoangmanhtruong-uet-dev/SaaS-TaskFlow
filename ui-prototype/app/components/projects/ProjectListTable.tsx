 
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Star,
  MoreHorizontal,
  LockKeyhole,
  Copy,
  Archive,
  Trash2,
  Edit2,
} from "lucide-react";
import { Project } from "./types";

interface ProjectListTableProps {
  projects: Project[];
  onToggleFavorite: (id: string) => void;
  onCopyLink: (project: Project) => void;
  onToggleArchive: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectListTable({
  projects,
  onToggleFavorite,
  onCopyLink,
  onToggleArchive,
  onEdit,
  onDelete,
}: ProjectListTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-md">
      <table className="w-full text-left text-xs sm:text-sm text-zinc-300">
        <thead className="bg-zinc-950/80 text-zinc-400 font-semibold uppercase text-[11px] tracking-wider border-b border-zinc-800">
          <tr>
            <th className="py-3.5 px-4 w-10 text-center">Ghim</th>
            <th className="py-3.5 px-4">Tên dự án</th>
            <th className="py-3.5 px-4">Trạng thái</th>
            <th className="py-3.5 px-4 min-w-[180px]">Tiến độ</th>
            <th className="py-3.5 px-4">Thành viên</th>
            <th className="py-3.5 px-4">Cập nhật</th>
            <th className="py-3.5 px-4 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-800/60">
          {projects.map((project) => {
            const isArchived = project.status === "ARCHIVED";
            const isCompleted = project.status === "COMPLETED";

            return (
              <tr
                key={project.id}
                className={`hover:bg-zinc-850/50 transition-colors group ${
                  project.isFavorite ? "bg-amber-500/5" : ""
                }`}
              >
                {/* Pin/Star Column */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onToggleFavorite(project.id)}
                    className={`p-1 rounded transition-colors ${
                      project.isFavorite
                        ? "text-amber-400"
                        : "text-zinc-600 hover:text-amber-400"
                    }`}
                    title={project.isFavorite ? "Bỏ ghim khỏi Yêu thích" : "Ghim dự án Yêu thích"}
                  >
                    <Star className={`w-4 h-4 ${project.isFavorite ? "fill-amber-400" : ""}`} />
                  </button>
                </td>

                {/* Project Name & Code & Description */}
                <td className="py-3 px-4 font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">
                          {project.code}
                        </span>
                        <Link
                          href={`/app/projects/${project.id}/board`}
                          className="font-bold text-zinc-100 hover:text-emerald-400 transition-colors"
                        >
                          {project.name}
                        </Link>
                        {project.visibility === "PRIVATE" && (
                          <span title="Dự án riêng tư">
                            <LockKeyhole className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1 max-w-xs">
                        {project.description || "Không có mô tả"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-4">
                  {isArchived ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Đã lưu trữ
                    </span>
                  ) : isCompleted ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Hoàn thành
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Đang hoạt động
                    </span>
                  )}
                </td>

                {/* Progress Bar Line */}
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400">{project.progress}%</span>
                      <span className="text-zinc-500 text-[11px]">
                        {project.completedTaskCount}/{project.taskCount} task
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Member Avatar Stack */}
                <td className="py-3 px-4">
                  <div className="flex items-center -space-x-1.5">
                    {project.members.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-200"
                        title={m.name}
                      >
                        {m.avatarUrl ?? m.name.charAt(0)}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </td>

                {/* Timestamp */}
                <td className="py-3 px-4 text-xs text-zinc-400">{project.updatedAt}</td>

                {/* Quick Actions Dropdown Menu */}
                <td className="py-3 px-4 text-right relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {activeMenuId === project.id && (
                    <>
                      <button
                        type="button"
                        aria-label="Đóng menu dự án"
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-4 top-10 z-20 w-44 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl p-1.5 text-xs text-zinc-300 space-y-0.5 text-left">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onEdit(project);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Chỉnh sửa thông tin</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onCopyLink(project);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-400" />
                          <span>Sao chép liên kết</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onToggleArchive(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left"
                        >
                          <Archive className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isArchived ? "Khôi phục dự án" : "Lưu trữ dự án"}</span>
                        </button>

                        <div className="h-px bg-zinc-800 my-1" />

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDelete(project);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-left font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa dự án</span>
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
