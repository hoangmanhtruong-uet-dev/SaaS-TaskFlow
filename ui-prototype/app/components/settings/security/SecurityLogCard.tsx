"use client";

import React from "react";
import { History, ShieldCheck, ShieldAlert, Clock, Globe } from "lucide-react";
import { SecurityLogItem } from "./types";

interface SecurityLogCardProps {
  logs: SecurityLogItem[];
}

export const SecurityLogCard: React.FC<SecurityLogCardProps> = ({ logs }) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Nhật ký hoạt động bảo mật (Security Stream)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lịch sử theo dõi các sự kiện thay đổi mật khẩu, đăng nhập và kích hoạt 2FA gần đây
          </p>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
                <th className="py-3 px-4 min-w-[220px]">Sự kiện bảo mật</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Địa chỉ IP & Vị trí</th>
                <th className="py-3 px-4">Thiết bị</th>
                <th className="py-3 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                  {/* Event */}
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">
                    <div className="flex items-center gap-2">
                      {log.status === "success" ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{log.event}</span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>

                  {/* IP & Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      <span className="font-mono text-[11px] text-emerald-400">
                        {log.ipAddress}
                      </span>
                      <span className="text-zinc-500 text-[11px]">• {log.location}</span>
                    </div>
                  </td>

                  {/* Device */}
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    {log.device}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === "success"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                          : "bg-red-950 text-red-400 border border-red-800/60"
                      }`}
                    >
                      {log.status === "success" ? "Thành công" : "Thất bại"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
