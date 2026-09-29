 
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Paperclip,
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import type { TaskAttachment } from "@/app/types/domain";

interface TaskAttachmentModuleProps {
  attachments: TaskAttachment[];
  onUpload: (file: File) => Promise<void>;
  onDownload: (attachment: TaskAttachment) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
}

export function TaskAttachmentModule({
  attachments,
  onUpload,
  onDownload,
  onDelete,
}: TaskAttachmentModuleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<TaskAttachment | null>(null);

  // Delete Confirmation state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TaskAttachment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const validateAndUpload = async (file: File) => {
    setErrorMessage(null);

    // 1. Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File quá lớn! Dung lượng tối đa cho phép là 10 MB.");
      return;
    }

    // 2. Validate format
    const isAllowed = allowedTypes.includes(file.type) || /\.(jpg|jpeg|png|webp|pdf|txt|csv|docx|xlsx)$/i.test(file.name);
    if (!isAllowed) {
      setErrorMessage("Định dạng file không được hỗ trợ! Chỉ chấp nhận JPG, PNG, WebP, PDF, TXT, CSV, DOCX, XLSX.");
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    // Progress simulation
    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 20 : p));
    }, 200);

    try {
      await onUpload(file);
      setUploadProgress(100);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải file lên.");
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDownload = async (item: TaskAttachment) => {
    setDownloadingId(item.id);
    try {
      await onDownload(item);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setDeletingId(deleteConfirmItem.id);
    try {
      await onDelete(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    } finally {
      setDeletingId(null);
    }
  };

  const openPreview = (item: TaskAttachment) => {
    setPreviewItem(item);
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.startsWith("image/")) return <FileImage size={22} className="text-emerald-400" />;
    if (mimeType.includes("pdf")) return <FileText size={22} className="text-rose-400" />;
    if (mimeType.includes("spreadsheet") || fileName.endsWith(".csv") || fileName.endsWith(".xlsx"))
      return <FileSpreadsheet size={22} className="text-emerald-400" />;
    return <File size={22} className="text-blue-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
          <Paperclip size={16} className="text-emerald-500" />
          <h3>Tệp đính kèm ({attachments.length})</h3>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drag and Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
            : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv,.docx,.xlsx"
          className="hidden"
        />

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:scale-110 group-hover:text-emerald-400 transition-all">
          <Upload size={18} />
        </div>

        <p className="mt-2 text-xs font-semibold text-zinc-200">
          Kéo thả file vào đây hoặc <span className="text-emerald-400 underline">chọn file từ máy</span>
        </p>
        <p className="text-[11px] text-zinc-500 mt-1">
          Hỗ trợ JPG, PNG, WebP, PDF, TXT, CSV, DOCX, XLSX (Tối đa 10 MB)
        </p>

        {/* Upload Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-zinc-950/90 backdrop-blur-sm p-4">
            <Loader2 size={24} className="animate-spin text-emerald-400 mb-2" />
            <span className="text-xs font-semibold text-zinc-200">Đang tải file lên... ({uploadProgress}%)</span>
            <div className="w-48 h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Attachment Grid Cards */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-850"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800">
                  {getFileIcon(item.mimeType, item.fileName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors" title={item.fileName}>
                    {item.fileName}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {formatSize(item.size)} · {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openPreview(item)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Xem trước"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  disabled={downloadingId === item.id}
                  onClick={() => handleDownload(item)}
                  className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Tải xuống"
                >
                  {downloadingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(item)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Xóa file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-3">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-base font-bold text-zinc-100">Xác nhận xóa tệp?</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Bạn có chắc chắn muốn xóa file <strong className="text-zinc-200">{deleteConfirmItem.fileName}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmItem.id}
                onClick={confirmDelete}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                {deletingId === deleteConfirmItem.id && <Loader2 size={13} className="animate-spin" />}
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h4 className="text-sm font-bold text-zinc-100 truncate">{previewItem.fileName}</h4>
              <button onClick={() => setPreviewItem(null)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-[300px] items-center justify-center">
              {previewItem.mimeType.startsWith("image/") ? (
                <div className="text-center space-y-2">
                  <FileImage size={48} className="mx-auto text-emerald-400 opacity-60" />
                  <p className="text-xs text-zinc-300 font-medium">Xem trước hình ảnh: {previewItem.fileName}</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <FileText size={48} className="mx-auto text-blue-400 opacity-60" />
                  <p className="text-xs text-zinc-300 font-medium">Xem trước tài liệu PDF / Document</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
