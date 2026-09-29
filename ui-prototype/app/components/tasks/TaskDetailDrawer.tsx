 
"use client";

import { startTransition, useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Copy,
  Check,
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { TaskSummary, TaskAttachment, TaskChecklistItem, TaskComment, Member } from "@/app/types/domain";
import { taskService } from "@/app/services/task-service";
import { collaborationService } from "@/app/services/collaboration-service";
import { TaskChecklistModule } from "./TaskChecklistModule";
import { TaskAttachmentModule } from "./TaskAttachmentModule";
import { TaskCommentModule } from "./TaskCommentModule";
import { TaskSidebarAttributes } from "./TaskSidebarAttributes";

interface TaskDetailDrawerProps {
  workspaceId: string;
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  initialTask?: TaskSummary;
}

export function TaskDetailDrawer({
  workspaceId,
  taskId,
  isOpen,
  onClose,
  initialTask,
}: TaskDetailDrawerProps) {
  const [task, setTask] = useState<TaskSummary | null>(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Auto-save state
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copiedLink, setCopiedLink] = useState(false);

  // Text inputs for title & description
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load task detail, checklist, attachments, comments
  useEffect(() => {
    if (!isOpen || !taskId) return;

    let isMounted = true;
    startTransition(() => setLoading(true));

    // Fetch real data from API
    Promise.all([
      taskService.get(workspaceId, taskId),
      taskService.checklist(workspaceId, taskId).catch(() => []),
      taskService.attachments(workspaceId, taskId).catch(() => []),
      taskService.comments(workspaceId, taskId).catch(() => []),
      collaborationService.members(workspaceId).catch(() => []),
    ])
      .then(([fetchedTask, fetchedChecklist, fetchedAttachments, fetchedComments, fetchedMembers]) => {
        if (!isMounted) return;
        setTask(fetchedTask);
        setTitle(fetchedTask.title);
        setDescription(fetchedTask.description || "");
        setChecklist(fetchedChecklist);
        setAttachments(fetchedAttachments);
        setComments(fetchedComments);
        setMembers(fetchedMembers);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, taskId, workspaceId, initialTask]);

  // Debounced Auto-save for Title & Description
  const saveTaskFields = useCallback(
    async (updated: Partial<TaskSummary>) => {
      if (!task) return;

      setSavingStatus("saving");
      try {
        const result = await taskService.update(workspaceId, taskId, {
          expectedVersion: task.version,
          title: updated.title ?? task.title,
          description: updated.description ?? task.description,
          priority: updated.priority ?? task.priority,
          dueAt: updated.dueAt ?? task.dueAt,
          columnId: updated.columnId ?? task.columnId,
        });
        setTask(result);
        setSavingStatus("saved");
        setTimeout(() => setSavingStatus("idle"), 2500);
      } catch (err) {
        console.error(err);
        setSavingStatus("error");
      }
    },
    [task, taskId, workspaceId]
  );

  const handleTitleBlur = () => {
    if (task && title.trim() !== task.title) {
      setTask({ ...task, title: title.trim() });
      saveTaskFields({ title: title.trim() });
    }
  };

  const handleDescBlur = () => {
    if (task && description !== task.description) {
      setTask({ ...task, description });
      saveTaskFields({ description });
    }
    setIsEditingDesc(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/app/tasks/${taskId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── Checklist Handlers ─────────────────────────────────────────
  const handleAddChecklist = async (itemTitle: string) => {
    const created = await taskService.createChecklistItem(workspaceId, taskId, itemTitle);
    setChecklist((prev) => [...prev, created]);
  };

  const handleToggleChecklist = async (item: TaskChecklistItem) => {
    const updatedStatus = !item.completed;
    setChecklist((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, completed: updatedStatus } : i))
    );
    await taskService.updateChecklistItem(workspaceId, taskId, item.id, { completed: updatedStatus });
  };

  const handleUpdateChecklistTitle = async (itemId: string, newTitle: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, title: newTitle } : i))
    );
    await taskService.updateChecklistItem(workspaceId, taskId, itemId, { title: newTitle });
  };

  const handleDeleteChecklist = async (item: TaskChecklistItem) => {
    setChecklist((prev) => prev.filter((i) => i.id !== item.id));
    await taskService.deleteChecklistItem(workspaceId, taskId, item.id);
  };

  // ── Attachment Handlers ────────────────────────────────────────
  const handleUploadAttachment = async (file: File) => {
    const created = await taskService.uploadAttachment(workspaceId, taskId, file);
    setAttachments((prev) => [...prev, created]);
  };

  const handleDownloadAttachment = async (item: TaskAttachment) => {
    const res = await taskService.attachmentDownload(workspaceId, taskId, item.id);
    window.location.assign(res.url);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    await taskService.deleteAttachment(workspaceId, taskId, attachmentId);
  };

  // ── Comment Handlers ───────────────────────────────────────────
  const handleSendComment = async (body: string) => {
    const created = await taskService.comment(workspaceId, taskId, body);
    setComments((prev) => [...prev, created]);
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await taskService.deleteComment(workspaceId, commentId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Đóng chi tiết công việc"
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed top-0 right-0 z-50 h-full w-full lg:w-[68vw] xl:w-[65vw] max-w-5xl bg-zinc-950 border-l border-zinc-800/80 text-zinc-100 shadow-2xl flex flex-col transition-all duration-300 transform translate-x-0">
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60 backdrop-blur-md">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">
              {task?.projectName || "SaaS TaskFlow"}
            </span>
            <ChevronRight size={14} className="text-zinc-600" />
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-medium text-emerald-400">
              {task?.columnName || "Chi tiết công việc"}
            </span>
          </div>

          {/* Header Right Actions & Auto-save Status */}
          <div className="flex items-center gap-3">
            {/* Auto-save status feedback badge */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              {savingStatus === "saving" && (
                <>
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                  <span className="text-amber-400 font-medium">Đang lưu...</span>
                </>
              )}
              {savingStatus === "saved" && (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Đã lưu tất cả thay đổi</span>
                </>
              )}
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Sao chép link task"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedLink ? "Đã chép" : "Copy link"}</span>
            </button>

            {/* Close ESC Button */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Đóng (Phím ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Main Body (2 Columns) ── */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-emerald-500 mb-2" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* ── LEFT COLUMN (65% width) ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 lg:border-r border-zinc-800/80 pr-6">
              {/* Task Title (Inline Editable) */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  placeholder="Nhập tiêu đề công việc..."
                  className="w-full rounded-xl bg-transparent border border-transparent hover:border-zinc-800 focus:border-emerald-500 px-2 py-1 text-xl font-extrabold text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
                />
              </div>

              {/* Description (Rich/Markdown Textarea with Preview) */}
              <div className="space-y-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <FileText size={16} className="text-emerald-500" /> Mô tả công việc
                  </h3>
                  <button
                    onClick={() => setIsEditingDesc(!isEditingDesc)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    {isEditingDesc ? "Xem trước" : "Chỉnh sửa"}
                  </button>
                </div>

                {isEditingDesc ? (
                  <textarea
                    ref={descriptionInputRef}
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleDescBlur}
                    placeholder="Thêm mô tả chi tiết công việc..."
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setIsEditingDesc(true);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Chỉnh sửa mô tả công việc"
                    className="min-h-[70px] rounded-xl bg-zinc-950/60 border border-zinc-800/60 p-3 text-xs text-zinc-300 leading-relaxed cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    {description ? (
                      <p className="whitespace-pre-wrap">{description}</p>
                    ) : (
                      <span className="text-zinc-500 italic">Bấm vào đây để thêm mô tả chi tiết...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist Module */}
              <TaskChecklistModule
                workspaceId={workspaceId}
                taskId={taskId}
                items={checklist}
                onAdd={handleAddChecklist}
                onToggle={handleToggleChecklist}
                onUpdateTitle={handleUpdateChecklistTitle}
                onDelete={handleDeleteChecklist}
                onReorder={(newItems) => setChecklist(newItems)}
              />

              {/* Attachments Module */}
              <TaskAttachmentModule
                attachments={attachments}
                onUpload={handleUploadAttachment}
                onDownload={handleDownloadAttachment}
                onDelete={handleDeleteAttachment}
              />

              {/* Comments & Activity Log Module */}
              <TaskCommentModule
                comments={comments}
                members={members}
                onSendComment={handleSendComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>

            {/* ── RIGHT COLUMN (35% width Sidebar) ── */}
            <div className="w-80 lg:w-96 shrink-0 overflow-y-auto p-6 bg-zinc-950/80">
              {task && (
                <TaskSidebarAttributes
                  task={task}
                  members={members}
                  onUpdate={saveTaskFields}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
