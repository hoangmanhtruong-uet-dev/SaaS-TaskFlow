 
"use client";

import React, { useState, useEffect } from "react";
import { X, Save, LockKeyhole, Globe, Edit2 } from "lucide-react";
import { Project, ProjectVisibility } from "./types";

interface ProjectEditModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, updatedFields: Partial<Project>) => void;
}

export function ProjectEditModal({ project, onClose, onSave }: ProjectEditModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("WORKSPACE");

  useEffect(() => {
    if (project) {
      const syncTimer = window.setTimeout(() => {
        setName(project.name);
        setDescription(project.description);
        setVisibility(project.visibility);
      }, 0);
      return () => window.clearTimeout(syncTimer);
    }
  }, [project]);

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(project.id, {
      name: name.trim(),
      description: description.trim(),
      visibility,
    });
  };

  return (
    <>
      <button type="button" aria-label="Đóng chỉnh sửa dự án" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl space-y-5 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Chỉnh sửa thông tin dự án</h3>
              <p className="text-xs text-zinc-400">Mã dự án: {project.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label htmlFor="project-name" className="font-semibold text-zinc-300">Tên dự án <span className="text-rose-400">*</span></label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên dự án..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-description" className="font-semibold text-zinc-300">Mô tả dự án</label>
            <textarea
              id="project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập thông tin chi tiết về dự án..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-zinc-300">Quyền truy cập (Visibility)</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("WORKSPACE")}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-colors ${
                  visibility === "WORKSPACE"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Workspace</div>
                  <div className="text-[10px] opacity-75">Tất cả thành viên</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-colors ${
                  visibility === "PRIVATE"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <LockKeyhole className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Riêng tư (Private)</div>
                  <div className="text-[10px] opacity-75">Chỉ thành viên được mời</div>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
