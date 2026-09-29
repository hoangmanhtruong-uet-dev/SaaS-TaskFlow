"use client";

import React from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useNotificationPreferences } from "./useNotificationPreferences";
import { PushChannelCard } from "./PushChannelCard";
import { EmailDigestCard } from "./EmailDigestCard";
import { QuietHoursCard } from "./QuietHoursCard";
import { NotificationMatrixCard } from "./NotificationMatrixCard";
import { SlackIntegrationCard } from "./SlackIntegrationCard";
import { FloatingSaveBar } from "./FloatingSaveBar";
import { SettingsNavPill } from "../SettingsNavPill";

export const NotificationSettingsContainer: React.FC = () => {
  const {
    formState,
    isDirty,
    saving,
    toast,
    // Push & Audio
    requestBrowserPermission,
    playTestSound,
    sendTestNotification,
    updatePushChannels,
    // Email Digest
    updateEmailDigest,
    // Quiet Hours
    updateQuietHours,
    // Matrix Actions
    toggleMatrixCell,
    toggleColumnAll,
    // Slack
    updateSlack,
    // Save & Reset
    handleSave,
    handleReset,
  } = useNotificationPreferences();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative pb-28">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : toast.type === "error"
              ? "bg-red-950 border-red-700 text-red-200"
              : "bg-zinc-900 border-zinc-700 text-zinc-200"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="border-b border-zinc-800 pb-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Cấu hình thông báo & Kênh truyền tin</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Cài đặt Thông báo (Notification Preferences)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tùy chỉnh các kênh nhận tin nhắn (Email, In-App, Browser Push, Slack) và thiết lập ma trận thông báo sự kiện
          </p>

          {/* Pill Segmented Control Navigation */}
          <SettingsNavPill />
        </div>

        {/* Khối 1: Kênh Push & Trình duyệt */}
        <PushChannelCard
          config={formState.pushChannels}
          onUpdateConfig={updatePushChannels}
          onRequestPermission={requestBrowserPermission}
          onPlayTestSound={playTestSound}
          onSendTestNotification={sendTestNotification}
        />

        {/* Khối 2: Tần suất Email & Digest */}
        <EmailDigestCard
          settings={formState.emailDigest}
          onUpdateSettings={updateEmailDigest}
        />

        {/* Khối 3: Chế độ Không làm phiền (Quiet Hours) */}
        <QuietHoursCard
          settings={formState.quietHours}
          onUpdateSettings={updateQuietHours}
        />

        {/* Khối 4: Ma trận Nhận Thông báo Mở rộng */}
        <NotificationMatrixCard
          matrix={formState.matrix}
          onToggleCell={toggleMatrixCell}
          onToggleColumnAll={toggleColumnAll}
        />

        {/* Khối 5: Tích hợp Kênh Slack / Teams */}
        <SlackIntegrationCard
          slack={formState.slack}
          onUpdateSlack={updateSlack}
          onShowToast={(_msg) => handleSave()}
        />
      </div>

      {/* Floating Save Bar */}
      <FloatingSaveBar
        isDirty={isDirty}
        saving={saving}
        onReset={handleReset}
        onSave={() => handleSave()}
      />
    </div>
  );
};
