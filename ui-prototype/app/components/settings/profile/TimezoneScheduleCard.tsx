 
"use client";

import React from "react";
import { Clock, Globe, Compass, Calendar, AlertCircle } from "lucide-react";
import { WorkingSchedule } from "./types";
import { WORLDWIDE_TIMEZONES } from "./constants";

interface TimezoneScheduleCardProps {
  timezone: string;
  workingSchedule: WorkingSchedule;
  onUpdateTimezone: (tz: string) => void;
  onUpdateSchedule: (schedule: WorkingSchedule) => void;
  onAutoDetectTimezone: () => void;
}

const DAYS_OF_WEEK = [
  { id: 1, label: "T2" },
  { id: 2, label: "T3" },
  { id: 3, label: "T4" },
  { id: 4, label: "T5" },
  { id: 5, label: "T6" },
  { id: 6, label: "T7" },
  { id: 0, label: "CN" },
];

export const TimezoneScheduleCard: React.FC<TimezoneScheduleCardProps> = ({
  timezone,
  workingSchedule,
  onUpdateTimezone,
  onUpdateSchedule,
  onAutoDetectTimezone,
}) => {
  const toggleDay = (dayId: number) => {
    const currentDays = workingSchedule.workingDays || [];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter((d) => d !== dayId)
      : [...currentDays, dayId].sort();
    onUpdateSchedule({ ...workingSchedule, workingDays: newDays });
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Múi giờ & Lịch làm việc</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Thiết lập múi giờ quốc tế và khung giờ tiếp nhận công việc để đồng nghiệp dễ phối hợp
          </p>
        </div>
      </div>

      {/* 1. Timezone Select & Auto-detect Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Múi giờ hệ thống (Timezone)</span>
          </div>
          <button
            type="button"
            onClick={onAutoDetectTimezone}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tự động phát hiện theo thiết bị</span>
          </button>
        </div>

        <select
          id="profile-timezone"
          value={timezone}
          onChange={(e) => onUpdateTimezone(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none cursor-pointer"
        >
          {WORLDWIDE_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Working Schedule */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
          <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Giờ làm việc cố định (Working Hours)</span>
          </h3>
          <span className="text-[11px] text-zinc-500">Cảnh báo ngoài giờ làm việc</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-1">
            <label htmlFor="work-start-time" className="text-xs text-zinc-400">Giờ bắt đầu làm việc</label>
            <input
              id="work-start-time"
              type="time"
              value={workingSchedule.startTime}
              onChange={(e) =>
                onUpdateSchedule({ ...workingSchedule, startTime: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3 py-2 text-zinc-100 outline-none"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label htmlFor="work-end-time" className="text-xs text-zinc-400">Giờ kết thúc làm việc</label>
            <input
              id="work-end-time"
              type="time"
              value={workingSchedule.endTime}
              onChange={(e) =>
                onUpdateSchedule({ ...workingSchedule, endTime: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3 py-2 text-zinc-100 outline-none"
            />
          </div>
        </div>

        {/* Working Days Checkboxes */}
        <div className="space-y-2 pt-1">
          <div className="text-xs text-zinc-400 block font-medium">
            Các ngày làm việc trong tuần
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isChecked = (workingSchedule.workingDays || []).includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                    isChecked
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-sm"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-2.5 text-[11px] text-zinc-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Hệ thống sẽ hiển thị cảnh báo nhẹ khi đồng nghiệp phân công task khẩn cấp cho bạn vào cuối tuần hoặc ngoài khung giờ đã chọn.
          </span>
        </div>
      </div>
    </div>
  );
};
