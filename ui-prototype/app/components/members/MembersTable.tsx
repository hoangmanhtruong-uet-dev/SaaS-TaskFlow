 
"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  UserCheck,
  UserX,
  Briefcase,
  Trash2,
  Crown,
  Eye,
} from "lucide-react";
import { WorkspaceMember, UserRole } from "./types";

interface MembersTableProps {
  members: WorkspaceMember[];
  onSelectMember: (member: WorkspaceMember) => void;
  onRequestRoleChange: (member: WorkspaceMember, newRole: UserRole) => void;
  onRequestOwnershipTransfer: (member: WorkspaceMember) => void;
  onToggleStatus: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  onSelectMember,
  onRequestRoleChange,
  onRequestOwnershipTransfer,
  onToggleStatus,
  onRemoveMember,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/80 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
              <th className="py-3.5 px-4 min-w-[220px]">Thành viên</th>
              <th className="py-3.5 px-4 w-28">Trạng thái</th>
              <th className="py-3.5 px-4 w-36">Vai trò (Role)</th>
              <th className="py-3.5 px-4 min-w-[180px]">Dự án tham gia</th>
              <th className="py-3.5 px-4 w-32">Tải công việc</th>
              <th className="py-3.5 px-4 w-28">Gia nhập</th>
              <th className="py-3.5 px-4 text-right w-16">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 text-xs">
            {members.map((m) => {
              const isOwner = m.role === "owner";
              const isCurrent = m.isCurrentUser;

              return (
                <tr
                  key={m.id}
                  className="hover:bg-zinc-900/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectMember(m)}
                >
                  {/* Member Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          m.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                        }
                        alt={m.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-700 group-hover:border-emerald-500/60 transition-colors shrink-0"
                      />
                      <div>
                        <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-semibold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-normal">
                          {m.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.status === "active"
                            ? "bg-emerald-400 animate-pulse"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          m.status === "active" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {m.status === "active" ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </div>
                  </td>

                  {/* Role Selector */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={m.role}
                      disabled={isOwner || isCurrent}
                      onChange={(e) =>
                        onRequestRoleChange(m, e.target.value as UserRole)
                      }
                      className={`w-full bg-zinc-950 border border-zinc-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                        m.role === "owner"
                          ? "text-amber-400 border-amber-800/50"
                          : m.role === "admin"
                          ? "text-purple-400 border-purple-800/50"
                          : m.role === "member"
                          ? "text-emerald-400 border-emerald-800/50"
                          : "text-zinc-400"
                      }`}
                    >
                      <option value="owner" disabled>
                        👑 Owner
                      </option>
                      <option value="admin">🛡️ Admin</option>
                      <option value="member">👤 Member</option>
                      <option value="guest">🌐 Guest</option>
                    </select>
                  </td>

                  {/* Assigned Projects */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1">
                      {m.projects.slice(0, 2).map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 text-[10px] bg-zinc-950 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-medium"
                        >
                          <Briefcase className="w-2.5 h-2.5 text-amber-400" />
                          <span>{p}</span>
                        </span>
                      ))}
                      {m.projects.length > 2 && (
                        <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded">
                          +{m.projects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Workload Indicator */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      <span>{m.taskCount} tasks</span>
                    </div>
                  </td>

                  {/* Join Date */}
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    {m.joinDate}
                  </td>

                  {/* Actions Dropdown */}
                  <td
                    className="py-3.5 px-4 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => toggleMenu(m.id, e)}
                      className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === m.id && (
                      <div className="absolute right-4 top-10 z-30 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 text-left text-xs animate-in fade-in duration-150">
                        {/* View Workload Profile */}
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectMember(m);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Xem hồ sơ công việc</span>
                        </button>

                        {/* Suspend / Unsuspend */}
                        {!isOwner && !isCurrent && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onToggleStatus(m.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
                          >
                            {m.status === "active" ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-amber-400" />
                                <span>Tạm dừng tài khoản</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Kích hoạt lại tài khoản</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Transfer Ownership */}
                        {!isOwner && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onRequestOwnershipTransfer(m);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-amber-400 hover:bg-amber-950/60 transition-colors font-medium border-t border-zinc-800/80 mt-1 pt-2"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>Chuyển quyền Owner</span>
                          </button>
                        )}

                        {/* Delete Member */}
                        {!isOwner && !isCurrent && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onRemoveMember(m.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/60 transition-colors font-medium border-t border-zinc-800/80 mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa khỏi Workspace</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
