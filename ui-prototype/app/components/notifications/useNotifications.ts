"use client";

import { useState, useMemo, useCallback } from "react";
import {
  NotificationItem,
  NotificationCategoryTab,
  NotificationSettings,
  CategoryTabCounts,
} from "./types";
import { MOCK_NOTIFICATIONS } from "./constants";

const INITIAL_SETTINGS: NotificationSettings = {
  emailMentions: true,
  emailDeadlines: true,
  emailAssignments: false,
  pushMentions: true,
  pushDeadlines: true,
  pushAssignments: true,
  soundEnabled: true,
};

export function useNotifications(initialItems?: NotificationItem[]) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialItems || MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<NotificationCategoryTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Settings & Sound
  const [settings, setSettings] = useState<NotificationSettings>(INITIAL_SETTINGS);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected Task for Slide-over Drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Play subtle audio chime if sound is enabled
  const playChimeSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextConstructor = window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      const audioCtx = new AudioContextConstructor();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext fallback
    }
  }, [soundEnabled]);

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Toggle read status
  const toggleReadStatus = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextRead = !n.read;
          showToast(nextRead ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc", "info");
          return { ...n, read: nextRead };
        }
        return n;
      })
    );
  }, [showToast]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    playChimeSound();
    showToast("Đã đánh dấu tất cả thông báo là Đã đọc!", "success");
  }, [showToast, playChimeSound]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Đã xóa thông báo", "info");
  }, [showToast]);

  // Quick Reply on notification card
  const sendQuickReply = useCallback((id: string, replyText: string) => {
    if (!replyText.trim()) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, replyText: replyText.trim() } : n))
    );
    showToast("Đã gửi phản hồi nhanh thành công!", "success");
  }, [showToast]);

  // Handle clicking notification item (marks read and opens task drawer or link)
  const handleSelectNotification = useCallback((item: NotificationItem) => {
    markAsRead(item.id);
    if (item.targetType === "task" && item.targetId) {
      setSelectedTaskId(item.targetId);
    }
  }, [markAsRead]);

  // Category counts
  const categoryCounts: CategoryTabCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      mention: notifications.filter((n) => n.type === "mention").length,
      assignment: notifications.filter((n) => n.type === "assignment").length,
      system: notifications.filter((n) => n.type === "system" || n.type === "deadline").length,
    };
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchBody = n.body?.toLowerCase().includes(q);
        const matchActor = n.actorName.toLowerCase().includes(q);
        if (!matchTitle && !matchBody && !matchActor) return false;
      }

      // Tab Category
      if (activeTab === "unread" && n.read) return false;
      if (activeTab === "mention" && n.type !== "mention") return false;
      if (activeTab === "assignment" && n.type !== "assignment") return false;
      if (activeTab === "system" && n.type !== "system" && n.type !== "deadline") return false;

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  // Grouped Timeline Engine ("Hôm nay", "Hôm qua", "Tuần này", "Cũ hơn")
  const groupedTimeline = useMemo(() => {
    const groups: { groupKey: string; groupTitle: string; items: NotificationItem[] }[] = [
      { groupKey: "today", groupTitle: "Hôm nay", items: [] },
      { groupKey: "yesterday", groupTitle: "Hôm qua", items: [] },
      { groupKey: "this_week", groupTitle: "Tuần này", items: [] },
      { groupKey: "older", groupTitle: "Cũ hơn", items: [] },
    ];

    filteredNotifications.forEach((n) => {
      const g = groups.find((group) => group.groupKey === n.timeGroup);
      if (g) {
        g.items.push(n);
      } else {
        groups[3].items.push(n);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredNotifications]);

  return {
    notifications: filteredNotifications,
    groupedTimeline,
    unreadCount: categoryCounts.unread,
    categoryCounts,
    // Filters & Search
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    clearSearch: () => setSearchQuery(""),
    // Actions
    markAsRead,
    toggleReadStatus,
    markAllAsRead,
    deleteNotification,
    sendQuickReply,
    handleSelectNotification,
    // Settings & Sound
    settings,
    setSettings,
    isSettingsModalOpen,
    openSettingsModal: () => setIsSettingsModalOpen(true),
    closeSettingsModal: () => setIsSettingsModalOpen(false),
    soundEnabled,
    toggleSound: () => setSoundEnabled((prev) => !prev),
    // Task Detail Drawer
    selectedTaskId,
    setSelectedTaskId,
    closeDrawer: () => setSelectedTaskId(null),
    // Toast
    toast,
  };
}
