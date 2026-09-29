 
"use client";

import Link from "next/link";
import { ServerCrash, RefreshCw, HelpCircle } from "lucide-react";

export default function GlobalError500Page() {
  const refId = "ERR-892401";

  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <ServerCrash size={48} />
        </div>

        <h1 className="text-3xl font-extrabold text-[var(--ink)]">500 / System Interruption</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Đã có lỗi hệ thống ngoài dự kiến xảy ra. Đội ngũ kỹ thuật đã nhận được cảnh báo tự động.
        </p>

        <div className="mt-4 rounded-lg bg-gray-100 p-2 text-xs font-mono text-gray-700">
          Mã tham chiếu lỗi: <strong>{refId}</strong>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={() => window.location.reload()} className="button primary w-full">
            <RefreshCw size={18} /> Tải lại trang (Reload)
          </button>
          <Link href="/support/contact" className="button secondary w-full">
            <HelpCircle size={18} /> Báo cáo sự cố
          </Link>
        </div>
      </div>
    </div>
  );
}
