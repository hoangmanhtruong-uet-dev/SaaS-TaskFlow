 
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { X, Unplug, CheckCircle2, MessageSquare, Code2 } from "lucide-react";
import { IntegrationApp, SlackConfig, GithubConfig } from "./types";

interface IntegrationConfigModalProps {
  app: IntegrationApp | null;
  onClose: () => void;
  onDisconnect: (appId: string) => void;
  onUpdateSlackConfig: (cfg: SlackConfig) => void;
  onUpdateGithubConfig: (cfg: GithubConfig) => void;
}

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  app,
  onClose,
  onDisconnect,
  onUpdateSlackConfig,
  onUpdateGithubConfig,
}) => {
  // Local states for Slack
  const slackData: SlackConfig = app?.config?.slack || {
    workspaceName: "ACME Corp Slack Workspace",
    connectedAccountEmail: "truong.hm@acme.com",
    selectedChannel: "#taskflow-alerts",
    notifyOnTaskAssign: true,
    notifyOnTaskOverdue: true,
    notifyOnMention: true,
  };

  // Local states for GitHub
  const githubData: GithubConfig = app?.config?.github || {
    connectedUser: "hoangmanhtruong-uet",
    repoName: "acme-corp/taskflow-core",
    autoCloseOnPRMerge: true,
    prKeywords: ["Fixes", "Closes", "Resolves"],
    syncIssueComments: true,
  };

  const [slackForm, setSlackForm] = useState<SlackConfig>(slackData);
  const [githubForm, setGithubForm] = useState<GithubConfig>(githubData);

  if (!app) return null;

  const handleSaveSlack = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSlackConfig(slackForm);
    onClose();
  };

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGithubConfig(githubForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center p-1.5 ${app.iconBg}`}>
              { }
              <img src={app.iconUrl} alt={app.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Cấu hình Tích hợp {app.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Đã kết nối
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Đồng bộ dữ liệu thời gian thực giữa TaskFlow và {app.name}.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SLACK CONFIGURATION FORM */}
        {app.id === "slack" && (
          <form onSubmit={handleSaveSlack} className="space-y-5">
            {/* Account Connected Info */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-xs font-semibold text-zinc-400">Slack Workspace Đang Kết Nối:</div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>{slackForm.workspaceName}</span>
              </div>
              <div className="text-xs text-zinc-500 font-mono">Tài khoản: {slackForm.connectedAccountEmail}</div>
            </div>

            {/* Channel Mapping */}
            <div className="space-y-1.5">
              <label htmlFor="slack-channel" className="block text-xs font-semibold text-zinc-300">
                Chọn Kênh Slack nhận Thông báo (Channel Mapping) <span className="text-red-400">*</span>
              </label>
              <select
                id="slack-channel"
                value={slackForm.selectedChannel}
                onChange={(e) => setSlackForm({ ...slackForm, selectedChannel: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="#taskflow-alerts">#taskflow-alerts (Kênh thông báo chung)</option>
                <option value="#general">#general (Kênh thảo luận công ty)</option>
                <option value="#engineering-updates">#engineering-updates (Kênh Kỹ thuật)</option>
                <option value="#dev-notifications">#dev-notifications (Kênh Developers)</option>
              </select>
            </div>

            {/* Notification Event Switches */}
            <div className="space-y-3 pt-2">
              <div className="block text-xs font-semibold text-zinc-300">
                Các sự kiện tự động gửi tin nhắn vào Slack:
              </div>

              <div className="space-y-2">
                <label className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300">Gửi thông báo khi bạn được gán Task mới</span>
                  <input
                    type="checkbox"
                    checked={slackForm.notifyOnTaskAssign}
                    onChange={(e) => setSlackForm({ ...slackForm, notifyOnTaskAssign: e.target.checked })}
                    className="accent-indigo-600 w-4 h-4"
                  />
                </label>

                <label className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300">Cảnh báo tự động khi Task bị quá hạn (Overdue)</span>
                  <input
                    type="checkbox"
                    checked={slackForm.notifyOnTaskOverdue}
                    onChange={(e) => setSlackForm({ ...slackForm, notifyOnTaskOverdue: e.target.checked })}
                    className="accent-indigo-600 w-4 h-4"
                  />
                </label>

                <label className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-zinc-300">Nhắc nhở khi được @mention trong bình luận</span>
                  <input
                    type="checkbox"
                    checked={slackForm.notifyOnMention}
                    onChange={(e) => setSlackForm({ ...slackForm, notifyOnMention: e.target.checked })}
                    className="accent-indigo-600 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => onDisconnect(app.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 text-xs font-semibold transition"
              >
                <Unplug className="w-4 h-4" />
                <span>Ngắt kết nối Slack</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <span>Lưu cấu hình Slack</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. GITHUB CONFIGURATION FORM */}
        {app.id === "github" && (
          <form onSubmit={handleSaveGithub} className="space-y-5">
            {/* Account Connected Info */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <div className="text-xs font-semibold text-zinc-400">GitHub Organization / Repository:</div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>{githubForm.repoName}</span>
              </div>
              <div className="text-xs text-zinc-500 font-mono">Tài khoản kết nối: @{githubForm.connectedUser}</div>
            </div>

            {/* Auto Close Task on PR Merge */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-zinc-100">
                    Tự động đóng Task khi Merge Pull Request (Smart Commit Sync)
                  </span>
                  <span className="block text-[11px] text-zinc-400 mt-0.5">
                    Khi gõ từ khóa kèm Task ID trong PR (VD: <code>Fixes #TASK-123</code>), TaskFlow sẽ tự chuyển trạng thái Task sang Done.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={githubForm.autoCloseOnPRMerge}
                  onChange={(e) => setGithubForm({ ...githubForm, autoCloseOnPRMerge: e.target.checked })}
                  className="accent-indigo-600 w-5 h-5"
                />
              </div>

              {githubForm.autoCloseOnPRMerge && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400">Các từ khóa kích hoạt:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {githubForm.prKeywords.map((kw) => (
                      <span key={kw} className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-emerald-400">
                        {kw} #TASK-ID
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sync Issue Comments */}
            <label className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between cursor-pointer">
              <span className="text-xs text-zinc-300">Đồng bộ hai chiều bình luận từ PR GitHub sang TaskFlow</span>
              <input
                type="checkbox"
                checked={githubForm.syncIssueComments}
                onChange={(e) => setGithubForm({ ...githubForm, syncIssueComments: e.target.checked })}
                className="accent-indigo-600 w-4 h-4"
              />
            </label>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => onDisconnect(app.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 text-xs font-semibold transition"
              >
                <Unplug className="w-4 h-4" />
                <span>Ngắt kết nối GitHub</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <span>Lưu cấu hình GitHub</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. OTHER APPS GENERAL CONFIG */}
        {app.id !== "slack" && app.id !== "github" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Kết nối OAuth2 Đang Hoạt Động
              </div>
              <p className="text-xs text-zinc-400">
                Ứng dụng {app.name} đã được cấp quyền truy cập dữ liệu Workspace. Bạn có thể bật/tắt quyền đồng bộ dữ liệu hoặc hủy kết nối bất kỳ lúc nào.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => onDisconnect(app.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 text-xs font-semibold transition"
              >
                <Unplug className="w-4 h-4" />
                <span>Ngắt kết nối {app.name}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
