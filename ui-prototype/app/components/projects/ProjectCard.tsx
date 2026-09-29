 
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
  Edit,
  Check,
} from "lucide-react";

export interface ProjectCardData {
  id: string;
  name: string;
  description: string;
  visibility: "WORKSPACE" | "PRIVATE";
  taskCount: number;
  completedTaskCount?: number;
  progress: number;
  archivedAt: string | null;
  isFavorite?: boolean;
  color?: string; // Hex or tailwind color class
  members?: { id: string; name: string; avatar?: string }[];
  updatedAt?: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (project: ProjectCardData) => void;
}

export function ProjectCard({
  project,
  onToggleFavorite,
  onArchive,
  onDelete,
  onEdit,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const completedTasks = project.completedTaskCount ?? Math.round((project.taskCount * project.progress) / 100);
  const isArchived = Boolean(project.archivedAt);
  const isCompleted = project.progress === 100;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/app/projects/${project.id}/board`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  // Color theme generator for card avatar badge based on project id
  const colors = [
    "from-emerald-500 to-teal-600 text-emerald-100",
    "from-blue-500 to-indigo-600 text-blue-100",
    "from-purple-500 to-pink-600 text-purple-100",
    "from-amber-500 to-orange-600 text-amber-100",
  ];
  const colorIndex = Math.abs(project.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const gradientColor = colors[colorIndex];

  // Members avatar list fallback
  const membersList = project.members && project.members.length > 0
    ? project.members
    : [
        { id: "m1", name: "Hoàng Mạnh Trường" },
        { id: "m2", name: "Nguyễn Văn A" },
        { id: "m3", name: "Trần Thị B" },
        { id: "m4", name: "Phạm Văn C" },
      ];

  const visibleMembers = membersList.slice(0, 3);
  const extraMembersCount = membersList.length - 3;

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all duration-200 shadow-lg hover:shadow-emerald-950/20">
      {/* ── CARD HEADER ── */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Project Icon Badge + Title */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-md font-bold text-sm shrink-0`}>
              {project.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/app/projects/${project.id}/board`}
                  className="font-bold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1"
                >
                  {project.name}
                </Link>
                {project.visibility === "PRIVATE" && (
                  <span title="Dự án riêng tư">
                    <LockKeyhole className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}

              </div>
            </div>
          </div>

          {/* Header Right Actions (Star + Options Dropdown) */}
          <div className="flex items-center gap-1">
            {/* Favorite Star Button */}
            <button
              onClick={() => onToggleFavorite(project.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                project.isFavorite
                  ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
                  : "text-zinc-500 hover:text-amber-400 hover:bg-zinc-800"
              }`}
              title={project.isFavorite ? "Bỏ ghim dự án" : "Ghim dự án ưa thích"}
            >
              <Star className={`w-4 h-4 ${project.isFavorite ? "fill-amber-400" : ""}`} />
            </button>

            {/* Options Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Tùy chọn"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu Popup */}
              {showMenu && (
                <>
                  <button
                    type="button"
                    aria-label="Đóng menu tùy chọn dự án"
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
                      <Edit className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sửa thông tin</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{copied ? "Đã chép link" : "Sao chép link"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onArchive(project.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isArchived ? "Khôi phục" : "Lưu trữ dự án"}</span>
                    </button>

                    <div className="h-px bg-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(project.id);
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

        {/* Short Description (Truncate 2 lines) */}
        <p
          className="text-xs text-zinc-400 line-clamp-2 leading-relaxed min-h-[36px]"
          title={project.description}
        >
          {project.description || "Chưa có mô tả chi tiết cho dự án này."}
        </p>
      </div>

      {/* ── CARD BODY (Progress Bar) ── */}
      <div className="space-y-2 py-4 border-t border-b border-zinc-800/60 my-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Tiến độ công việc</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-400">{project.progress}%</span>
            <span className="text-zinc-500">
              ({completedTasks}/{project.taskCount} task)
            </span>
          </div>
        </div>

        {/* Progress bar line */}
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
        {/* Member Avatar Stack */}
        <div className="flex items-center -space-x-2">
          {visibleMembers.map((m, i) => (
            <div
              key={m.id || i}
              className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-200 shadow-sm"
              title={m.name}
            >
              {m.avatar ?? m.name.charAt(0)}
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
            {project.updatedAt || "Cập nhật gần đây"}
          </span>
        </div>
      </div>
    </div>
  );
}
