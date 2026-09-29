"use client";

import Link from "next/link";
import { Mail, Clock, RefreshCw, XCircle, ArrowLeft, Plus } from "lucide-react";

export default function PendingInvitationsPage() {
  const invitations = [
    { id: "inv-1", email: "ha.tran@example.com", role: "MEMBER", inviter: "Quân Nguyễn", createdAt: "24/09/2026", expiresAt: "7 ngày nữa" },
    { id: "inv-2", email: "techlead@startup.io", role: "ADMIN", inviter: "Trường Hoàng", createdAt: "23/09/2026", expiresAt: "6 ngày nữa" },
  ];

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/app/members" className="text-xs font-semibold text-[var(--muted)] hover:underline flex items-center gap-1 mb-1">
            <ArrowLeft size={12} /> Thành viên
          </Link>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Lời mời đang chờ xử lý</h1>
        </div>

        <Link href="/app/members" className="button primary">
          <Plus size={16} /> Mời thành viên mới
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[#f8fbf8] text-xs font-bold uppercase text-[var(--muted)]">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Người mời</th>
              <th className="p-4">Ngày gửi</th>
              <th className="p-4">Hạn dùng</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {invitations.map((inv) => (
              <tr key={inv.id} className="hover:bg-[#f6faf6] transition-colors">
                <td className="p-4 font-semibold text-[var(--ink)]">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-[var(--primary)]" />
                    {inv.email}
                  </div>
                </td>
                <td className="p-4">
                  <span className="badge blue">{inv.role}</span>
                </td>
                <td className="p-4 text-xs text-[var(--muted)]">{inv.inviter}</td>
                <td className="p-4 text-xs text-[var(--muted)]">{inv.createdAt}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                    <Clock size={14} /> {inv.expiresAt}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="button secondary text-xs">
                      <RefreshCw size={14} /> Gửi lại
                    </button>
                    <button className="button danger text-xs">
                      <XCircle size={14} /> Thu hồi
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
}
