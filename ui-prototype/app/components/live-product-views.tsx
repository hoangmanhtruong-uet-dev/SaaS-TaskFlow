"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeading, NewTaskAction } from "./product-views";
import { Button, EmptyState, ErrorState, Field, ListSkeleton } from "./ui";
import { useWorkspace } from "./providers/workspace-provider";
import { useApiResource } from "@/app/hooks/use-api-resource";
import { projectService } from "@/app/services/project-service";
import { taskService } from "@/app/services/task-service";
import { InteractiveBoard } from "./task-interactions";
import { EnhancedKanbanDashboard } from "./kanban/EnhancedKanbanDashboard";
import type { TaskItem } from "./kanban/TaskCard";
import { TaskDetailDrawer } from "./tasks/TaskDetailDrawer";
import { QuickCreateTaskModal } from "./tasks/QuickCreateTaskModal";

interface ReferenceTask {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  tags: string[];
  dueAt: string;
  assignee: { name: string; avatar: string; colorClass: string };
  columnId: "todo" | "in-progress" | "in-review" | "completed";
}

const defaultReferenceTasks: ReferenceTask[] = [
  {
    id: "ref-1",
    title: "Thiết kế hệ thống Design Tokens",
    description: "Đồng bộ hóa các giá trị màu sắc, typography và spacing...",
    priority: "High",
    tags: ["UI/UX", "Design System"],
    dueAt: "25 Th10",
    assignee: { name: "NV", avatar: "NV", colorClass: "nv" },
    columnId: "todo",
  },
  {
    id: "ref-2",
    title: "Nghiên cứu kiến trúc micro-frontend",
    description: "Đánh giá Module Federation và các giải pháp tích hợp cho...",
    priority: "Medium",
    tags: ["Architecture"],
    dueAt: "28 Th10",
    assignee: { name: "HL", avatar: "HL", colorClass: "hl" },
    columnId: "todo",
  },
  {
    id: "ref-3",
    title: "Cập nhật tài liệu API v2",
    description: "Viết hướng dẫn sử dụng endpoint xác thực mới cho d...",
    priority: "Low",
    tags: ["Docs"],
    dueAt: "30 Th10",
    assignee: { name: "TP", avatar: "TP", colorClass: "tp" },
    columnId: "todo",
  },
  {
    id: "ref-4",
    title: "Xây dựng Shell ứng dụng chính",
    description: "Tích hợp sidebar, header, và quản lý routing cho toàn bộ...",
    priority: "High",
    tags: ["Frontend", "React"],
    dueAt: "22 Th10",
    assignee: { name: "NV", avatar: "NV", colorClass: "nv" },
    columnId: "in-progress",
  },
  {
    id: "ref-5",
    title: "Tối ưu hóa query cơ sở dữ liệu",
    description: "Thêm index cho bảng tasks và projects để cải thiện thời gia...",
    priority: "Medium",
    tags: ["Backend", "SQL"],
    dueAt: "24 Th10",
    assignee: { name: "HL", avatar: "HL", colorClass: "hl" },
    columnId: "in-progress",
  },
  {
    id: "ref-6",
    title: "Kiểm thử bảo mật OAuth2",
    description: "Kiểm tra lỗ hổng XSS và CSRF trên luồng đăng nhập...",
    priority: "High",
    tags: ["Security"],
    dueAt: "20 Th10",
    assignee: { name: "TP", avatar: "TP", colorClass: "tp" },
    columnId: "in-review",
  },
  {
    id: "ref-7",
    title: "Khởi tạo repository GitHub",
    description: "Thiết lập branch protection rules và GitHub Actions CI/C...",
    priority: "Low",
    tags: ["DevOps"],
    dueAt: "18 Th10",
    assignee: { name: "NV", avatar: "NV", colorClass: "nv" },
    columnId: "completed",
  },
  {
    id: "ref-8",
    title: "Thiết kế wireframe trang chủ",
    description: "Phác thảo bố cục UX cơ bản cho trang tổng quan...",
    priority: "Medium",
    tags: ["UI/UX"],
    dueAt: "15 Th10",
    assignee: { name: "HL", avatar: "HL", colorClass: "hl" },
    columnId: "completed",
  },
];

export function LiveDashboard() {
  const workspace = useWorkspace();
  const resource = useApiResource(async () => {
    const [projects, tasks] = await Promise.all([
      projectService.list(workspace.id),
      taskService.list(workspace.id),
    ]);
    return { projects, tasks };
  }, `dashboard:${workspace.id}`);

  if (resource.loading) return <ListSkeleton rows={4} />;
  if (resource.error || !resource.data) return <ErrorState retry={resource.reload} />;

  const { tasks: dbTasks } = resource.data;

  const initialTasks: TaskItem[] = dbTasks.map((t, idx) => {
    let col: TaskItem["columnId"] = "todo";
    const colName = (t.columnName || "").toLowerCase();
    if (colName.includes("đang làm") || colName.includes("progress")) col = "in-progress";
    else if (colName.includes("đánh giá") || colName.includes("review")) col = "in-review";
    else if (colName.includes("hoàn thành") || colName.includes("done")) col = "completed";

    let prio: TaskItem["priority"] = "Medium";
    if (t.priority === "URGENT") prio = "Urgent";
    else if (t.priority === "HIGH") prio = "High";
    else if (t.priority === "LOW") prio = "Low";

    const assignees = [
      { name: "Nguyễn Văn", avatar: "NV", colorClass: "nv" },
      { name: "Hoàng Long", avatar: "HL", colorClass: "hl" },
      { name: "Trần Phương", avatar: "TP", colorClass: "tp" },
    ];

    return {
      id: t.id,
      title: t.title,
      description: t.description || "Nội dung chi tiết công việc...",
      priority: prio,
      tags: [t.projectName || "UI/UX"],
      dueAt: t.dueAt ? new Date(t.dueAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short" }) : "25 Th10",
      assignee: assignees[idx % assignees.length],
      columnId: col,
      subtasksTotal: 4,
      subtasksCompleted: col === "completed" ? 4 : col === "in-review" ? 3 : 1,
      attachmentCount: idx % 2 === 0 ? 2 : 0,
      commentCount: (idx % 3) + 1,
    };
  });

  const handleTaskMove = async (
    taskId: string,
    newColumnId: "todo" | "in-progress" | "in-review" | "completed"
  ) => {
    try {
      await taskService.move(workspace.id, taskId, {
        destinationColumnId: newColumnId,
        beforeTaskId: null,
        afterTaskId: null,
        expectedVersion: 1,
      });
    } catch (err) {
      console.error("Failed to sync move with server:", err);
    }
  };

  return (
    <div className="w-full flex-1 h-full flex flex-col p-4 sm:p-6 bg-zinc-950 text-zinc-100">
      <EnhancedKanbanDashboard initialTasks={initialTasks} onTaskMove={handleTaskMove} />
    </div>
  );
}

import { ProjectDashboardContainer } from "./projects/ProjectDashboardContainer";

export function LiveProjects() {
  return (
    <div className="w-full h-full flex-1 p-4 sm:p-6 bg-zinc-950 text-zinc-100">
      <ProjectDashboardContainer />
    </div>
  );
}

import { MyTasksDashboardContainer } from "./my-tasks/MyTasksDashboardContainer";

export function LiveTasks() {
  return (
    <div className="w-full h-full flex-1 p-4 sm:p-6 bg-zinc-950 text-zinc-100">
      <MyTasksDashboardContainer />
    </div>
  );
}


export function LiveBoard({ projectId }: { projectId: string }) {
  const workspace = useWorkspace(); const resource = useApiResource(async () => { const [project, tasks, boards] = await Promise.all([projectService.get(workspace.id, projectId), taskService.list(workspace.id, projectId), projectService.listBoards(workspace.id, projectId)]); const board = boards[0]; const columns = board ? await projectService.listColumns(workspace.id, board.id) : []; return { project, tasks, board, columns }; }, `board:${workspace.id}:${projectId}`);
  if (resource.loading) return <div className="app-content"><ListSkeleton rows={4} /></div>; if (resource.error || !resource.data) return <div className="app-content"><ErrorState retry={resource.reload} /></div>;
  const { project, tasks, columns } = resource.data;
  return <div className="app-content"><PageHeading eyebrow="Dự án / Board" title={project.name} action={<NewTaskAction />} />{columns.length ? <InteractiveBoard key={tasks.map((task) => `${task.id}:${task.version}:${task.columnId}`).join("|")} workspaceId={workspace.id} columns={columns} initialTasks={tasks} refetch={resource.reload} /> : <EmptyState title="Board chưa có column" body="Tạo column để bắt đầu tổ chức công việc." />}</div>;
}

export function NewProjectForm() {
  const workspace = useWorkspace(); const router = useRouter(); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(""); const form = new FormData(event.currentTarget); try { const project = await projectService.create(workspace.id, { name: String(form.get("name")), description: String(form.get("description")), visibility: form.get("private") ? "PRIVATE" : "WORKSPACE" }); router.push(`/app/projects/${project.id}/board`); } catch (value) { setError(value instanceof Error ? value.message : "Không thể tạo dự án"); setSaving(false); } }
  return <div className="app-content"><form className="production-form" onSubmit={submit}><Field name="name" label="Tên dự án *" required /><label className="field"><span>Mô tả</span><textarea name="description" /></label><label className="check-line"><input name="private" type="checkbox" />Dự án riêng tư</label>{error && <p className="form-error">{error}</p>}<Button type="submit" disabled={saving}>{saving ? "Đang tạo..." : "Tạo dự án"}</Button></form></div>;
}

export function NewTaskForm() {
  const workspace = useWorkspace();
  const router = useRouter();

  return (
    <div className="w-full flex-1 h-full flex flex-col p-4 sm:p-6 bg-zinc-950 text-zinc-100 min-h-screen">
      <LiveDashboard />
      <QuickCreateTaskModal
        workspaceId={workspace.id}
        isOpen={true}
        onClose={() => router.push("/app")}
      />
    </div>
  );
}

export function LiveTaskDetail({ taskId }: { taskId: string }) {
  const workspace = useWorkspace();
  const router = useRouter();

  return (
    <div className="w-full flex-1 h-full flex flex-col p-4 sm:p-6 bg-zinc-950 text-zinc-100 min-h-screen">
      <LiveDashboard />
      <TaskDetailDrawer
        workspaceId={workspace.id}
        taskId={taskId}
        isOpen={true}
        onClose={() => router.push("/app")}
      />
    </div>
  );
}
