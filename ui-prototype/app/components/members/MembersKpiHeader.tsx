"use client";

import React from "react";
import { Users, UserCheck, Mail, ShieldAlert } from "lucide-react";

interface MembersKpiHeaderProps {
  total: number;
  active: number;
  pending: number;
  guests: number;
}

export const MembersKpiHeader: React.FC<MembersKpiHeaderProps> = ({
  total,
  active,
  pending,
  guests,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Members */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-zinc-700 transition-colors">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
            Tổng thành viên
          </p>
          <h3 className="text-2xl font-bold text-zinc-100 mt-1">{total}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Trong Workspace này</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Active Members */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-zinc-700 transition-colors">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Đang hoạt động
          </p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{active}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Tài khoản khả dụng</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Pending Invites */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-zinc-700 transition-colors">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Lời mời đang chờ
          </p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{pending}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Chưa chấp nhận email</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Guests */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-zinc-700 transition-colors">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Khách / Guest
          </p>
          <h3 className="text-2xl font-bold text-purple-400 mt-1">{guests}</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Giới hạn quyền truy cập</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
