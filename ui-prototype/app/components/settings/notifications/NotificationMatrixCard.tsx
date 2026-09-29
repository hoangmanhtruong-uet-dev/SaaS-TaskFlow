 
"use client";

import React from "react";
import {
  Layers,
  Mail,
  Bell,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { NotificationMatrixRow, NotificationChannel } from "./types";

interface NotificationMatrixCardProps {
  matrix: NotificationMatrixRow[];
  onToggleCell: (rowId: string, channel: NotificationChannel) => void;
  onToggleColumnAll: (channel: NotificationChannel) => void;
}

export const NotificationMatrixCard: React.FC<NotificationMatrixCardProps> = ({
  matrix,
  onToggleCell,
  onToggleColumnAll,
}) => {
  const taskRows = matrix.filter((r) => r.category === "Task");
  const projectRows = matrix.filter((r) => r.category === "Project");

  // Check if all rows in a column are checked
  const isColumnAllChecked = (channel: NotificationChannel) => {
    return matrix.every((r) => r[channel]);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Ma trận Nhận Thông báo Mở rộng (Notification Matrix)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tùy chỉnh chi tiết kênh gửi thông báo đối với từng sự kiện công việc và dự án
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/90 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
                <th className="py-4 px-4 min-w-[260px]">Sự kiện thông báo</th>

                {/* Email Column Header */}
                <th className="py-4 px-3 text-center w-28 bg-zinc-900">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      Email
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleColumnAll("email")}
                      className="text-[10px] text-emerald-400 hover:underline font-normal"
                    >
                      {isColumnAllChecked("email") ? "Bỏ tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                </th>

                {/* In-App Column Header */}
                <th className="py-4 px-3 text-center w-28 bg-zinc-900">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      In-App
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleColumnAll("inApp")}
                      className="text-[10px] text-emerald-400 hover:underline font-normal"
                    >
                      {isColumnAllChecked("inApp") ? "Bỏ tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                </th>

                {/* Mobile Push Column Header */}
                <th className="py-4 px-3 text-center w-28 bg-zinc-900">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      Push
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleColumnAll("push")}
                      className="text-[10px] text-emerald-400 hover:underline font-normal"
                    >
                      {isColumnAllChecked("push") ? "Bỏ tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                </th>

                {/* Slack Column Header */}
                <th className="py-4 px-3 text-center w-28 bg-zinc-900">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      Slack
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleColumnAll("slack")}
                      className="text-[10px] text-emerald-400 hover:underline font-normal"
                    >
                      {isColumnAllChecked("slack") ? "Bỏ tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {/* GROUP 1: Task Events */}
              <tr className="bg-zinc-900/50">
                <td colSpan={5} className="py-2.5 px-4 font-bold text-[11px] text-emerald-400 uppercase tracking-wider">
                  📋 Nhóm 1: Sự kiện Công việc (Task Events)
                </td>
              </tr>

              {taskRows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-100">{row.eventName}</div>
                    <div className="text-[11px] text-zinc-400">{row.description}</div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.email}
                      onChange={() => onToggleCell(row.id, "email")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.inApp}
                      onChange={() => onToggleCell(row.id, "inApp")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.push}
                      onChange={() => onToggleCell(row.id, "push")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.slack}
                      onChange={() => onToggleCell(row.id, "slack")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}

              {/* GROUP 2: Project Events */}
              <tr className="bg-zinc-900/50">
                <td colSpan={5} className="py-2.5 px-4 font-bold text-[11px] text-amber-400 uppercase tracking-wider border-t border-zinc-800">
                  📁 Nhóm 2: Sự kiện Dự án & Workspace (Project Events)
                </td>
              </tr>

              {projectRows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-100">{row.eventName}</div>
                    <div className="text-[11px] text-zinc-400">{row.description}</div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.email}
                      onChange={() => onToggleCell(row.id, "email")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.inApp}
                      onChange={() => onToggleCell(row.id, "inApp")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.push}
                      onChange={() => onToggleCell(row.id, "push")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.slack}
                      onChange={() => onToggleCell(row.id, "slack")}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
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
