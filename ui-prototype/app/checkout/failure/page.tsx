"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw, HelpCircle, ArrowLeft } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle size={48} />
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--ink)]">Thanh toán không thành công</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Giao dịch ngân hàng bị từ chối hoặc hết thời gian xử lý. Vui lòng kiểm tra lại thông tin thẻ.
        </p>

        <div className="mt-8 space-y-3">
          <Link href="/checkout" className="button primary w-full">
            <RefreshCw size={18} /> Thử thanh toán lại
          </Link>
          <Link href="/support/contact" className="button secondary w-full">
            <HelpCircle size={18} /> Liên hệ Hỗ trợ khách hàng
          </Link>
          <Link href="/app" className="button ghost w-full text-xs">
            <ArrowLeft size={14} /> Quay lại ứng dụng
          </Link>
        </div>
      </div>
    </div>
  );
}
