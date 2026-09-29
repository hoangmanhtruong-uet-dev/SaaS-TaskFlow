 
"use client";

import React from "react";
import { MessageSquare, Settings } from "lucide-react";
import { SlackIntegrationSettings } from "./types";

interface SlackIntegrationCardProps {
  slack: SlackIntegrationSettings;
  onUpdateSlack: (updater: Partial<SlackIntegrationSettings>) => void;
  onShowToast: (msg: string) => void;
}

const SLACK_CHANNELS = [
  "#taskflow-notifications",
  "#general-announcements",
  "#dev-alerts",
  "#product-milestones",
  "#qa-bug-reports",
];

export const SlackIntegrationCard: React.FC<SlackIntegrationCardProps> = ({
  slack,
  onUpdateSlack,
  onShowToast,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Tích hợp Kênh Slack / Microsoft Teams</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Đồng bộ thông báo tự động từ TaskFlow đến các kênh trao đổi nhóm Slack hoặc Teams
          </p>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <label htmlFor="slack-default-channel" className="text-xs font-semibold text-zinc-200">
              Kênh Slack mặc định nhận thông báo toàn dự án
            </label>
            <p className="text-[11px] text-zinc-400">
              Các sự kiện được bật ô Slack trong Ma trận sẽ đẩy trực tiếp vào kênh này
            </p>
          </div>

          <select
            id="slack-default-channel"
            value={slack.channel}
            onChange={(e) => onUpdateSlack({ channel: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 text-xs font-mono font-semibold rounded-xl px-3.5 py-2.5 text-purple-300 outline-none cursor-pointer sm:w-64"
          >
            {SLACK_CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Incoming Webhook URL: Active</span>
          </div>

          <button
            type="button"
            onClick={() =>
              onShowToast("Đã mở dialog Cấu hình Slack Webhook thủ công!")
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span>Cấu hình Webhook thủ công</span>
          </button>
        </div>
      </div>
    </div>
  );
};
