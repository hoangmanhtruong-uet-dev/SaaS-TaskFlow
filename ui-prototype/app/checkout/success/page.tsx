"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, LayoutDashboard, Receipt } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={48} />
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--ink)]">Nâng cấp gói thành công! 🎉</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Cảm ơn bạn! Workspace của bạn đã được nâng cấp lên <strong>Pro Tier</strong>. Tất cả tính năng cao cấp đã được mở khóa toàn bộ.
        </p>

        <div className="mt-8 space-y-3">
          <Link href="/app" className="button primary w-full">
            <LayoutDashboard size={18} /> Đi tới Workspace <ArrowRight size={16} />
          </Link>
          <Link href="/app/settings/billing" className="button secondary w-full">
            <Receipt size={18} /> Xem hóa đơn & Billing
          </Link>
        </div>
      </div>
    </div>
  );
}
