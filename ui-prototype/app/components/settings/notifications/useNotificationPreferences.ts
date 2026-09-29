"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  NotificationFormState,
  NotificationChannel,
  BrowserPermissionState,
} from "./types";
import { INITIAL_NOTIFICATION_STATE } from "./constants";

export function useNotificationPreferences() {
  const [formState, setFormState] = useState<NotificationFormState>(INITIAL_NOTIFICATION_STATE);
  const [savedState, setSavedState] = useState<NotificationFormState>(INITIAL_NOTIFICATION_STATE);
  const [saving, setSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  // Detect browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = window.Notification.permission as BrowserPermissionState;
      window.setTimeout(() => {
        setFormState((prev) => ({
          ...prev,
          pushChannels: {
            ...prev.pushChannels,
            permission: perm,
            browserEnabled: perm === "granted",
          },
        }));
      }, 0);
    }
  }, []);

  // Dirty State Tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(savedState);
  }, [formState, savedState]);

  // Request Browser Notification Permission
  const requestBrowserPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Trình duyệt này không hỗ trợ Web Notification API.", "error");
      return;
    }

    try {
      const result = await window.Notification.requestPermission();
      const perm = result as BrowserPermissionState;
      setFormState((prev) => ({
        ...prev,
        pushChannels: {
          ...prev.pushChannels,
          permission: perm,
          browserEnabled: perm === "granted",
        },
      }));

      if (perm === "granted") {
        showToast("Đã cấp quyền Thông báo Trình duyệt thành công!", "success");
      } else if (perm === "denied") {
        showToast(
          "Bạn đã từ chối quyền thông báo. Vui lòng bật lại trong Cài đặt Trình duyệt (Site Settings).",
          "error"
        );
      }
    } catch {
      showToast("Không thể yêu cầu quyền thông báo trình duyệt.", "error");
    }
  };

  // Audio Preview Engine using Web Audio API Synthesizer
  const playTestSound = useCallback((chime: string = "default") => {
    try {
      const AudioCtx = window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq1 = chime === "subtle" ? 440 : chime === "chime" ? 880 : 587.33; // D5
      const freq2 = chime === "subtle" ? 554 : chime === "chime" ? 1108 : 880;   // A5

      osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq2, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.5);
    } catch {
      // Ignore audio context autoplay restrictions
    }
  }, []);

  // Send Test Notification
  const sendTestNotification = () => {
    // 1. Play audio chime
    if (formState.pushChannels.soundEnabled) {
      playTestSound(formState.pushChannels.soundChime);
    }

    // 2. Browser Desktop Notification if granted
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      window.Notification.permission === "granted"
    ) {
      new window.Notification("TaskFlow Test Notification 🔔", {
        body: "Trường Hoàng vừa gán cho bạn công việc: 'Tối ưu hóa Notifications Matrix Page'",
        icon: "/favicon.ico",
      });
    }

    showToast("Đã gửi thông báo thử nghiệm! Kiểm tra âm thanh & popup thiết bị.", "success");
  };

  // Matrix Cell Toggle
  const toggleMatrixCell = (rowId: string, channel: NotificationChannel) => {
    setFormState((prev) => ({
      ...prev,
      matrix: prev.matrix.map((row) => {
        if (row.id === rowId) {
          return { ...row, [channel]: !row[channel] };
        }
        return row;
      }),
    }));
  };

  // Matrix Column Bulk Toggle (Select All / Unselect All for a column)
  const toggleColumnAll = (channel: NotificationChannel) => {
    setFormState((prev) => {
      const allChecked = prev.matrix.every((row) => row[channel]);
      const nextChecked = !allChecked;
      return {
        ...prev,
        matrix: prev.matrix.map((row) => ({ ...row, [channel]: nextChecked })),
      };
    });
  };

  // Form Updaters
  const updatePushChannels = (updater: Partial<typeof formState.pushChannels>) => {
    setFormState((prev) => ({
      ...prev,
      pushChannels: { ...prev.pushChannels, ...updater },
    }));
  };

  const updateEmailDigest = (updater: Partial<typeof formState.emailDigest>) => {
    setFormState((prev) => ({
      ...prev,
      emailDigest: { ...prev.emailDigest, ...updater },
    }));
  };

  const updateQuietHours = (updater: Partial<typeof formState.quietHours>) => {
    setFormState((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, ...updater },
    }));
  };

  const updateSlack = (updater: Partial<typeof formState.slack>) => {
    setFormState((prev) => ({
      ...prev,
      slack: { ...prev.slack, ...updater },
    }));
  };

  // Save Settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 700));
      setSavedState({ ...formState });
      showToast("Đã lưu tất cả cấu hình thông báo thành công!", "success");
    } catch {
      showToast("Lỗi khi lưu cấu hình thông báo.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormState({ ...savedState });
    showToast("Đã hủy bỏ các thay đổi chưa lưu.", "info");
  };

  return {
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
  };
}
