"use client";

import React from "react";
import { Sliders, Languages, CalendarDays, CalendarRange } from "lucide-react";
import { LocalPreferences } from "./types";

interface LocalPreferencesCardProps {
  preferences: LocalPreferences;
  onUpdatePreferences: (pref: LocalPreferences) => void;
}

export const LocalPreferencesCard: React.FC<LocalPreferencesCardProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Tùy chỉnh hiển thị cá nhân</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Định dạng ngày tháng, ngôn ngữ và giao diện lịch làm việc cá nhân
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 1. Language Select */}
        <div className="space-y-2">
          <label htmlFor="local-language" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ngôn ngữ giao diện</span>
          </label>

          <select
            id="local-language"
            value={preferences.language}
            onChange={(e) =>
              onUpdatePreferences({
                ...preferences,
                language: e.target.value as LocalPreferences["language"],
              })
            }
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none cursor-pointer"
          >
            <option value="vi">🇻🇳 Tiếng Việt (Mặc định)</option>
            <option value="en">🇺🇸 English (US)</option>
            <option value="ja">🇯🇵 日本語 (Japanese)</option>
          </select>
        </div>

        {/* 2. First Day of Week */}
        <div className="space-y-2">
          <label htmlFor="local-first-day" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <CalendarRange className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ngày bắt đầu tuần trên Lịch</span>
          </label>

          <select
            id="local-first-day"
            value={preferences.firstDayOfWeek}
            onChange={(e) =>
              onUpdatePreferences({
                ...preferences,
                firstDayOfWeek: e.target.value as LocalPreferences["firstDayOfWeek"],
              })
            }
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none cursor-pointer"
          >
            <option value="mon">Thứ Hai (Mặc định Châu Á / Châu Âu)</option>
            <option value="sun">Chủ Nhật (Mặc định Bắc Mỹ)</option>
          </select>
        </div>
      </div>

      {/* 3. Date Format Radio Options */}
      <div className="space-y-2 pt-1 border-t border-zinc-800/80">
        <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
          <span>Định dạng hiển thị Ngày tháng</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {[
            { value: "DD/MM/YYYY", label: "26/09/2026", desc: "Việt Nam / EU" },
            { value: "MM/DD/YYYY", label: "09/26/2026", desc: "US format" },
            { value: "YYYY-MM-DD", label: "2026-09-26", desc: "ISO Standard" },
          ].map((item) => {
            const isSelected = preferences.dateFormat === item.value;
            return (
              <label
                key={item.value}
                aria-label={item.label}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div>
                  <div className="font-mono text-xs font-semibold text-zinc-100">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</div>
                </div>
                <input
                  type="radio"
                  name="dateFormat"
                  checked={isSelected}
                  onChange={() =>
                    onUpdatePreferences({
                      ...preferences,
                      dateFormat: item.value as LocalPreferences["dateFormat"],
                    })
                  }
                  className="accent-emerald-500"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
