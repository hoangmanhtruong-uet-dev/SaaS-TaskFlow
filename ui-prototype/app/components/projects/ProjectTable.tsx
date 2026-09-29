 
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
  Edit,
  Check,
} from "lucide-react";
import { ProjectCardData } from "./ProjectCard";

interface ProjectTableProps {
  projects: ProjectCardData[];
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (project: ProjectCardData) => void;
}

export function ProjectTable({
  projects,
  onToggleFavorite,
  onArchive,
  onDelete,
  onEdit,
}: ProjectTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (projectId: string) => {
    const url = `${window.location.origin}/app/projects/${projectId}/board`;
    navigator.clipboard.writeText(url);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

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
            const completedTasks = project.completedTaskCount ?? Math.round((project.taskCount * project.progress) / 100);
            const isArchived = Boolean(project.archivedAt);
            const isCompleted = project.progress === 100;

            const membersList = project.members && project.members.length > 0
              ? project.members
              : [
                  { id: "m1", name: "Hoàng Mạnh Trường" },
                  { id: "m2", name: "Nguyễn Văn A" },
                  { id: "m3", name: "Trần Thị B" },
                ];

            return (
              <tr
                key={project.id}
                className="hover:bg-zinc-850/50 transition-colors group"
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
                  >
                    <Star className={`w-4 h-4 ${project.isFavorite ? "fill-amber-400" : ""}`} />
                  </button>
                </td>

                {/* Project Name & Description */}
                <td className="py-3 px-4 font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400 shrink-0">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
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

                {/* Status */}
                <td className="py-3 px-4">
                  {isArchived ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Lưu trữ
                    </span>
                  ) : isCompleted ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Hoàn thành
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Đang chạy
                    </span>
                  )}
                </td>

                {/* Progress Bar */}
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400">{project.progress}%</span>
                      <span className="text-zinc-500 text-[11px]">
                        {completedTasks}/{project.taskCount} task
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

                {/* Members */}
                <td className="py-3 px-4">
                  <div className="flex items-center -space-x-1.5">
                    {membersList.slice(0, 3).map((m, i) => (
                      <div
                        key={m.id || i}
                        className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-200"
                        title={m.name}
                      >
                        {m.avatar ?? m.name.charAt(0)}
                      </div>
                    ))}
                    {membersList.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                        +{membersList.length - 3}
                      </div>
                    )}
                  </div>
                </td>

                {/* Timestamp */}
                <td className="py-3 px-4 text-xs text-zinc-400">
                  {project.updatedAt || "Gần đây"}
                </td>

                {/* Actions Dropdown */}
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
                          <Edit className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sửa thông tin</span>
                        </button>
                        <button
                          onClick={() => handleCopyLink(project.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left"
                        >
                          {copiedId === project.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                          <span>{copiedId === project.id ? "Đã chép link" : "Sao chép link"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onArchive(project.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-left"
                        >
                          <Archive className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isArchived ? "Khôi phục" : "Lưu trữ dự án"}</span>
                        </button>
                        <div className="h-px bg-zinc-800 my-1" />
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDelete(project.id);
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
