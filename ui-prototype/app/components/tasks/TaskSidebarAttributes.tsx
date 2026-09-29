 
"use client";

import { useState } from "react";
import {
  User,
  Users,
  CalendarDays,
  Tag,
  AlertTriangle,
  ChevronDown,
  Search,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import type { Member, TaskSummary } from "@/app/types/domain";

interface TaskSidebarAttributesProps {
  task: TaskSummary;
  members: Member[];
  onUpdate: (updatedFields: Partial<TaskSummary>) => Promise<void>;
}

export function TaskSidebarAttributes({
  task,
  members,
  onUpdate,
}: TaskSidebarAttributesProps) {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showWatchersDropdown, setShowWatchersDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task.assigneeIds || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(["UI/UX", "System"]);
  const [now] = useState(() => Date.now());

  const priorityBadgeStyles = {
    URGENT: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    HIGH: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    LOW: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };

  const isOverdue =
    task.dueAt && new Date(task.dueAt).getTime() < now && task.columnName !== "Hoàn thành";

  const handleStatusChange = async (newColumnId: string) => {
    await onUpdate({ columnId: newColumnId });
  };

  const handlePriorityChange = async (newPriority: TaskSummary["priority"]) => {
    await onUpdate({ priority: newPriority });
  };

  const handleDueDateChange = async (newDate: string) => {
    await onUpdate({ dueAt: newDate || null });
  };

  const toggleAssignee = async (memberId: string) => {
    const updated = selectedAssignees.includes(memberId)
      ? selectedAssignees.filter((id) => id !== memberId)
      : [...selectedAssignees, memberId];
    setSelectedAssignees(updated);
    await onUpdate({ assigneeIds: updated });
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  return (
    <aside className="space-y-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Thuộc tính công việc</h3>
      </div>

      {/* ── 1. Trạng thái (Status Dropdown) ── */}
      <div className="space-y-1.5">
        <label htmlFor="task-sidebar-status" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Sparkles size={14} className="text-emerald-400" /> Trạng thái
        </label>
        <select
          id="task-sidebar-status"
          value={task.columnId}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 cursor-pointer focus:border-emerald-500 focus:outline-none"
        >
          <option value="todo">🔘 Cần làm (To-do)</option>
          <option value="in-progress">🔵 Đang làm (In Progress)</option>
          <option value="in-review">🟡 Đang đánh giá (In Review)</option>
          <option value="completed">🟢 Hoàn thành (Done)</option>
        </select>
      </div>

      {/* ── 2. Độ ưu tiên (Priority Select) ── */}
      <div className="space-y-1.5">
        <label htmlFor="task-sidebar-priority" className="text-xs font-semibold text-zinc-300">Mức độ ưu tiên</label>
        <select
          id="task-sidebar-priority"
          value={task.priority}
          onChange={(e) => handlePriorityChange(e.target.value as TaskSummary["priority"])}
          className={`w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-bold cursor-pointer focus:border-emerald-500 focus:outline-none ${
            priorityBadgeStyles[task.priority] || priorityBadgeStyles.MEDIUM
          }`}
        >
          <option value="URGENT" className="bg-zinc-900 text-rose-400">🔴 Khẩn cấp (Urgent)</option>
          <option value="HIGH" className="bg-zinc-900 text-rose-300">🟠 Cao (High)</option>
          <option value="MEDIUM" className="bg-zinc-900 text-amber-300">🟡 Trung bình (Medium)</option>
          <option value="LOW" className="bg-zinc-900 text-emerald-300">🟢 Thấp (Low)</option>
        </select>
      </div>

      {/* ── 3. Người thực hiện (Assignee Multi-select) ── */}
      <div className="space-y-1.5 relative">
        <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><User size={14} className="text-blue-400" /> Người thực hiện</span>
          <span className="text-[10px] text-zinc-500">{selectedAssignees.length} đã chọn</span>
        </div>

        <button
          id="task-sidebar-assignees"
          type="button"
          onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
          className="w-full flex items-center justify-between rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {selectedAssignees.length > 0 ? (
              members
                .filter((m) => selectedAssignees.includes(m.id))
                .slice(0, 3)
                .map((m) => (
                  <span key={m.id} className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white shrink-0">
                    {m.name.slice(0, 2).toUpperCase()}
                  </span>
                ))
            ) : (
              <span className="text-zinc-500 italic">Chưa giao cho ai</span>
            )}
          </div>
          <ChevronDown size={14} className="text-zinc-500" />
        </button>

        {showAssigneeDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-30 space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm thành viên..."
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-7 pr-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredMembers.map((m) => {
                const isChecked = selectedAssignees.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAssignee(m.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-xs text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-200">{m.name}</span>
                    </div>
                    {isChecked && <Check size={14} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Người theo dõi (Watchers Multi-select) ── */}
      <div className="space-y-1.5 relative">
        <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Users size={14} className="text-purple-400" /> Người theo dõi</span>
        </div>
        <button
          id="task-sidebar-watchers"
          type="button"
          onClick={() => setShowWatchersDropdown(!showWatchersDropdown)}
          className="w-full flex items-center justify-between rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-700 transition-colors"
        >
          <span className="text-zinc-500 italic">Thêm người nhận thông báo...</span>
          <ChevronDown size={14} className="text-zinc-500" />
        </button>
      </div>

      {/* ── 5. Hạn hoàn thành (Due Date Picker) ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="task-sidebar-due-date" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <CalendarDays size={14} className="text-amber-400" /> Hạn hoàn thành
          </label>
          {isOverdue && (
            <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
              <AlertTriangle size={11} /> Quá hạn
            </span>
          )}
        </div>
        <input
          id="task-sidebar-due-date"
          type="date"
          value={task.dueAt ? task.dueAt.slice(0, 10) : ""}
          onChange={(e) => handleDueDateChange(e.target.value)}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
        />
      </div>

      {/* ── 6. Nhãn / Tags Selector ── */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Tag size={14} className="text-emerald-400" /> Nhãn / Tags
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              {tag}
              <button type="button" onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))} className="text-zinc-500 hover:text-white">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ── 7. Metadata Info ── */}
      <div className="border-t border-zinc-800 pt-4 space-y-2 text-[11px] text-zinc-500">
        <div className="flex justify-between">
          <span>Người tạo:</span>
          <span className="font-semibold text-zinc-300">Hùng Hoàng</span>
        </div>
        <div className="flex justify-between">
          <span>Ngày tạo:</span>
          <span className="text-zinc-400">25 Th10, 2026</span>
        </div>
        <div className="flex justify-between">
          <span>Cập nhật lần cuối:</span>
          <span className="text-zinc-400">Vừa xong</span>
        </div>
      </div>
    </aside>
  );
}
