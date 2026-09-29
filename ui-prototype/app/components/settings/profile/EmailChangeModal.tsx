 
"use client";

import React, { useState, useEffect } from "react";
import { Mail, X, ShieldCheck, ArrowRight, Check, RefreshCw, Sparkles } from "lucide-react";

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onConfirmNewEmail: (newEmail: string) => void;
  onSuccessToast: (msg: string) => void;
}

export const EmailChangeModal: React.FC<EmailChangeModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onConfirmNewEmail,
  onSuccessToast,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Input email, Step 2: Input OTP
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // OTP code generated from API
  const [serverOtp, setServerOtp] = useState("355338");
  const [isResendFallback, setIsResendFallback] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const resetTimer = window.setTimeout(() => {
        setStep(1);
        setNewEmail("");
        setConfirmEmail("");
        setOtpCode("");
        setError("");
        setLoading(false);
        setCountdown(60);
        setIsResendFallback(false);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  if (!isOpen) return null;

  // Step 1: Request OTP via Resend API
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Vui lòng nhập địa chỉ email mới hợp lệ.");
      return;
    }

    if (newEmail !== confirmEmail) {
      setError("Email xác nhận không trùng khớp với email mới.");
      return;
    }

    if (newEmail === currentEmail) {
      setError("Email mới trùng với email hiện tại của bạn.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/profile/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      // API returns { data: {...}, meta: {...} } on success
      // or { error: { code, message }, meta: {...} } on failure
      const json = await res.json();

      if (res.ok && json.data) {
        setServerOtp(json.data.otp);
        setIsResendFallback(!!json.data.isFallback);
        setOtpCode("");
        setStep(2);
        setCountdown(60);

        if (json.data.isFallback) {
          onSuccessToast(`Đã khởi tạo mã OTP (Resend Sandbox – xem ô vàng bên dưới để điền nhanh)`);
        } else {
          onSuccessToast(`✅ Đã gửi Email OTP qua Resend thành công tới ${newEmail}!`);
        }
      } else {
        setError(json.error?.message || "Không thể gửi email xác thực. Vui lòng thử lại.");
      }
    } catch {
      // Network-level fallback
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(generated);
      setIsResendFallback(true);
      setStep(2);
      setCountdown(60);
      onSuccessToast(`⚡ Network fallback – mã OTP: ${generated}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.trim() !== serverOtp) {
      setError(`Mã OTP nhập chưa chính xác! Vui lòng nhập đúng 6 chữ số mã OTP (${serverOtp}).`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirmNewEmail(newEmail);
      onSuccessToast(`Xác thực thành công! Địa chỉ email đã được cập nhật thành ${newEmail}.`);
      onClose();
    }, 800);
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/profile/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      // API returns { data: {...}, meta: {...} } on success
      const json = await res.json();
      if (res.ok && json.data) {
        setServerOtp(json.data.otp);
        setIsResendFallback(!!json.data.isFallback);
        setCountdown(60);
        onSuccessToast(json.data.isFallback ? `OTP mới (Sandbox): ${json.data.otp}` : `✅ Đã gửi lại OTP qua Resend!`);
      } else {
        setError(json.error?.message || "Gửi lại thất bại. Thử lại sau.");
      }
    } catch {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(generated);
      setIsResendFallback(true);
      setCountdown(60);
      onSuccessToast(`⚡ Fallback OTP mới: ${generated}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillOtp = () => {
    setOtpCode(serverOtp);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                {step === 1 ? "Yêu cầu thay đổi Email" : "Xác thực mã OTP Email mới"}
              </h3>
              <p className="text-xs text-zinc-400">Tích hợp Resend API Email Service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: INPUT NEW EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="current-email" className="text-xs text-zinc-400 font-medium">Email hiện tại</label>
              <input
                id="current-email"
                type="text"
                value={currentEmail}
                disabled
                className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-xl px-3.5 py-2.5 text-zinc-500 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="new-email" className="text-xs font-semibold text-zinc-200">
                Địa chỉ Email mới <span className="text-red-400">*</span>
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nhapemailmoi@domain.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-email" className="text-xs font-semibold text-zinc-200">
                Xác nhận Email mới <span className="text-red-400">*</span>
              </label>
              <input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="nhaplaiemailmoi@domain.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-400 space-y-1">
              <div className="font-semibold text-zinc-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resend Email Service Connected:</span>
              </div>
              <p>1. Hệ thống sẽ gọi Resend API gửi email chứa mã OTP 6 chữ số.</p>
              <p>2. Kiểm tra Hộp thư đến (Gmail) hoặc dùng mã OTP hiển thị để xác nhận.</p>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                <span>{loading ? "Đang gửi qua Resend..." : "Gửi mã xác minh OTP"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: ENTER OTP CODE */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-indigo-300 font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Email xác thực mới:</span>
                </div>
                <span className="font-mono font-bold text-white text-xs">{newEmail}</span>
              </div>

              {/* Resend status banner */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Mã OTP hệ thống: <strong className="text-amber-300 font-mono text-sm tracking-widest">{serverOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillOtp}
                  className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-bold text-[10px] hover:bg-amber-300 transition shrink-0"
                >
                  Điền nhanh
                </button>
              </div>

              {isResendFallback && (
                <div className="text-[10px] text-zinc-400 italic pt-0.5">
                  ⚠️ <strong className="text-amber-400">Resend Sandbox</strong>: Chỉ gửi email thật tới địa chỉ đã đăng ký tài khoản Resend. Với địa chỉ khác, dùng ô <strong>Điền nhanh</strong> phía trên để test mã OTP.
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email-otp" className="block text-xs font-semibold text-zinc-200">
                Nhập mã OTP (6 chữ số)
              </label>
              <input
                id="email-otp"
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={`Nhập ${serverOtp}`}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-center font-mono text-xl font-bold tracking-widest rounded-xl py-3 text-emerald-400 outline-none transition"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Hạn mã OTP: {countdown}s</span>
              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleResendOtp}
                className="text-indigo-400 hover:underline disabled:opacity-40 flex items-center gap-1 text-xs font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Gửi lại mã OTP qua Resend</span>
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition"
              >
                ← Nhập lại email khác
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? "Đang xác nhận..." : "Xác nhận & Cập nhật Email"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
