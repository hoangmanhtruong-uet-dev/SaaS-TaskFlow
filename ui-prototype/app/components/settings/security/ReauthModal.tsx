 
"use client";

import React from "react";
import { X, ShieldAlert, KeyRound } from "lucide-react";

interface ReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: "disable_2fa" | "view_backup" | null;
  password: string;
  onPasswordChange: (val: string) => void;
  onConfirm: () => void;
}

export const ReauthModal: React.FC<ReauthModalProps> = ({
  isOpen,
  onClose,
  reason,
  password,
  onPasswordChange,
  onConfirm,
}) => {
  if (!isOpen || !reason) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Xác minh mật khẩu bảo mật
              </h3>
              <p className="text-xs text-zinc-400">Yêu cầu xác thực lại hành động nhạy cảm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            {reason === "disable_2fa"
              ? "Bạn sắp TẮT tính năng Xác thực 2 yếu tố (2FA). Vui lòng nhập lại mật khẩu hiện tại để xác nhận."
              : "Bạn sắp VEM 10 mã khôi phục dự phòng (Backup Codes). Vui lòng nhập lại mật khẩu hiện tại để tiếp tục."}
          </p>

          <div className="space-y-1.5">
            <label htmlFor="reauth-password" className="text-xs font-semibold text-zinc-300">
              Mật khẩu hiện tại của bạn
            </label>
            <input
              id="reauth-password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              <span>Xác nhận tiếp tục</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
