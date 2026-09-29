 
"use client";

import React, { useState } from "react";
import {
  AtSign,
  UserCheck,
  Clock,
  ShieldAlert,
  UserPlus,
  Check,
  Trash2,
  Send,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { NotificationItem, NotificationType } from "./types";

interface NotificationCardProps {
  item: NotificationItem;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (item: NotificationItem) => void;
  onSendReply: (id: string, replyText: string) => void;
}

export function NotificationCard({
  item,
  onToggleRead,
  onDelete,
  onSelect,
  onSendReply,
}: NotificationCardProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyInput, setReplyInput] = useState("");

  const getTypeBadgeIcon = (type: NotificationType) => {
    switch (type) {
      case "mention":
        return (
          <div className="p-1 rounded-full bg-blue-500 text-white shadow" title="Nhắc đến">
            <AtSign className="w-3 h-3" />
          </div>
        );
      case "assignment":
        return (
          <div className="p-1 rounded-full bg-emerald-500 text-white shadow" title="Phân công">
            <UserCheck className="w-3 h-3" />
          </div>
        );
      case "deadline":
        return (
          <div className="p-1 rounded-full bg-rose-500 text-white shadow animate-pulse" title="Hạn chót">
            <Clock className="w-3 h-3" />
          </div>
        );
      case "invite":
        return (
          <div className="p-1 rounded-full bg-purple-500 text-white shadow" title="Lời mời">
            <UserPlus className="w-3 h-3" />
          </div>
        );
      case "system":
      default:
        return (
          <div className="p-1 rounded-full bg-amber-500 text-white shadow" title="Hệ thống">
            <ShieldAlert className="w-3 h-3" />
          </div>
        );
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    onSendReply(item.id, replyInput);
    setReplyInput("");
    setShowReplyBox(false);
  };

  return (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button, input, form")) return;
        onSelect(item);
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(item);
        }
      }}
      role="button"
      tabIndex={0}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-md space-y-3 ${
        !item.read
          ? "bg-zinc-900/95 border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-950/10"
          : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700 opacity-90"
      }`}
    >
      {/* Unread Left Border Glow Indicator */}
      {!item.read && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-emerald-500 shadow-md" />
      )}

      {/* Card Header & Body */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Avatar + Type Badge Overlay */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow">
              {item.actorAvatar ?? item.actorName.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1">
              {getTypeBadgeIcon(item.type)}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="text-xs sm:text-sm text-zinc-200 leading-snug">
              <strong className="text-zinc-100 font-bold">{item.actorName}</strong>{" "}
              <span className="text-zinc-300">{item.title}</span>
              {item.targetTitle && (
                <span className="text-emerald-400 font-semibold block sm:inline sm:ml-1">
                  &quot;{item.targetTitle}&quot;
                </span>
              )}
            </div>

            {/* Snippet body */}
            {item.body && (
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/80">
                {item.body}
              </p>
            )}

            {/* Replied snippet if any */}
            {item.replyText && (
              <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bạn đã phản hồi: &quot;{item.replyText}&quot;</span>
              </div>
            )}

            <div className="text-[11px] text-zinc-500 font-medium">
              {item.createdAt}
            </div>
          </div>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Quick Reply Button (if supported) */}
          {item.quickReplySupported && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReplyBox(!showReplyBox);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
              title="Trả lời nhanh"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          {/* Open Task */}
          {item.targetId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
              title="Xem chi tiết công việc"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* Toggle Read */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(item.id);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title={item.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
          >
            <Check className={`w-4 h-4 ${item.read ? "text-zinc-600" : "text-emerald-400"}`} />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Xóa thông báo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Reply Input Form */}
      {showReplyBox && (
        <form
          onSubmit={handleReplySubmit}
          className="flex items-center gap-2 pt-2 border-t border-zinc-800 animate-fadeIn"
        >
          <input
            type="text"
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            placeholder="Nhập câu trả lời nhanh..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      )}
    </div>
  );
}
