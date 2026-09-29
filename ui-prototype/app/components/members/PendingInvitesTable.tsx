 
"use client";

import React from "react";
import { Mail, Clock, RefreshCw, Trash2 } from "lucide-react";
import { PendingInvite } from "./types";

interface PendingInvitesTableProps {
  invites: PendingInvite[];
  onResend: (inviteId: string) => void;
  onRevoke: (inviteId: string) => void;
}

export const PendingInvitesTable: React.FC<PendingInvitesTableProps> = ({
  invites,
  onResend,
  onRevoke,
}) => {
  if (invites.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center my-6">
        <div className="w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-500 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200">
          Không có lời mời nào đang chờ xử lý
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Tất cả thành viên được mời đã chấp nhận tham gia Workspace của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/80 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
              <th className="py-3 px-4">Email được mời</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4">Người mời</th>
              <th className="py-3 px-4">Ngày mời & Hết hạn</th>
              <th className="py-3 px-4">Dự án tham gia</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 text-xs">
            {invites.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-900/80 transition-colors">
                {/* Email */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 font-semibold text-zinc-100">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{inv.email}</span>
                  </div>
                </td>

                {/* Role */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60 uppercase tracking-wider">
                    {inv.role}
                  </span>
                </td>

                {/* Invited By */}
                <td className="py-3.5 px-4 text-zinc-300">{inv.invitedBy}</td>

                {/* Date & Expire */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{inv.invitedAt}</span>
                  </div>
                  <div className="text-[11px] text-amber-400 mt-0.5 font-medium">
                    {inv.expiresAt}
                  </div>
                </td>

                {/* Projects */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {inv.projects.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] bg-zinc-950 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onResend(inv.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                      title="Gửi lại email mời"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Gửi lại</span>
                    </button>

                    <button
                      onClick={() => onRevoke(inv.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-medium transition-colors"
                      title="Thu hồi lời mời"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Thu hồi</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
