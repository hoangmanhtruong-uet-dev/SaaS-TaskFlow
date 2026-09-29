 
"use client";

import { startTransition, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Plus,
  FolderKanban,
  FileText,
  User,
  CalendarDays,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Database,
  LayoutTemplate,
  Paperclip,
} from "lucide-react";
import { projectService, type BoardDto } from "@/app/services/project-service";
import { taskService } from "@/app/services/task-service";
import { collaborationService } from "@/app/services/collaboration-service";
import type { Project, BoardColumn, Member } from "@/app/types/domain";

interface QuickCreateTaskModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultColumnId?: string;
  onTaskCreated?: () => void;
}

export function QuickCreateTaskModal({
  workspaceId,
  isOpen,
  onClose,
  defaultColumnId,
  onTaskCreated,
}: QuickCreateTaskModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const columnIdParam = defaultColumnId || searchParams.get("columnId") || "todo";

  // Data states
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [, setBoards] = useState<BoardDto[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [selectedColumnId, setSelectedColumnId] = useState<string>(columnIdParam);
  const [members, setMembers] = useState<Member[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueAt, setDueAt] = useState<string>("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");
  const [createAnother, setCreateAnother] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: ESC to close, auto-focus title on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Global 'C' or 'Ctrl+K' key listener to open modal if triggered globally
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Load Projects, Boards, Columns, Members
  useEffect(() => {
    if (!isOpen) return;
    startTransition(() => setLoading(true));

    projectService
      .list(workspaceId)
      .then((projList) => {
        setProjects(projList);
        if (projList.length > 0) {
          const firstProj = projList[0];
          setSelectedProjectId(firstProj.id);

          // Fetch boards for first project
          projectService.listBoards(workspaceId, firstProj.id).then((boardList) => {
            setBoards(boardList);
            if (boardList.length > 0) {
              const firstBoard = boardList[0];
              setSelectedBoardId(firstBoard.id);

              // Fetch columns
              projectService.listColumns(workspaceId, firstBoard.id).then((colList) => {
                setColumns(colList);
                const matchCol = colList.find((c) => c.id === columnIdParam);
                setSelectedColumnId(matchCol ? matchCol.id : colList[0]?.id || "todo");
              });
            }
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    collaborationService
      .members(workspaceId)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [isOpen, workspaceId, columnIdParam]);

  // When Project selection changes, reload boards & columns
  const handleProjectChange = async (projId: string) => {
    setSelectedProjectId(projId);
    try {
      const boardList = await projectService.listBoards(workspaceId, projId);
      setBoards(boardList);
      if (boardList.length > 0) {
        setSelectedBoardId(boardList[0].id);
        const colList = await projectService.listColumns(workspaceId, boardList[0].id);
        setColumns(colList);
        setSelectedColumnId(colList[0]?.id || "todo");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await taskService.create(workspaceId, {
        projectId: selectedProjectId,
        boardId: selectedBoardId,
        columnId: selectedColumnId,
        title: title.trim(),
        description,
        priority,
        dueAt: dueAt || null,
        assigneeIds: selectedAssigneeId ? [selectedAssigneeId] : [],
      });

      setSuccessMessage("Đã tạo công việc thành công!");
      onTaskCreated?.();

      if (createAnother) {
        // Reset form for continuous entry
        setTitle("");
        setDescription("");
        setDueAt("");
        setTimeout(() => {
          setSuccessMessage(null);
          titleInputRef.current?.focus();
        }, 1500);
      } else {
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 500);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tạo công việc. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Load Demo Data Action
  const handleLoadDemoData = async () => {
    setSeedingDemo(true);
    try {
      const profileResponse = await fetch("/api/v1/profile", { method: "GET" });
      if (!profileResponse.ok) throw new Error("Không thể xác thực phiên làm việc");
      // Call seed or create default project
      const proj = await projectService.create(workspaceId, {
        name: "Dự án SaaS TaskFlow Mẫu",
        description: "Dự án khởi tạo tự động với các công việc mẫu.",
        visibility: "WORKSPACE",
      });
      setProjects([proj]);
      setSelectedProjectId(proj.id);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSeedingDemo(false);
    }
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
        aria-label="Đóng tạo công việc"
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 transition-all animate-scaleUp">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                <Plus size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">Tạo công việc mới</h2>
                {projects.length > 0 && (
                  <p className="text-xs text-zinc-400">
                    Thêm task vào cột <span className="text-emerald-400 font-semibold">{columns.find(c => c.id === selectedColumnId)?.name || "Cần làm"}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Project Selector & Close */}
            <div className="flex items-center gap-3">
              {projects.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <FolderKanban size={15} className="text-zinc-400" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Đóng (ESC)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── CASE 1: PROJECTS EXIST -> SHOW 2-COLUMN FORM ── */}
          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500">
              <Loader2 size={24} className="animate-spin mx-auto text-emerald-500 mb-2" />
              Đang tải thông tin dự án...
            </div>
          ) : projects.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Messages */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle size={15} /> {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 size={15} /> {successMessage}
                </div>
              )}

              {/* Grid 2 Columns Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Column (65% width) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Task Title Input */}
                  <div className="space-y-1">
                    <label htmlFor="task-title" className="text-xs font-semibold text-zinc-300">
                      Tên công việc <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="task-title"
                      ref={titleInputRef}
                      type="text"
                      required
                      maxLength={180}
                      placeholder="Ví dụ: Thiết kế hệ thống Design Tokens..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm font-bold text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
                    />
                  </div>

                  {/* Task Description */}
                  <div className="space-y-1">
                    <label htmlFor="task-description" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <FileText size={14} className="text-emerald-500" /> Mô tả chi tiết
                    </label>
                    <textarea
                      id="task-description"
                      rows={4}
                      placeholder="Thêm thông tin chi tiết công việc, hướng dẫn hoặc tiêu chí hoàn thành..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Mini Attachment Dropzone */}
                  <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-3 text-center cursor-pointer hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                      <Paperclip size={14} className="text-emerald-500" />
                      <span>Kéo thả tệp đính kèm vào đây (JPG, PNG, PDF tối đa 10MB)</span>
                    </div>
                  </div>
                </div>

                {/* Attributes Sidebar Column (35% width) */}
                <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  {/* Status/Column Selector */}
                  <div className="space-y-1">
                    <label htmlFor="task-column" className="text-xs font-semibold text-zinc-300">Trạng thái (Cột)</label>
                    <select
                      id="task-column"
                      value={selectedColumnId}
                      onChange={(e) => setSelectedColumnId(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Select */}
                  <div className="space-y-1">
                    <label htmlFor="task-priority" className="text-xs font-semibold text-zinc-300">Mức độ ưu tiên</label>
                    <select
                      id="task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="LOW" className="text-emerald-400">🟢 Thấp (Low)</option>
                      <option value="MEDIUM" className="text-amber-400">🟡 Trung bình (Medium)</option>
                      <option value="HIGH" className="text-rose-400">🟠 Cao (High)</option>
                      <option value="URGENT" className="text-rose-500">🔴 Khẩn cấp (Urgent)</option>
                    </select>
                  </div>

                  {/* Assignee Selector */}
                  <div className="space-y-1">
                    <label htmlFor="task-assignee" className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                      <User size={13} className="text-blue-400" /> Người thực hiện
                    </label>
                    <select
                      id="task-assignee"
                      value={selectedAssigneeId}
                      onChange={(e) => setSelectedAssigneeId(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Chưa phân công</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date Picker */}
                  <div className="space-y-1">
                    <label htmlFor="task-due-date" className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                      <CalendarDays size={13} className="text-amber-400" /> Hạn hoàn thành
                    </label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between border-t border-zinc-800 pt-4 gap-3">
                {/* Batch Creation Checkbox */}
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createAnother}
                    onChange={(e) => setCreateAnother(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
                  />
                  <span>Tạo thêm công việc khác (Giữ modal mở)</span>
                </label>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors shadow-md shadow-emerald-600/20"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    <span>Tạo công việc</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ── CASE 2: NO PROJECTS EXIST -> SHOW ENHANCED ONBOARDING CARD ── */
            <div className="py-8 px-4 text-center space-y-6">
              {/* Graphic Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/10">
                <FolderKanban size={36} />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-zinc-100">Bắt đầu bằng việc tạo dự án đầu tiên</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Công việc cần được sắp xếp bên trong một dự án. Hãy tạo dự án mới hoặc sử dụng dữ liệu mẫu để bắt đầu quản lý Tiến độ, Thành viên và Task ngay lập tức!
                </p>
              </div>

              {/* CTA Group */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
                {/* 1. Primary CTA: Create Project */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/app/projects/new");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Plus size={16} />
                  <span>Tạo dự án mới</span>
                </button>

                {/* 2. Secondary CTA: Templates */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/app/projects/new?template=kanban");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <LayoutTemplate size={16} className="text-amber-400" />
                  <span>Tạo từ dự án mẫu</span>
                </button>

                {/* 3. Action CTA: Load Demo Data */}
                <button
                  type="button"
                  disabled={seedingDemo}
                  onClick={handleLoadDemoData}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                >
                  {seedingDemo ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  <span>Nạp dữ liệu mẫu (1-Click Demo)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
