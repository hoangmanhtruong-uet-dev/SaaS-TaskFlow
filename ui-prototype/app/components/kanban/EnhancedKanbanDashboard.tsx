"use client";

import { useState } from "react";
import { KanbanHeader, type MemberFilterItem } from "./KanbanHeader";
import { KanbanColumn } from "./KanbanColumn";
import { ListView } from "./ListView";
import type { TaskItem } from "./TaskCard";
import { TaskDetailDrawer } from "../tasks/TaskDetailDrawer";

interface EnhancedKanbanDashboardProps {
  initialTasks: TaskItem[];
  onTaskMove?: (taskId: string, newColumnId: "todo" | "in-progress" | "in-review" | "completed") => void;
}

export function EnhancedKanbanDashboard({ initialTasks, onTaskMove }: EnhancedKanbanDashboardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"default" | "priority" | "dueAt">("default");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [selectedDrawerTaskId, setSelectedDrawerTaskId] = useState<string | null>(null);

  // Default members list for quick filtering
  const members: MemberFilterItem[] = [
    { id: "m1", name: "Nguyễn Văn", avatar: "NV", colorClass: "nv" },
    { id: "m2", name: "Hoàng Long", avatar: "HL", colorClass: "hl" },
    { id: "m3", name: "Trần Phương", avatar: "TP", colorClass: "tp" },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const handleDropTask = (
    taskId: string,
    targetColumnId: "todo" | "in-progress" | "in-review" | "completed"
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t))
    );
    setDraggingTaskId(null);
    onTaskMove?.(taskId, targetColumnId);
  };

  // Filter tasks logic
  let filtered = tasks.filter((t) => {
    // 1. Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // 2. Priority filter
    if (priorityFilter !== "ALL") {
      if (t.priority !== priorityFilter) return false;
    }

    // 3. Member filter
    if (selectedMember) {
      if (t.assignee.avatar.toUpperCase() !== selectedMember.toUpperCase()) return false;
    }

    return true;
  });

  // Sorting logic
  if (sortBy === "priority") {
    const priorityWeight = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    filtered = [...filtered].sort(
      (a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
    );
  } else if (sortBy === "dueAt") {
    filtered = [...filtered].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }

  const columnsDef = [
    { id: "todo" as const, title: "Cần làm", dotColorClass: "bg-zinc-400" },
    { id: "in-progress" as const, title: "Đang làm", dotColorClass: "bg-blue-400" },
    { id: "in-review" as const, title: "Đang đánh giá", dotColorClass: "bg-amber-400" },
    { id: "completed" as const, title: "Hoàn thành", dotColorClass: "bg-emerald-400" },
  ];

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 space-y-4">
      {/* Header Bar */}
      <KanbanHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedMember={selectedMember}
        onSelectMember={setSelectedMember}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        members={members}
      />

      {/* Main Content Area */}
      {viewMode === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full min-h-[500px]">
          {columnsDef.map((col) => {
            const colTasks = filtered.filter((t) => t.columnId === col.id);
            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                dotColorClass={col.dotColorClass}
                tasks={colTasks}
                draggingTaskId={draggingTaskId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDropTask={handleDropTask}
              />
            );
          })}
        </div>
      ) : (
        <ListView tasks={filtered} onStatusChange={handleDropTask} />
      )}

      {/* Slide-over Task Detail Drawer */}
      {selectedDrawerTaskId && (
        <TaskDetailDrawer
          workspaceId="demo"
          taskId={selectedDrawerTaskId}
          isOpen={Boolean(selectedDrawerTaskId)}
          onClose={() => setSelectedDrawerTaskId(null)}
        />
      )}
    </div>
  );
}
