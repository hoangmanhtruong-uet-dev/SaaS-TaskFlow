"use client";

import React from "react";
import { Mail } from "lucide-react";
import { EmailDigestSettings, EmailDigestFrequency } from "./types";

interface EmailDigestCardProps {
  settings: EmailDigestSettings;
  onUpdateSettings: (updater: Partial<EmailDigestSettings>) => void;
}

const FREQUENCY_OPTIONS: {
  id: EmailDigestFrequency;
  title: string;
  desc: string;
  badge?: string;
}[] = [
  {
    id: "realtime",
    title: "⚡ Tức thì (Real-time)",
    desc: "Gửi email ngay lập tức khi phát sinh sự kiện liên quan đến bạn",
    badge: "Khuyên dùng",
  },
  {
    id: "hourly",
    title: "⏱️ Tóm tắt hàng giờ (Hourly Digest)",
    desc: "Gộp tất cả sự kiện trong 60 phút vừa qua thành 1 email tổng hợp",
  },
  {
    id: "daily",
    title: "🌅 Bản tin hàng ngày (Daily Digest)",
    desc: "Tổng hợp toàn bộ thông báo gửi vào lúc 08:00 AM mỗi sáng",
  },
  {
    id: "off",
    title: "🚫 Tắt thông báo qua Email",
    desc: "Không nhận bất kỳ email thông báo nào (chỉ xem trên App)",
  },
];

export const EmailDigestCard: React.FC<EmailDigestCardProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <span>Tần suất Email & Bản tin Tổng hợp (Email Digest)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lựa chọn thời gian và tần suất nhận tin nhắn tổng hợp qua Email hộp thư cá nhân
          </p>
        </div>
      </div>

      {/* Frequency Radio Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FREQUENCY_OPTIONS.map((opt) => {
          const isSelected = settings.frequency === opt.id;
          return (
            <label
              key={opt.id}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-zinc-100 flex items-center gap-2">
                  <span>{opt.title}</span>
                  {opt.badge && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.2 rounded font-semibold">
                      {opt.badge}
                    </span>
                  )}
                </span>
                <input
                  type="radio"
                  name="emailFrequency"
                  checked={isSelected}
                  onChange={() => onUpdateSettings({ frequency: opt.id })}
                  className="accent-emerald-500"
                />
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug">{opt.desc}</p>
            </label>
          );
        })}
      </div>
    </div>
  );
};
