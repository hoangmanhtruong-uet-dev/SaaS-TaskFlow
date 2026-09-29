 
"use client";

import React from "react";
import {
  FolderKanban,
  FileText,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export type ResultType = "task" | "project" | "doc" | "member";

export interface SearchResultItem {
  id: string;
  type: ResultType;
  title: string;
  snippet?: string;
  code?: string;
  projectTitle?: string;
  status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  statusLabel?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  assigneeName?: string;
  assigneeAvatar?: string;
  tags?: string[];
  docCategory?: string;
  memberRole?: string;
  memberEmail?: string;
  memberTaskCount?: number;
  updatedAt?: string;
  href?: string;
}

interface ResultCardProps {
  item: SearchResultItem;
  query: string;
  onSelectTask?: (taskId: string) => void;
}

// Helper to highlight matching keyword in string
function highlightMatch(text: string | undefined, query: string): React.ReactNode {
  if (!text) return null;
  if (!query || !query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-500/25 text-amber-200 px-1 py-0.5 rounded font-medium border border-amber-500/40"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function ResultCard({ item, query, onSelectTask }: ResultCardProps) {
  // Render status badge style
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "DONE":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Hoàn thành
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Đang thực hiện
          </span>
        );
      case "REVIEW":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Đang kiểm thử
          </span>
        );
      case "TODO":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            Cần làm
          </span>
        );
    }
  };

  // Render priority badge style (soft tone)
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/60 text-rose-300 border border-rose-800/50">
            Cao
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50">
            Trung bình
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
            Thấp
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 shadow-md">
      {/* TASK ITEM CARD */}
      {item.type === "task" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-mono text-zinc-500 font-semibold">{item.code}</span>
                {item.projectTitle && (
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                    {item.projectTitle}
                  </span>
                )}
                {getStatusBadge(item.status)}
                {getPriorityBadge(item.priority)}
              </div>

              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                <button
                  type="button"
                  onClick={() => onSelectTask && onSelectTask(item.id)}
                  className="text-left hover:underline focus:outline-none"
                >
                  {highlightMatch(item.title, query)}
                </button>
              </h3>
            </div>

            <button
              onClick={() => onSelectTask && onSelectTask(item.id)}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors"
              title="Xem chi tiết"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Snippet / Description match */}
          {item.snippet && (
            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-850">
              {highlightMatch(item.snippet, query)}
            </p>
          )}

          {/* Card Footer Meta */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              {item.assigneeName && (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-emerald-100 font-bold flex items-center justify-center text-[10px]">
                    {item.assigneeAvatar ?? item.assigneeName.charAt(0)}
                  </div>
                  <span>{item.assigneeName}</span>
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-zinc-400">
                  <Tag className="w-3 h-3 text-zinc-500" />
                  <span>{item.tags.map((t) => `#${t}`).join(", ")}</span>
                </div>
              )}
            </div>

            {item.updatedAt && (
              <div className="flex items-center gap-1 text-zinc-500">
                <Clock className="w-3 h-3" />
                <span>{item.updatedAt}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROJECT ITEM CARD */}
      {item.type === "project" && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-emerald-400">
                  Dự án
                </span>
                {item.statusLabel && (
                  <span className="text-xs text-zinc-400">{item.statusLabel}</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {highlightMatch(item.title, query)}
              </h3>
              {item.snippet && (
                <p className="text-xs text-zinc-400">{highlightMatch(item.snippet, query)}</p>
              )}
            </div>
          </div>

          <Link
            href={item.href || "/app/projects"}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* DOC ITEM CARD */}
      {item.type === "doc" && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                  {item.docCategory || "Tài liệu"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-purple-400 transition-colors">
                {highlightMatch(item.title, query)}
              </h3>
              {item.snippet && (
                <p className="text-xs text-zinc-400">{highlightMatch(item.snippet, query)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MEMBER ITEM CARD */}
      {item.type === "member" && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow">
              {item.assigneeAvatar ?? item.title.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400">
                  {highlightMatch(item.title, query)}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                  {item.memberRole || "Thành viên"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{item.memberEmail}</p>
            </div>
          </div>

          {item.memberTaskCount !== undefined && (
            <div className="text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="font-bold text-emerald-400">{item.memberTaskCount}</span> công việc
            </div>
          )}
        </div>
      )}
    </div>
  );
}
