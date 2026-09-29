 
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare, History, Send, Loader2, Trash2, AtSign, ShieldCheck } from "lucide-react";
import type { Member, TaskComment, ActivityEvent } from "@/app/types/domain";

interface TaskCommentModuleProps {
  comments: TaskComment[];
  activityLogs?: ActivityEvent[];
  members: Member[];
  currentUserId?: string;
  onSendComment: (body: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export function TaskCommentModule({
  comments,
  activityLogs = [],
  members,
  onSendComment,
  onDeleteComment,
}: TaskCommentModuleProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [commentBody, setCommentBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Extract @query for mention suggestions
  const mentionQuery = useMemo(() => {
    const match = commentBody.match(/@([^\s@]*)$/);
    return match ? match[1].toLowerCase() : null;
  }, [commentBody]);

  const filteredMembers = useMemo(() => {
    if (mentionQuery === null) return [];
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(mentionQuery) ||
          m.email.toLowerCase().includes(mentionQuery)
      )
      .slice(0, 5);
  }, [mentionQuery, members]);

  const handleInsertMention = (member: Member) => {
    setCommentBody((prev) => prev.replace(/@([^\s@]*)$/, `@${member.email} `));
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = commentBody.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      await onSendComment(body);
      setCommentBody("");
      setShowSuggestions(false);
    } finally {
      setSending(false);
    }
  };

  // Format relative time
  const formatTimeAgo = (isoString: string) => {
    if (currentTime === 0) return new Date(isoString).toLocaleDateString("vi-VN");
    const diffMs = currentTime - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return new Date(isoString).toLocaleDateString("vi-VN");
  };

  // Render comment body with highlighted @mentions
  const renderFormattedBody = (body: string) => {
    const parts = body.split(/(@[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-md">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "comments"
                ? "bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquare size={14} />
            <span>Bình luận ({comments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "activity"
                ? "bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <History size={14} />
            <span>Lịch sử ({activityLogs.length || 3})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Comments */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {/* Comments List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="group flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-xs text-white shrink-0">
                    {c.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{c.authorName}</span>
                        <span className="flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-medium text-zinc-400">
                          <ShieldCheck size={10} className="text-emerald-400" /> Member
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{formatTimeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed break-words">
                      {renderFormattedBody(c.body)}
                    </p>
                  </div>
                  {onDeleteComment && (
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-rose-400"
                      title="Xóa bình luận"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500 italic">
                Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
              </div>
            )}
          </div>

          {/* Comment Input Box with Mention Popup */}
          <form onSubmit={handleSend} className="relative space-y-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={3}
                placeholder="Viết bình luận... Gõ '@' để nhắc tên thành viên"
                value={commentBody}
                onChange={(e) => {
                  setCommentBody(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />

              {/* @mention Suggestion Dropdown */}
              {showSuggestions && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl z-30 space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Nhắc tên thành viên
                  </div>
                  {filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleInsertMention(m)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-left transition-colors"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{m.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{m.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <AtSign size={12} /> Dùng @email để tag thông báo
              </span>
              <button
                type="submit"
                disabled={sending || !commentBody.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors shadow-sm"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                <span>Gửi bình luận</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Activity Log Timeline */}
      {activeTab === "activity" && (
        <div className="space-y-3 py-1">
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs text-zinc-300">
                <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-200">
                    {log.actorName || "Thành viên"} <span className="font-normal text-zinc-400">{log.action}</span>
                  </p>
                  <span className="text-[10px] text-zinc-500">{formatTimeAgo(log.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3 text-xs text-zinc-400">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-200">
                    Hùng Hoàng <span className="font-normal text-zinc-400">đã tạo công việc này</span>
                  </p>
                  <span className="text-[10px] text-zinc-500">Hôm qua lúc 14:30</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-200">
                    Nguyễn Văn <span className="font-normal text-zinc-400">đã chuyển trạng thái sang Đang làm</span>
                  </p>
                  <span className="text-[10px] text-zinc-500">5 giờ trước</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
