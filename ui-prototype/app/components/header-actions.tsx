 
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, Bell, User, Check, Settings, LogOut, Shield, ExternalLink } from "lucide-react";
import { collaborationService } from "@/app/services/collaboration-service";
import type { Notification } from "@/app/types/domain";

import { QuickCreateTaskModal } from "./tasks/QuickCreateTaskModal";
import { useWorkspace } from "./providers/workspace-provider";

export function HeaderActions() {
  const workspace = useWorkspace();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Global keypress listener for 'C' or 'Ctrl+K'
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (!isInputActive && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        setShowCreateModal(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications when popover opens
  useEffect(() => {
    if (showNotifications) {
      window.setTimeout(() => setLoadingNotifs(true), 0);
      collaborationService
        .notifications()
        .then((items) => setNotifications(items ?? []))
        .catch(() => setNotifications([]))
        .finally(() => setLoadingNotifs(false));
    }
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    try {
      await collaborationService.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, readAt: new Date().toISOString() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await collaborationService.markRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* ── Nút Tạo công việc ── */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="header-action-btn-primary flex items-center gap-1.5 cursor-pointer"
        title="Tạo công việc mới (Phím C)"
      >
        <Plus size={16} />
        <span>Tạo công việc</span>
      </button>

      {/* ── Nút Thông báo ── */}
      <div className="relative" ref={notifRef}>
        <button
          className="icon-circle-btn relative"
          aria-label="Thông báo"
          title="Thông báo"
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowUserMenu(false);
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Thông báo */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-xl z-50 text-left text-[var(--ink)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-emerald-600" />
                <h3 className="text-sm font-bold">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    {unreadCount} chưa đọc
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <Check size={12} /> Đánh dấu đã đọc
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {loadingNotifs ? (
                <div className="py-6 text-center text-xs text-gray-400">Đang tải thông báo...</div>
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkRead(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleMarkRead(item.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      item.readAt
                        ? "bg-gray-50/50 border-gray-100 text-gray-500"
                        : "bg-emerald-50/40 border-emerald-100 text-gray-800 font-medium hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900">{item.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2">{item.body}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  <Bell size={24} className="mx-auto mb-2 opacity-30 text-gray-500" />
                  Không có thông báo mới nào
                </div>
              )}
            </div>

            <div className="border-t border-[var(--line)] pt-2 mt-3 text-center">
              <Link
                href="/app/notifications"
                onClick={() => setShowNotifications(false)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 py-1"
              >
                Xem tất cả trang thông báo <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Nút Tài khoản / Cá nhân ── */}
      <div className="relative" ref={userMenuRef}>
        <button
          className="icon-circle-btn"
          aria-label="Tài khoản"
          title="Menu cá nhân"
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowNotifications(false);
          }}
        >
          <User size={18} />
        </button>

        {/* Dropdown Menu Cá nhân */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-xl z-50 text-left text-xs text-[var(--ink)]">
            <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
              <p className="font-bold text-gray-900">Tài khoản cá nhân</p>
              <p className="text-[11px] text-gray-500 truncate">TaskFlow Workspace</p>
            </div>

            <div className="space-y-0.5">
              <Link
                href="/app/settings/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
              >
                <User size={15} className="text-gray-500" />
                <span>Trang cá nhân (Profile)</span>
              </Link>

              <Link
                href="/app/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
              >
                <Settings size={15} className="text-gray-500" />
                <span>Cài đặt chung</span>
              </Link>

              <Link
                href="/app/settings/notifications"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
              >
                <Bell size={15} className="text-gray-500" />
                <span>Cài đặt thông báo</span>
              </Link>

              <Link
                href="/app/members"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
              >
                <Shield size={15} className="text-gray-500" />
                <span>Quản lý thành viên</span>
              </Link>
            </div>

            <div className="border-t border-[var(--line)] pt-1 mt-1">
              <form action="/auth/signout?next=/" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={15} />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Quick Create Task Modal */}
      <QuickCreateTaskModal
        workspaceId={workspace.id}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
