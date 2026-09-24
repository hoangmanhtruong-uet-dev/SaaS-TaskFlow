"use client";

import { useMemo, useState } from "react";
import { CheckSquare, Download, MessageCircle, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import type { Member, TaskAttachment, TaskChecklistItem, TaskComment, TaskSummary, WorkspaceRole } from "@/app/types/domain";
import { taskService } from "@/app/services/task-service";
import { collaborationService } from "@/app/services/collaboration-service";
import { ApiClientError } from "@/app/services/http-client";
import { useConnectionSync } from "@/app/hooks/use-connection-sync";
import { Badge, Button, Field } from "@/app/components/ui";
import { ConnectionStatus } from "./kanban-board";

export function TaskEditor({
  workspaceId,
  workspaceRole,
  initialTask,
  initialComments,
  initialAttachments,
  initialChecklist,
  refetch,
}: {
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  initialTask: TaskSummary;
  initialComments: TaskComment[];
  initialAttachments: TaskAttachment[];
  initialChecklist: TaskChecklistItem[];
  refetch: () => void;
}) {
  void workspaceRole;
  const [task, setTask] = useState(initialTask);
  const [comments, setComments] = useState(initialComments);
  const [attachments, setAttachments] = useState(initialAttachments);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [checklistBusy, setChecklistBusy] = useState("");
  const [attachmentBusy, setAttachmentBusy] = useState("");
  const [message, setMessage] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [checklistTitle, setChecklistTitle] = useState("");
  const connection = useConnectionSync(refetch);

  const completedChecklist = checklist.filter((item) => item.completed).length;
  const checklistProgress = checklist.length ? Math.round((completedChecklist / checklist.length) * 100) : 0;

  const suggestions = useMemo(() => {
    const query = commentBody.match(/@([^\s@]*)$/)?.[1]?.toLowerCase();
    if (query === undefined) return [];
    return members
      .filter((member) => member.email.toLowerCase().includes(query) || member.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [commentBody, members]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await taskService.update(workspaceId, task.id, {
        expectedVersion: task.version,
        title: String(form.get("title")),
        description: String(form.get("description")),
        priority: String(form.get("priority")) as TaskSummary["priority"],
        dueAt: String(form.get("dueAt")) || null,
      });
      setTask(updated);
      setMessage("Đã lưu thay đổi.");
    } catch (value) {
      if (value instanceof ApiClientError && value.code === "TASK_VERSION_CONFLICT") {
        setMessage("Công việc vừa được cập nhật ở nơi khác. Đang tải phiên bản mới...");
        refetch();
      } else {
        setMessage(value instanceof Error ? value.message : "Không thể lưu thay đổi");
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendComment(event: React.FormEvent) {
    event.preventDefault();
    if (!commentBody.trim()) return;
    setCommenting(true);
    setMessage("");
    try {
      const created = await taskService.comment(workspaceId, task.id, commentBody);
      setComments((items) => [...items, created]);
      setCommentBody("");
    } catch (value) {
      setMessage(value instanceof Error ? value.message : "Không thể gửi bình luận");
    } finally {
      setCommenting(false);
    }
  }

  function openSuggestions() {
    if (!members.length) collaborationService.members(workspaceId).then(setMembers).catch(() => setMembers([]));
  }

  function chooseMention(member: Member) {
    setCommentBody((value) => value.replace(/@([^\s@]*)$/, `@${member.email} `));
  }

  async function uploadAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Tệp tối đa 10 MB.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const created = await taskService.uploadAttachment(workspaceId, task.id, file);
      setAttachments((items) => [...items, created]);
      setMessage("Đã tải tệp lên an toàn.");
    } catch (value) {
      setMessage(value instanceof Error ? value.message : "Không thể tải tệp lên");
    } finally {
      setUploading(false);
    }
  }

  async function downloadAttachment(item: TaskAttachment) {
    setAttachmentBusy(item.id);
    setMessage("");
    try {
      const result = await taskService.attachmentDownload(workspaceId, task.id, item.id);
      window.location.assign(result.url);
    } catch (value) {
      setMessage(value instanceof Error ? value.message : "Không thể tải tệp");
    } finally {
      setAttachmentBusy("");
    }
  }

  async function removeAttachment(item: TaskAttachment) {
    setAttachmentBusy(item.id);
    setMessage("");
    try {
      await taskService.deleteAttachment(workspaceId, task.id, item.id);
      setAttachments((items) => items.filter((value) => value.id !== item.id));
      setMessage("Đã xóa tệp.");
    } catch (value) {
      setMessage(value instanceof Error ? value.message : "Không thể xóa tệp");
    } finally {
      setAttachmentBusy("");
    }
  }

  async function addChecklistItem(event: React.FormEvent) {
    event.preventDefault();
    const title = checklistTitle.trim();
    if (!title) return;
    setAddingChecklist(true);
    setMessage("");
    try {
      const created = await taskService.createChecklistItem(workspaceId, task.id, title);
      setChecklist((items) => [...items, created]);
      setChecklistTitle("");
    } catch (value) {
      setMessage(value instanceof Error ? value.message : "Không thể thêm mục checklist");
    } finally {
      setAddingChecklist(false);
    }
  }

  async function toggleChecklistItem(item: TaskChecklistItem) {
    const snapshot = checklist;
    setChecklistBusy(item.id);
    setMessage("");
    setChecklist((items) => items.map((value) => (value.id === item.id ? { ...value, completed: !value.completed } : value)));
    try {
      const updated = await taskService.updateChecklistItem(workspaceId, task.id, item.id, { completed: !item.completed });
      setChecklist((items) => items.map((value) => (value.id === item.id ? updated : value)));
    } catch (value) {
      setChecklist(snapshot);
      setMessage(value instanceof Error ? value.message : "Không thể cập nhật checklist");
    } finally {
      setChecklistBusy("");
    }
  }

  async function removeChecklistItem(item: TaskChecklistItem) {
    setChecklistBusy(item.id);
    setMessage("");
    try {
      await taskService.deleteChecklistItem(workspaceId, task.id, item.id);
      setChecklist((items) => items.filter((value) => value.id !== item.id));
    } catch (value) {
      setMessage(value instanceof Error ? value.message : "Không thể xóa mục checklist");
    } finally {
      setChecklistBusy("");
    }
  }

  return (
    <div className="task-detail-live">
      <div className="board-sync">
        <ConnectionStatus state={connection} />
        {message && <span className="save-message">{message}</span>}
      </div>

      <form className="production-form ui-card task-edit-form" onSubmit={save}>
        <Field name="title" label="Tiêu đề" defaultValue={task.title} required />
        <label className="field">
          <span>Mô tả</span>
          <textarea name="description" defaultValue={task.description} />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Ưu tiên</span>
            <select name="priority" defaultValue={task.priority}>
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </label>
          <Field name="dueAt" label="Hạn hoàn thành" type="date" defaultValue={task.dueAt?.slice(0, 10)} />
        </div>
        <Button type="submit" disabled={saving || connection !== "connected"}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>

      <section className="checklist-panel ui-card">
        <header>
          <CheckSquare size={18} />
          <h2>Checklist</h2>
          <Badge tone="gray">
            {completedChecklist}/{checklist.length}
          </Badge>
          <strong>{checklistProgress}%</strong>
        </header>
        <div
          className="checklist-progress"
          role="progressbar"
          aria-label="Tiến độ checklist"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={checklistProgress}
        >
          <span style={{ width: `${checklistProgress}%` }} />
        </div>
        <div className="checklist-list">
          {checklist.length ? (
            checklist.map((item) => (
              <article className={item.completed ? "completed" : ""} key={item.id}>
                <input
                  type="checkbox"
                  aria-label={`Đánh dấu ${item.title}`}
                  checked={item.completed}
                  disabled={checklistBusy === item.id || connection !== "connected"}
                  onChange={() => void toggleChecklistItem(item)}
                />
                <span>{item.title}</span>
                <button
                  type="button"
                  aria-label={`Xóa mục ${item.title}`}
                  disabled={checklistBusy === item.id || connection !== "connected"}
                  onClick={() => void removeChecklistItem(item)}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          ) : (
            <p className="column-empty">Chưa có mục checklist.</p>
          )}
        </div>
        <form className="checklist-form" onSubmit={addChecklistItem}>
          <label htmlFor="checklist-title">Thêm mục checklist</label>
          <div>
            <input
              id="checklist-title"
              value={checklistTitle}
              maxLength={240}
              onChange={(event) => setChecklistTitle(event.target.value)}
              placeholder="Ví dụ: Kiểm tra bản mobile"
            />
            <Button
              type="submit"
              disabled={
                addingChecklist || !checklistTitle.trim() || checklist.length >= 100 || connection !== "connected"
              }
            >
              <Plus size={16} />
              {addingChecklist ? "Đang thêm..." : "Thêm mục"}
            </Button>
          </div>
        </form>
      </section>

      <section className="attachments-panel ui-card">
        <header>
          <Paperclip size={18} />
          <h2>Tệp đính kèm</h2>
          <Badge tone="gray">{attachments.length}</Badge>
          <label className="attachment-upload">
            <Upload size={16} />
            <span>{uploading ? "Đang tải..." : "Thêm tệp"}</span>
            <input
              type="file"
              disabled={uploading || connection !== "connected"}
              accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv,.docx,.xlsx"
              onChange={uploadAttachment}
            />
          </label>
        </header>
        <p className="attachment-help">Tối đa 10 MB · JPG, PNG, WebP, PDF, TXT, CSV, DOCX hoặc XLSX</p>
        <div className="attachment-list">
          {attachments.length ? (
            attachments.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.fileName}</strong>
                  <small>
                    {(item.size / 1024).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} KB ·{" "}
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </small>
                </div>
                <button
                  type="button"
                  aria-label={`Tải ${item.fileName}`}
                  disabled={attachmentBusy === item.id}
                  onClick={() => void downloadAttachment(item)}
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Xóa ${item.fileName}`}
                  disabled={attachmentBusy === item.id}
                  onClick={() => void removeAttachment(item)}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          ) : (
            <p className="column-empty">Chưa có tệp đính kèm.</p>
          )}
        </div>
      </section>

      <section className="comments-panel ui-card">
        <header>
          <MessageCircle size={18} />
          <h2>Bình luận</h2>
          <Badge tone="gray">{comments.length}</Badge>
        </header>
        <div className="comment-list">
          {comments.length ? (
            comments.map((comment) => (
              <article className={comment.hidden || comment.deleted ? "muted" : ""} key={comment.id}>
                <strong>{comment.authorName}</strong>
                <p>{comment.body}</p>
                <small>{new Date(comment.createdAt).toLocaleString("vi-VN")}</small>
              </article>
            ))
          ) : (
            <p className="column-empty">Chưa có bình luận.</p>
          )}
        </div>
        <form className="comment-form" onSubmit={sendComment}>
          <label className="field">
            <span>Thêm bình luận</span>
            <textarea
              value={commentBody}
              onFocus={openSuggestions}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Viết bình luận; dùng @email để nhắc thành viên..."
            />
          </label>
          {suggestions.length > 0 && (
            <div className="mention-suggestions" role="listbox">
              {suggestions.map((member) => (
                <button type="button" key={member.id} onClick={() => chooseMention(member)}>
                  <strong>{member.name}</strong>
                  <small>@{member.email}</small>
                </button>
              ))}
            </div>
          )}
          <Button type="submit" disabled={commenting || !commentBody.trim() || connection !== "connected"}>
            {commenting ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </form>
      </section>
    </div>
  );
}
