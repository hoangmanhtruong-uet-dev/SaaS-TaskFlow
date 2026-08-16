import type { Project, TaskSummary, Workspace } from "@/app/types/domain";

export const mockWorkspace: Workspace = {
  id: "ws_alpha", name: "Alpha Studio", slug: "alpha-studio", plan: "FREE", role: "OWNER", archivedAt: null,
};

export const mockProjects: Project[] = [
  { id: "prj_web", workspaceId: "ws_alpha", name: "Website Redesign", description: "Làm mới trải nghiệm marketing", visibility: "WORKSPACE", taskCount: 12, progress: 65, archivedAt: null },
  { id: "prj_mobile", workspaceId: "ws_alpha", name: "Mobile App MVP", description: "Ứng dụng TaskFlow mobile", visibility: "PRIVATE", taskCount: 8, progress: 42, archivedAt: null },
  { id: "prj_q4", workspaceId: "ws_alpha", name: "Q4 Planning", description: "Kế hoạch vận hành quý 4", visibility: "WORKSPACE", taskCount: 5, progress: 18, archivedAt: null },
];

export const mockTasks: TaskSummary[] = [
  { id: "tsk_auth", workspaceId: "ws_alpha", projectId: "prj_web", boardId: "brd_web", columnId: "col_doing", title: "Hoàn thiện luồng đăng ký", description: "", priority: "HIGH", dueAt: "2026-08-16T00:00:00.000Z", assigneeIds: ["usr_lan"], version: 3, archivedAt: null, projectName: "Website Redesign", columnName: "Đang làm", tone: "red", checklistTotal: 4, checklistCompleted: 3 },
  { id: "tsk_ui", workspaceId: "ws_alpha", projectId: "prj_mobile", boardId: "brd_mobile", columnId: "col_review", title: "Review hệ thống component", description: "", priority: "MEDIUM", dueAt: "2026-08-17T00:00:00.000Z", assigneeIds: ["usr_lan"], version: 1, archivedAt: null, projectName: "Mobile App MVP", columnName: "Review", tone: "amber", checklistTotal: 2, checklistCompleted: 1 },
  { id: "tsk_api", workspaceId: "ws_alpha", projectId: "prj_q4", boardId: "brd_q4", columnId: "col_backlog", title: "Cập nhật tài liệu API", description: "", priority: "LOW", dueAt: "2026-08-26T00:00:00.000Z", assigneeIds: [], version: 2, archivedAt: null, projectName: "Q4 Planning", columnName: "Backlog", tone: "blue", checklistTotal: 0, checklistCompleted: 0 },
];

export const legacyTasks = mockTasks.map((task) => ({ title: task.title, project: task.projectName, priority: ({ LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn cấp" })[task.priority], due: task.dueAt ?? "Chưa đặt", tone: task.tone }));
export const legacyProjects = mockProjects.map((project) => ({ name: project.name, meta: `${project.description} · ${project.taskCount} công việc`, progress: project.progress, private: project.visibility === "PRIVATE" }));
