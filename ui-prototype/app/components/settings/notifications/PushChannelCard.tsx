 
"use client";

import React from "react";
import { Bell, Volume2, Play, Send, ShieldCheck, AlertCircle } from "lucide-react";
import { PushChannelState, SoundChimeOption } from "./types";

interface PushChannelCardProps {
  config: PushChannelState;
  onUpdateConfig: (updater: Partial<PushChannelState>) => void;
  onRequestPermission: () => void;
  onPlayTestSound: (chime: SoundChimeOption) => void;
  onSendTestNotification: () => void;
}

export const PushChannelCard: React.FC<PushChannelCardProps> = ({
  config,
  onUpdateConfig,
  onRequestPermission,
  onPlayTestSound,
  onSendTestNotification,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Kênh thông báo Đẩy & Trình duyệt (Push & Device)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cấu hình âm thanh thông báo và quyền hiển thị popup trên trình duyệt thiết bị
          </p>
        </div>

        <button
          type="button"
          onClick={onSendTestNotification}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors shrink-0 self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gửi thông báo thử nghiệm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Browser Push Permission Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Thông báo Trình duyệt (Web Push)</span>
            </div>

            {config.permission === "granted" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Đã cấp quyền
              </span>
            ) : config.permission === "denied" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                Bị từ chối
              </span>
            ) : (
              <button
                type="button"
                onClick={onRequestPermission}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
              >
                Bật thông báo đẩy
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Hiển thị thẻ thông báo nổi (Desktop Banner) ngay cả khi ứng dụng TaskFlow đang chạy ở thẻ ẩn.
          </p>

          {config.permission === "denied" && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-2.5 text-[11px] text-red-300">
              ⚠️ Quyền thông báo bị trình duyệt chặn. Nhấp vào biểu tượng 🔒 Khóa trên thanh địa chỉ URL để chọn &ldquo;Cho phép thông báo&rdquo;.
            </div>
          )}
        </div>

        {/* 2. Sound Effects Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Âm thanh thông báo (Sound Effect)</span>
            </div>

            <label aria-label="Toggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.soundEnabled}
                onChange={(e) =>
                  onUpdateConfig({ soundEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <select
              value={config.soundChime}
              disabled={!config.soundEnabled}
              onChange={(e) =>
                onUpdateConfig({ soundChime: e.target.value as SoundChimeOption })
              }
              className="flex-1 bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-zinc-200 outline-none disabled:opacity-50"
            >
              <option value="default">🔔 Chuông tiêu chuẩn (Default)</option>
              <option value="subtle">🎵 Chuông nhẹ (Subtle)</option>
              <option value="chime">✨ Chuông cao cấp (Chime)</option>
            </select>

            <button
              type="button"
              disabled={!config.soundEnabled}
              onClick={() => onPlayTestSound(config.soundChime)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
              title="Phát thử âm thanh"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Nghe thử</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
