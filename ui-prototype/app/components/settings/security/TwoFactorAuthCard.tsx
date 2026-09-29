 
"use client";

import React from "react";
import {
  Smartphone,
  Key,
  Lock,
  ChevronRight,
  Shield,
} from "lucide-react";
import { TwoFactorConfig } from "./types";

interface TwoFactorAuthCardProps {
  config: TwoFactorConfig;
  onOpenWizard: () => void;
  onRequestDisable: () => void;
  onRequestViewBackup: () => void;
}

export const TwoFactorAuthCard: React.FC<TwoFactorAuthCardProps> = ({
  config,
  onOpenWizard,
  onRequestDisable,
  onRequestViewBackup,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Xác thực hai yếu tố (2FA / MFA)</span>
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                config.enabled
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                  : "bg-amber-950/80 text-amber-400 border-amber-800/60"
              }`}
            >
              {config.enabled ? "ĐÃ BẬT MFA" : "CHƯA BẬT - NÊN KÍCH HOẠT"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Bảo vệ tài khoản với 2 lớp bảo mật bằng ứng dụng Authenticator (Google Authenticator, Authy, 1Password)
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          {config.enabled ? (
            <button
              type="button"
              onClick={onRequestDisable}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-medium transition-colors"
            >
              Tắt 2FA
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenWizard}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Kích hoạt 2FA ngay
            </button>
          )}
        </div>
      </div>

      {/* Main Method Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
                <span>Authenticator App (Mã TOTP 6 số)</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  Khuyến nghị
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Tạo mã xác minh OTP nhảy theo thời gian (30 giây/mã) thông qua Google Authenticator, 1Password, Authy hoặc Microsoft Authenticator.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWizard}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline shrink-0"
          >
            <span>{config.enabled ? "Cấu hình lại MFA" : "Bắt đầu thiết lập"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Backup Codes Section Banner */}
        {config.enabled && (
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Bạn có 10 Mã khôi phục dự phòng (Recovery Codes) khi mất điện thoại</span>
            </div>

            <button
              type="button"
              onClick={onRequestViewBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Xem 10 mã dự phòng</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
