 
"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { ArchivedItem } from "./types";

interface PermanentDeleteModalProps {
  item: ArchivedItem | null;
  isBulk: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PermanentDeleteModal({
  item,
  isBulk,
  isOpen,
  onClose,
  onConfirm,
}: PermanentDeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    const resetTimer = window.setTimeout(() => setConfirmInput(""), 0);
    return () => window.clearTimeout(resetTimer);
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = confirmInput.trim().toUpperCase() === "CONFIRM";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched) return;
    onConfirm();
  };

  return (
    <>
      <button type="button" aria-label="Đóng xác nhận xóa vĩnh viễn" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl space-y-4 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Cảnh báo: Xóa vĩnh viễn</h3>
              <p className="text-xs text-rose-400 font-semibold">Hành động này KHÔNG THỂ KHÔI PHỤC!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
          {isBulk ? (
            <>
              Bạn có chắc chắn muốn xóa vĩnh viễn các mục đã chọn? Dữ liệu dự án, công việc và tệp tin liên quan sẽ bị xóa khỏi cơ sở dữ liệu hoàn toàn.
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa vĩnh viễn &quot;<strong className="text-rose-400">{item?.title}</strong>&quot;?
            </>
          )}
        </p>

        {/* Safety Confirm Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="permanent-delete-confirm" className="text-xs text-zinc-400">
              Gõ chữ <strong className="text-rose-400 select-all font-mono">CONFIRM</strong> để xác nhận:
            </label>
            <input
              id="permanent-delete-confirm"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Gõ CONFIRM tại đây..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!isMatched}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa vĩnh viễn</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
