 
"use client";

import React from "react";
import { X, Settings, Mail, Bell, Save } from "lucide-react";
import { NotificationSettings } from "./types";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (newSettings: NotificationSettings) => void;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: NotificationSettingsModalProps) {
  const [localSettings, setLocalSettings] = React.useState<NotificationSettings>(settings);

  React.useEffect(() => {
    const syncTimer = window.setTimeout(() => setLocalSettings(settings), 0);
    return () => window.clearTimeout(syncTimer);
  }, [settings]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <>
      <button type="button" aria-label="Đóng cài đặt thông báo" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Cài đặt kênh Thông báo</h3>
              <p className="text-xs text-zinc-400">Tùy chỉnh nhận thông báo qua Email, Push & Sound</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Toggles */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          {/* Email Notifications */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Thông báo qua Email</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-300 text-xs">Khi có ai đó nhắc đến bạn (@mention)</span>
                <input
                  type="checkbox"
                  checked={localSettings.emailMentions}
                  onChange={() => handleToggle("emailMentions")}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-300 text-xs">Cảnh báo công việc sắp hết hạn (Deadline)</span>
                <input
                  type="checkbox"
                  checked={localSettings.emailDeadlines}
                  onChange={() => handleToggle("emailDeadlines")}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-300 text-xs">Khi được giao công việc mới</span>
                <input
                  type="checkbox"
                  checked={localSettings.emailAssignments}
                  onChange={() => handleToggle("emailAssignments")}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Browser Push Notifications */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <Bell className="w-4 h-4 text-blue-400" />
              <span>Thông báo đẩy Trình duyệt (Push Notifications)</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-300 text-xs">Thông báo đẩy khi có @mention</span>
                <input
                  type="checkbox"
                  checked={localSettings.pushMentions}
                  onChange={() => handleToggle("pushMentions")}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-300 text-xs">Thông báo đẩy khi công việc hết hạn</span>
                <input
                  type="checkbox"
                  checked={localSettings.pushDeadlines}
                  onChange={() => handleToggle("pushDeadlines")}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Lưu cài đặt</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
