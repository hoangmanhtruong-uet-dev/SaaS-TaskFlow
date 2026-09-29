 
"use client";

import { useState } from "react";
import { CheckSquare, Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import type { TaskChecklistItem } from "@/app/types/domain";

interface TaskChecklistModuleProps {
  workspaceId: string;
  taskId: string;
  items: TaskChecklistItem[];
  onAdd: (title: string) => Promise<void>;
  onToggle: (item: TaskChecklistItem) => Promise<void>;
  onUpdateTitle: (itemId: string, newTitle: string) => Promise<void>;
  onDelete: (item: TaskChecklistItem) => Promise<void>;
  onReorder?: (newItems: TaskChecklistItem[]) => void;
}

export function TaskChecklistModule({
  items,
  onAdd,
  onToggle,
  onUpdateTitle,
  onDelete,
  onReorder,
}: TaskChecklistModuleProps) {
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  // Auto color transition for Progress Bar
  const progressBarColor =
    progressPercent === 100
      ? "bg-emerald-500"
      : progressPercent >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || adding) return;

    setAdding(true);
    setNewTitle("");
    try {
      await onAdd(title);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (item: TaskChecklistItem) => {
    setBusyId(item.id);
    try {
      await onToggle(item);
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (item: TaskChecklistItem) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  const saveEdit = async (itemId: string) => {
    if (!editingText.trim()) return;
    setBusyId(itemId);
    try {
      await onUpdateTitle(itemId, editingText.trim());
      setEditingId(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: TaskChecklistItem) => {
    setBusyId(item.id);
    try {
      await onDelete(item);
    } finally {
      setBusyId(null);
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    onReorder?.(updated);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-md">
      {/* Header & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
            <CheckSquare size={16} className="text-emerald-500" />
            <h3>Danh sách công việc phụ (Checklist)</h3>
          </div>
          <span className="font-mono text-xs font-semibold text-zinc-400">
            {completedCount}/{items.length} ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between gap-3 rounded-xl border border-zinc-800/60 p-2.5 text-xs transition-all ${
                item.completed ? "bg-zinc-950/40 opacity-70" : "bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700"
              }`}
            >
              {/* Checkbox & Title */}
              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={busyId === item.id}
                  onChange={() => handleToggle(item)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
                />

                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => saveEdit(item.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                    className="flex-1 rounded-lg bg-zinc-950 border border-emerald-500 px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className={`flex-1 truncate cursor-pointer text-left font-medium ${
                      item.completed ? "line-through text-zinc-500" : "text-zinc-200 hover:text-white"
                    }`}
                    title="Click để chỉnh sửa"
                  >
                    {item.title}
                  </button>
                )}
              </div>

              {/* Actions: Move Up/Down & Delete */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {busyId === item.id ? (
                  <Loader2 size={14} className="animate-spin text-zinc-400" />
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, "up")}
                      className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                      title="Di chuyển lên"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, "down")}
                      className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Xóa mục này"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-xs text-zinc-500 italic">
            Chưa có mục checklist nào. Thêm mục mới bên dưới.
          </div>
        )}
      </div>

      {/* Add New Item Input */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Thêm mục checklist mới (nhấn Enter)..."
          value={newTitle}
          maxLength={240}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors shadow-sm"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          <span>Thêm</span>
        </button>
      </form>
    </section>
  );
}
