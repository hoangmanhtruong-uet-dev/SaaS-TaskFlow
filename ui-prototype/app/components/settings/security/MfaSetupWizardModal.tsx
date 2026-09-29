 
"use client";

import React from "react";
import {
  X,
  Shield,
  Copy,
  Check,
  Download,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { TwoFactorConfig } from "./types";

interface MfaSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: 1 | 2 | 3 | 4;
  onStepChange: (step: 1 | 2 | 3 | 4) => void;
  config: TwoFactorConfig;
  confirmPassword: string;
  onConfirmPasswordChange: (val: string) => void;
  onStep1Submit: (e: React.FormEvent) => void;
  otpPin: string[];
  onOtpChange: (index: number, val: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerifyOtp: () => void;
  onDownloadTxt: () => void;
  onCopyBackupCodes: () => void;
}

export const MfaSetupWizardModal: React.FC<MfaSetupWizardModalProps> = ({
  isOpen,
  onClose,
  step,
  onStepChange,
  config,
  confirmPassword,
  onConfirmPasswordChange,
  onStep1Submit,
  otpPin,
  onOtpChange,
  onOtpKeyDown,
  onVerifyOtp,
  onDownloadTxt,
  onCopyBackupCodes,
}) => {
  const [copiedSecret, setCopiedSecret] = React.useState(false);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard?.writeText(config.secretKey.replace(/\s/g, ""));
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Thiết lập Xác thực 2 Yếu tố (2FA Wizard)
              </h3>
              <p className="text-xs text-zinc-400 font-mono">Bước {step} / 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "bg-emerald-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Re-confirm Password */}
        {step === 1 && (
          <form onSubmit={onStep1Submit} className="space-y-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-100">
                Bước 1: Xác nhận mật khẩu hiện tại
              </h4>
              <p className="text-xs text-zinc-400">
                Để bảo mật, vui lòng nhập lại mật khẩu hiện tại trước khi thực hiện thiết lập 2FA.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mfa-current-password" className="text-xs font-semibold text-zinc-300">
                Mật khẩu hiện tại
              </label>
              <input
                id="mfa-current-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu của bạn..."
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: QR Code & Secret Key */}
        {step === 2 && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-100">
                Bước 2: Quét mã QR Code bằng ứng dụng Authenticator
              </h4>
              <p className="text-xs text-zinc-400">
                Mở ứng dụng Google Authenticator, 1Password hoặc Authy trên điện thoại và quét mã bên dưới.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-2xl flex items-center justify-center">
              <img
                src={config.qrCodeUrl}
                alt="2FA QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Secret Key Manual Entry */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1.5 text-center">
              <div className="text-[11px] text-zinc-400">
                Hoặc nhập mã khóa này thủ công (Secret Key):
              </div>
              <div className="font-mono font-bold text-sm text-emerald-400 tracking-wider flex items-center justify-center gap-2">
                <span>{config.secretKey}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1 text-zinc-400 hover:text-emerald-400"
                  title="Sao chép Secret Key"
                >
                  {copiedSecret ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onStepChange(1)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                onClick={() => onStepChange(3)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <span>Nhập mã xác nhận</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 6 OTP Input Boxes */}
        {step === 3 && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-100">
                Bước 3: Nhập mã 6 số OTP từ ứng dụng
              </h4>
              <p className="text-xs text-zinc-400">
                Nhập 6 chữ số đang hiển thị trên ứng dụng Authenticator để hoàn tất xác thực.
              </p>
            </div>

            {/* 6 OTP Pin Boxes */}
            <div className="flex items-center justify-center gap-2 py-3">
              {otpPin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => onOtpKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-xl font-mono font-bold bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500 rounded-xl text-emerald-400 outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                onClick={onVerifyOtp}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/60"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận & Kích hoạt</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 10 Recovery / Backup Codes */}
        {step === 4 && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Bước 4: Lưu trữ 10 Mã khôi phục dự phòng</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Hãy lưu lại 10 mã này ở nơi an toàn. Bạn có thể dùng mỗi mã một lần để đăng nhập nếu bị mất điện thoại.
              </p>
            </div>

            {/* 10 Backup Codes Grid */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 grid grid-cols-2 gap-2.5 font-mono text-xs font-bold text-emerald-400 tracking-wider">
              {config.backupCodes.map((code, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-center">
                  {code}
                </div>
              ))}
            </div>

            {/* Download & Copy Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onDownloadTxt}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tải file .txt</span>
              </button>
              <button
                type="button"
                onClick={onCopyBackupCodes}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Sao chép mã</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Hoàn tất thiết lập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
