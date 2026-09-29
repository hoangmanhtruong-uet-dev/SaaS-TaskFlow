"use client";

import React from "react";
import { Moon, Clock, Calendar } from "lucide-react";
import { QuietHoursSettings } from "./types";

interface QuietHoursCardProps {
  settings: QuietHoursSettings;
  onUpdateSettings: (updater: Partial<QuietHoursSettings>) => void;
}

export const QuietHoursCard: React.FC<QuietHoursCardProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-400" />
            <span>Chế độ Không làm phiền (Quiet Hours / Do Not Disturb)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tự động im lặng tất cả âm thanh và thông báo đẩy trong khung giờ nghỉ ngơi cá nhân
          </p>
        </div>

        {/* Master Switch */}
        <label aria-label="Bật chế độ không làm phiền" className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-1.5">
            <label htmlFor="quiet-hours-start" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Bắt đầu im lặng (Bật DND)</span>
            </label>
            <input
              id="quiet-hours-start"
              type="time"
              value={settings.startTime}
              disabled={!settings.enabled}
              onChange={(e) => onUpdateSettings({ startTime: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none disabled:opacity-50"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1.5">
            <label htmlFor="quiet-hours-end" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Kết thúc im lặng (Tắt DND)</span>
            </label>
            <input
              id="quiet-hours-end"
              type="time"
              value={settings.endTime}
              disabled={!settings.enabled}
              onChange={(e) => onUpdateSettings({ endTime: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Checkbox Weekend DND */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer text-xs text-zinc-200">
          <input
            type="checkbox"
            checked={settings.disableWeekends}
            disabled={!settings.enabled}
            onChange={(e) =>
              onUpdateSettings({ disableWeekends: e.target.checked })
            }
            className="rounded border-zinc-700 bg-zinc-900 text-purple-500 focus:ring-purple-500"
          />
          <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="font-medium">
            Tắt tất cả thông báo vào Cuối tuần (Thứ 7 & Chủ Nhật)
          </span>
        </label>
      </div>
    </div>
  );
};
