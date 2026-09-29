 
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MoreVertical,
  LockKeyhole,
  Copy,
  Archive,
  Trash2,
  Edit2,
} from "lucide-react";
import { Project } from "./types";

interface ProjectGridCardProps {
  project: Project;
  onToggleFavorite: (id: string) => void;
  onCopyLink: (project: Project) => void;
  onToggleArchive: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectGridCard({
  project,
  onToggleFavorite,
  onCopyLink,
  onToggleArchive,
  onEdit,
  onDelete,
}: ProjectGridCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isArchived = project.status === "ARCHIVED";
  const isCompleted = project.status === "COMPLETED";

  // Avatar Stack calculations
  const visibleMembers = project.members.slice(0, 3);
  const extraMembersCount = project.members.length - 3;

  // Tone colors
  const toneGradients = {
    emerald: "from-emerald-500 to-teal-600 text-emerald-100",
    blue: "from-blue-500 to-indigo-600 text-blue-100",
    purple: "from-purple-500 to-pink-600 text-purple-100",
    amber: "from-amber-500 to-orange-600 text-amber-100",
    rose: "from-rose-500 to-red-600 text-rose-100",
  };
  const gradientClass = toneGradients[project.colorTone || "emerald"];

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/90 border transition-all duration-200 shadow-lg hover:shadow-emerald-950/20 ${
        project.isFavorite
          ? "border-amber-500/40 bg-zinc-900/95"
          : "border-zinc-800/90 hover:border-emerald-500/50 hover:bg-zinc-900"
      }`}
    >
      {/* ── CARD HEADER ── */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Badge Avatar + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-md font-bold text-sm shrink-0`}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">
                  {project.code}
                </span>
                {project.visibility === "PRIVATE" && (
                  <span title="Dự án riêng tư">
                    <LockKeyhole className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                <Link href={`/app/projects/${project.id}/board`}>{project.name}</Link>
              </h3>
            </div>
          </div>

          {/* Header Actions (Star Pin + Options Menu) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Star Favorite Button */}
            <button
              onClick={() => onToggleFavorite(project.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                project.isFavorite
                  ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
                  : "text-zinc-500 hover:text-amber-400 hover:bg-zinc-800"
              }`}
              title={project.isFavorite ? "Bỏ ghim khỏi Yêu thích" : "Ghim dự án Yêu thích"}
            >
              <Star className={`w-4 h-4 ${project.isFavorite ? "fill-amber-400" : ""}`} />
            </button>

            {/* Quick Actions Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Tùy chọn thao tác"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu Popup */}
              {showMenu && (
                <>
                  <button
                    type="button"
                    aria-label="Đóng menu thao tác dự án"
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl p-1.5 text-xs text-zinc-300 space-y-0.5 animate-fadeIn">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(project);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chỉnh sửa thông tin</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onCopyLink(project);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Sao chép liên kết</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onToggleArchive(project.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isArchived ? "Khôi phục dự án" : "Lưu trữ dự án"}</span>
                    </button>

                    <div className="h-px bg-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(project);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors text-left font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa dự án</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Short Description (Truncated 2 lines) */}
        <p
          className="text-xs text-zinc-400 line-clamp-2 leading-relaxed min-h-[36px]"
          title={project.description}
        >
          {project.description || "Chưa có mô tả chi tiết cho dự án này."}
        </p>
      </div>

      {/* ── CARD BODY (Progress Bar) ── */}
      <div className="space-y-2 py-3.5 border-t border-b border-zinc-800/60 my-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Tiến độ công việc</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-400">{project.progress}%</span>
            <span className="text-zinc-500 text-[11px]">
              ({project.completedTaskCount}/{project.taskCount} task)
            </span>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCompleted
                ? "bg-emerald-500"
                : project.progress > 50
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-amber-500 to-emerald-500"
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* ── CARD FOOTER ── */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Multi-Avatar Stack */}
        <div className="flex items-center -space-x-2">
          {visibleMembers.map((m) => (
            <div
              key={m.id}
              className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-200 shadow-sm"
              title={`${m.name} (${m.role || "Member"})`}
            >
              {m.avatarUrl ?? m.name.charAt(0)}
            </div>
          ))}
          {extraMembersCount > 0 && (
            <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-emerald-400 shadow-sm">
              +{extraMembersCount}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
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

          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            {project.updatedAt}
          </span>
        </div>
      </div>
    </div>
  );
}
