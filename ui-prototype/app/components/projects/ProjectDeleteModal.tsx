 
"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Project } from "./types";

interface ProjectDeleteModalProps {
  project: Project | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function ProjectDeleteModal({ project, onClose, onConfirm }: ProjectDeleteModalProps) {
  if (!project) return null;

  return (
    <>
      <button type="button" aria-label="Đóng xác nhận xóa dự án" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl space-y-4 animate-scaleUp">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Xác nhận xóa dự án?</h3>
            <p className="text-xs text-zinc-400">Hành động này không thể hoàn tác.</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
          Bạn có chắc chắn muốn xóa dự án &quot;<strong className="text-rose-400">{project.name}</strong>&quot;? Tất cả các board, danh sách công việc và tài liệu thuộc dự án này sẽ bị xóa khỏi hệ thống.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onConfirm(project.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </>
  );
}
