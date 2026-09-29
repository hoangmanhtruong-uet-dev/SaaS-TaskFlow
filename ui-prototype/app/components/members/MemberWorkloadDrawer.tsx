 
"use client";

import React from "react";
import {
  X,
  Mail,
  Briefcase,
  Clock,
  Layers,
  Calendar,
} from "lucide-react";
import { WorkspaceMember } from "./types";

interface MemberWorkloadDrawerProps {
  member: WorkspaceMember | null;
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner", color: "bg-amber-950/80 text-amber-400 border-amber-800/60" },
  admin: { label: "Admin", color: "bg-purple-950/80 text-purple-400 border-purple-800/60" },
  member: { label: "Member", color: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60" },
  guest: { label: "Guest", color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
};

export const MemberWorkloadDrawer: React.FC<MemberWorkloadDrawerProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !member) return null;

  const roleMeta = ROLE_LABELS[member.role] || ROLE_LABELS.member;
  const tasks = member.tasks || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
                    member.status === "active" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </div>

              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span>{member.name}</span>
                  {member.isCurrentUser && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-semibold">
                      Bạn
                    </span>
                  )}
                </h2>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-zinc-500" />
                  <span>{member.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="text-xs text-zinc-400 font-medium">Vai trò trong Workspace</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleMeta.color}`}
                  >
                    {roleMeta.label}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="text-xs text-zinc-400 font-medium">Công việc đang phụ trách</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {member.taskCount} tasks
                </div>
              </div>
            </div>

            {/* Assigned Projects Badges */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dự án được phân công ({member.projects.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {member.projects.map((proj) => (
                  <span
                    key={proj}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium"
                  >
                    <Briefcase className="w-3 h-3 text-amber-400" />
                    <span>{proj}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Workload Tasks Feed */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Danh sách Task đang thực hiện</span>
                </h3>
                <span className="text-[11px] text-zinc-500">
                  Gia nhập: {member.joinDate}
                </span>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3 space-y-2 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-400 font-semibold text-[11px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          {t.code}
                        </span>
                        <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {t.projectName}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-zinc-200 leading-snug">
                        {t.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>Hạn: {t.dueDate}</span>
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            t.priority === "URGENT"
                              ? "bg-red-950 text-red-400"
                              : t.priority === "HIGH"
                              ? "bg-amber-950 text-amber-400"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center text-xs text-zinc-500">
                  Thành viên này hiện không đứng tên task nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
