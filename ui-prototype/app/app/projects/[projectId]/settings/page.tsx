 
"use client";

import { use, useState } from "react";
import { ProjectSubNav } from "@/app/components/project-sub-nav";
import { Save, AlertTriangle, Trash2, Archive, Lock, Globe } from "lucide-react";

export default function ProjectSettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [name, setName] = useState("Dự án SaaS TaskFlow");
  const [desc, setDesc] = useState("Thiết kế lại và phát triển lại toàn bộ UI/UX hệ thống quản lý công việc TaskFlow.");
  const [visibility, setVisibility] = useState("WORKSPACE");

  return (
    <div className="p-6 max-w-5xl">
      <ProjectSubNav projectId={projectId} projectName={name} />

      <div className="space-y-8">
        {/* General Info */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Cài đặt chung</h2>
          <div className="space-y-4">
            <div className="field">
              <label htmlFor="projectName">Tên dự án</label>
              <input id="projectName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="projectDesc">Mô tả chi tiết</label>
              <textarea id="projectDesc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
            </div>

            <div className="field">
              <span className="block text-sm font-medium text-[var(--ink)] mb-1">Quyền riêng tư (Visibility)</span>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <button
                  type="button"
                  onClick={() => setVisibility("WORKSPACE")}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    visibility === "WORKSPACE" ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--line)] bg-white"
                  }`}
                >
                  <Globe size={20} className="text-[var(--primary)] mt-1" />
                  <div>
                    <div className="font-semibold text-sm text-[var(--ink)]">Công khai trong Workspace</div>
                    <div className="text-xs text-[var(--muted)]">Mọi thành viên trong workspace đều có thể xem và làm việc.</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility("PRIVATE")}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    visibility === "PRIVATE" ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--line)] bg-white"
                  }`}
                >
                  <Lock size={20} className="text-[var(--primary)] mt-1" />
                  <div>
                    <div className="font-semibold text-sm text-[var(--ink)]">Riêng tư (Private)</div>
                    <div className="text-xs text-[var(--muted)]">Chỉ những người được mời mới có thể truy cập dự án này.</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="button primary">
                <Save size={16} /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Danger Zone (Vùng nguy hiểm)
          </h2>
          <p className="text-xs text-red-700 mb-6">
            Lưu trữ hoặc xóa dự án sẽ ảnh hưởng tới tất cả các công việc, tệp tin và thành viên liên quan.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="button secondary">
              <Archive size={16} /> Lưu trữ dự án (Archive)
            </button>
            <button className="button danger">
              <Trash2 size={16} /> Xóa vĩnh viễn dự án
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
