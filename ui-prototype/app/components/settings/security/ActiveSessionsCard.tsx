 
"use client";

import React from "react";
import {
  Laptop,
  Smartphone,
  Monitor,
  LogOut,
  Globe,
  Clock,
} from "lucide-react";
import { ActiveSessionItem } from "./types";

interface ActiveSessionsCardProps {
  sessions: ActiveSessionItem[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOthers: () => void;
}

export const ActiveSessionsCard: React.FC<ActiveSessionsCardProps> = ({
  sessions,
  onRevokeSession,
  onRevokeAllOthers,
}) => {
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  const renderDeviceIcon = (deviceType: string) => {
    if (deviceType === "mobile") return <Smartphone className="w-5 h-5 text-emerald-400" />;
    if (deviceType === "laptop") return <Laptop className="w-5 h-5 text-amber-400" />;
    return <Monitor className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <span>Quản lý phiên đăng nhập (Active Sessions)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Theo dõi tất cả thiết bị và vị trí địa lý đang duy trì truy cập tài khoản TaskFlow
          </p>
        </div>

        {otherSessionsCount > 0 && (
          <button
            type="button"
            onClick={onRevokeAllOthers}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/50 text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Đăng xuất khỏi tất cả thiết bị khác ({otherSessionsCount})</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              sess.isCurrent
                ? "bg-emerald-950/20 border-emerald-500/50 shadow-sm"
                : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                {renderDeviceIcon(sess.deviceType)}
              </div>

              <div className="space-y-1">
                <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
                  <span>{sess.browserName}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300 font-normal">{sess.osName}</span>

                  {sess.isCurrent && (
                    <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      Thiết bị hiện tại
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                    <Globe className="w-3 h-3 text-zinc-500" />
                    <span>{sess.location}</span>
                    <span className="text-zinc-600">({sess.ipAddress})</span>
                  </span>

                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{sess.lastActive}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Revoke */}
            {!sess.isCurrent && (
              <button
                type="button"
                onClick={() => onRevokeSession(sess.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/50 text-zinc-300 hover:text-red-300 border border-zinc-800 hover:border-red-800/50 text-xs font-medium transition-colors shrink-0 self-start sm:self-center"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Đăng xuất</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
