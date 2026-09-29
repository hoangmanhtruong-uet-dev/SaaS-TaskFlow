 
"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  const [cooldown, setCooldown] = useState(48);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown === 0) {
      setResent(true);
      setCooldown(60);
    }
  };

  return (
    <div className="marketing flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
          <Mail size={32} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">Kiểm tra hộp thư của bạn</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Chúng tôi đã gửi đường dẫn xác thực tài khoản tới email:
        </p>
        <p className="mt-1 font-semibold text-[var(--ink)]">user@example.com</p>

        {resent && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            <CheckCircle2 size={16} /> Đã gửi lại email xác thực thành công!
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="button primary w-full"
          >
            {cooldown > 0 ? (
              <>Gửi lại email sau {cooldown}s</>
            ) : (
              <>
                <RefreshCw size={16} /> Gửi lại email xác thực
              </>
            )}
          </button>

          <a href="/login" className="button ghost w-full text-xs">
            <ArrowLeft size={14} /> Quay lại trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
}
