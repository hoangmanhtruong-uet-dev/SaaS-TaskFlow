 
"use client";

import { use, useState } from "react";
import { ProjectSubNav } from "@/app/components/project-sub-nav";
import { Upload, FileText, Image as ImageIcon, FileCode, Download, Trash2, Search, Filter } from "lucide-react";

export default function ProjectFilesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const mockFiles = [
    { id: "1", name: "UI_MASTER_SPEC_TASKFLOW.pdf", size: "4.8 MB", uploader: "Quân Nguyễn", date: "25/09/2026", type: "pdf" },
    { id: "2", name: "architecture_diagram_v2.png", size: "2.1 MB", uploader: "Trường Hoàng", date: "24/09/2026", type: "image" },
    { id: "3", name: "database_migration_dump.sql", size: "850 KB", uploader: "Lan Anh", date: "22/09/2026", type: "code" },
  ];

  return (
    <div className="p-6">
      <ProjectSubNav projectId={projectId} projectName="Dự án SaaS TaskFlow" />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="search-box min-w-[280px]">
            <Search size={16} />
            <input placeholder="Tìm kiếm tài liệu..." />
          </div>
          <button className="button secondary">
            <Filter size={16} /> Loại tệp
          </button>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="button primary">
          <Upload size={16} /> Tải tệp lên
        </button>
      </div>

      {/* Grid of Files */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockFiles.map((file) => (
          <div key={file.id} className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                {file.type === "pdf" ? <FileText size={24} /> : file.type === "image" ? <ImageIcon size={24} /> : <FileCode size={24} />}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-[var(--muted)] hover:text-[var(--primary)] rounded-lg hover:bg-gray-100">
                  <Download size={16} />
                </button>
                <button className="p-2 text-[var(--muted)] hover:text-[var(--danger)] rounded-lg hover:bg-gray-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-sm text-[var(--ink)] truncate">{file.name}</h3>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{file.size}</span>
              <span>{file.date}</span>
            </div>
            <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]">
              Tải lên bởi: <strong className="text-[var(--ink)]">{file.uploader}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Tải tệp tin lên dự án</h2>
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--line-strong)] p-8 text-center bg-[#f8fbf8]">
              <Upload size={36} className="text-[var(--primary)] mb-3" />
              <p className="text-sm font-semibold text-[var(--ink)]">Kéo thả tệp tin vào đây hoặc click để chọn</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Hỗ trợ PDF, PNG, JPG, SQL, ZIP (Tối đa 50MB)</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowUploadModal(false)} className="button secondary">Hủy</button>
              <button onClick={() => setShowUploadModal(false)} className="button primary">Tải lên</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
