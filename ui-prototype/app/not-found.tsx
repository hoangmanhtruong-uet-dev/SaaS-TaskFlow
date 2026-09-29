"use client";

import Link from "next/link";
import { FileQuestion, LayoutDashboard, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
          <FileQuestion size={48} />
        </div>

        <h1 className="text-4xl font-extrabold text-[var(--ink)]">404</h1>
        <h2 className="mt-1 text-lg font-bold text-[var(--ink)]">Trang không tồn tại</h2>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          Đường dẫn này có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </p>

        <div className="mt-6 space-y-3">
          <Link href="/app" className="button primary w-full">
            <LayoutDashboard size={18} /> Về trang Dashboard
          </Link>
          <Link href="/app/search" className="button secondary w-full">
            <Search size={16} /> Tìm kiếm toàn cục
          </Link>
        </div>
      </div>
    </div>
  );
}
