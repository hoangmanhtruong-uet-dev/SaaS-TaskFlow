"use client";

import Link from "next/link";
import { Lock, HelpCircle, ArrowLeft } from "lucide-react";

export default function AccountLockedPage() {
  return (
    <div className="marketing flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Lock size={32} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tài khoản bị khóa tạm thời</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Tài khoản của bạn đã bị khóa do nhập sai mật khẩu quá 5 lần liên tiếp để bảo vệ an toàn dữ liệu.
        </p>

        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          Vui lòng thử lại sau 30 phút hoặc liên hệ Quản trị viên hệ thống để khôi phục truy cập.
        </div>

        <div className="mt-8 space-y-3">
          <Link href="/login" className="button primary w-full">
            <ArrowLeft size={16} /> Quay lại trang đăng nhập
          </Link>
          <Link href="/support/contact" className="button secondary w-full">
            <HelpCircle size={16} /> Gửi yêu cầu hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}
