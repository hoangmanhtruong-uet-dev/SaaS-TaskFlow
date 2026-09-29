"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ProjectSubNav } from "@/app/components/project-sub-nav";
import { Search, Filter, Plus, Calendar, User, MoreVertical } from "lucide-react";

export default function ProjectListPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const mockTasks = [
    { id: "1", title: "Thiết kế hệ thống DB & Migration schema", status: "Hoàn thành", priority: "HIGH", assignee: "Quân Nguyễn", dueDate: "2026-09-28" },
    { id: "2", title: "Cấu hình Stripe Webhook Integration", status: "Đang làm", priority: "URGENT", assignee: "Trường Hoàng", dueDate: "2026-09-30" },
    { id: "3", title: "Viết Unit test cho Auth Service", status: "Review", priority: "MEDIUM", assignee: "Lan Anh", dueDate: "2026-10-02" },
    { id: "4", title: "Tối ưu hóa thời gian tải Dashboard Analytics", status: "Backlog", priority: "LOW", assignee: "Chưa gán", dueDate: "2026-10-05" },
  ];

  const toggleSelectAll = () => {
    if (selectedTasks.length === mockTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(mockTasks.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="p-6">
      <ProjectSubNav projectId={projectId} projectName="Dự án SaaS TaskFlow" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="search-box min-w-[280px]">
            <Search size={16} />
            <input placeholder="Lọc theo tên công việc..." />
          </div>
          <button className="button secondary">
            <Filter size={16} /> Lọc trạng thái
          </button>
        </div>

        <Link href="/app/tasks/new" className="button primary">
          <Plus size={16} /> Thêm công việc
        </Link>
      </div>

      {/* Bulk Action Bar */}
      {selectedTasks.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--primary-soft)] p-3 text-xs font-semibold text-[var(--primary-dark)]">
          <span>Đã chọn {selectedTasks.length} công việc</span>
          <div className="flex items-center gap-2">
            <button className="button secondary text-xs">Đánh dấu Hoàn thành</button>
            <button className="button danger text-xs">Xóa các mục chọn</button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[#f8fbf8] text-xs font-bold uppercase text-[var(--muted)]">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === mockTasks.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-[var(--primary)]"
                />
              </th>
              <th className="p-4">Tên công việc</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Độ ưu tiên</th>
              <th className="p-4">Người thực hiện</th>
              <th className="p-4">Hạn hoàn thành</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {mockTasks.map((task) => (
              <tr key={task.id} className="hover:bg-[#f6faf6] transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleSelect(task.id)}
                    className="rounded border-gray-300 text-[var(--primary)]"
                  />
                </td>
                <td className="p-4 font-semibold text-[var(--ink)]">
                  <a href={`/app/tasks/${task.id}`} className="hover:text-[var(--primary)]">
                    {task.title}
                  </a>
                </td>
                <td className="p-4">
                  <span className={`badge ${task.status === "Hoàn thành" ? "" : task.status === "Đang làm" ? "blue" : "gray"}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`badge ${task.priority === "URGENT" || task.priority === "HIGH" ? "red" : task.priority === "MEDIUM" ? "amber" : "gray"}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <User size={14} /> {task.assignee}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Calendar size={14} /> {task.dueDate}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="text-[var(--muted)] hover:text-[var(--ink)]">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
