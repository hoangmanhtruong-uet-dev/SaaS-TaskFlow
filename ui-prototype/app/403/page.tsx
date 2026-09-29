"use client";

import Link from "next/link";
import { ShieldAlert, LayoutDashboard } from "lucide-react";

export default function Forbidden403Page() {
  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ShieldAlert size={48} />
        </div>

        <h1 className="text-3xl font-extrabold text-[var(--ink)]">403 / Access Denied</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Bạn không có đủ quyền truy cập vào tài nguyên này. Vui lòng liên hệ Admin của Workspace để được cấp quyền.
        </p>

        <div className="mt-8 space-y-3">
          <Link href="/app" className="button primary w-full">
            <LayoutDashboard size={18} /> Quay lại Dashboard
          </Link>
          <Link href="/support/contact" className="button secondary w-full">
            Gửi yêu cầu cấp quyền
          </Link>
        </div>
      </div>
    </div>
  );
}
