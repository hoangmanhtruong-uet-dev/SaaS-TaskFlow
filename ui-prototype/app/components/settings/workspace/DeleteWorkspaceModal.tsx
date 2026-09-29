 
import React, { useState, useEffect } from "react";
import { X, AlertOctagon, Trash2, Clock, Check } from "lucide-react";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain: string;
  onConfirmDelete: () => void;
}

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({
  isOpen,
  onClose,
  subdomain,
  onConfirmDelete,
}) => {
  const targetSyntax = `DELETE-${(subdomain || "ACME").toUpperCase()}-PERMANENTLY`;

  const [inputVal, setInputVal] = useState("");
  const [countdown, setCountdown] = useState(5);

  // 5-second Countdown effect
  useEffect(() => {
    if (!isOpen) {
      const resetTimer = window.setTimeout(() => {
        setInputVal("");
        setCountdown(5);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const initTimer = window.setTimeout(() => {
      setCountdown(5);
    }, 0);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isSyntaxMatched = inputVal.trim() === targetSyntax;
  const isButtonEnabled = isSyntaxMatched && countdown === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-red-500/40 p-6 shadow-2xl shadow-red-950/50 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
          <div className="flex items-center gap-2.5 text-red-500">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <h3 className="text-lg font-bold text-red-400">Xóa vĩnh viễn Workspace này</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severe Warning Alert */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
          <div className="font-bold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            ⚠️ CẢNH BÁO NGUY HIỂM TỐI CAO:
          </div>
          <p>
            Hành động này <strong>KHÔNG THỂ KHÔI PHỤC</strong>. Toàn bộ danh sách dự án, nhiệm vụ (tasks), tệp đính kèm, lịch sử trao đổi và dữ liệu 48 thành viên sẽ bị <strong>XÓA HẲN</strong> khỏi cơ sở dữ liệu.
          </p>
        </div>

        {/* Security Syntax Requirement */}
        <div className="space-y-3">
          <label htmlFor="delete-workspace-confirmation" className="block text-xs font-semibold text-zinc-300">
            Để xác nhận xóa, vui lòng nhập chính xác cú pháp sau vào ô dưới đây:
          </label>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center font-mono text-xs font-bold text-red-400 select-all tracking-wider">
            {targetSyntax}
          </div>

          <input
            id="delete-workspace-confirmation"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Gõ lại: ${targetSyntax}`}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
          />

          {/* Real-time Syntax Match Indicator */}
          {inputVal.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              {isSyntaxMatched ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Chuỗi xác nhận hoàn toàn chính xác.
                </span>
              ) : (
                <span className="text-red-400 text-[11px]">
                  Cú pháp chưa trùng khớp, vui lòng kiểm tra kỹ các chữ cái in hoa.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Countdown & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-400" />
            {countdown > 0 ? (
              <span>
                Đang khóa nút xóa: <strong>{countdown} giây</strong>
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">Khóa đếm ngược đã mở.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              disabled={!isButtonEnabled}
              onClick={onConfirmDelete}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {countdown > 0
                  ? `Chờ ${countdown}s...`
                  : isSyntaxMatched
                  ? "XÓA VĨNH VIỄN WORKSPACE"
                  : "Nhập đúng cú pháp"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
