 
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";

export default function SupportArticlePage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  return (
    <div className="marketing min-h-screen bg-[var(--surface)] p-6">
      <div className="max-w-4xl mx-auto py-8">
        <Link href="/support" className="text-xs font-semibold text-[var(--muted)] hover:underline flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Trung tâm hỗ trợ (Help Center)
        </Link>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] mb-2 uppercase tracking-wide">
            <BookOpen size={14} /> Hướng dẫn Cấu hình hệ thống
          </div>

          <h1 className="text-3xl font-extrabold text-[var(--ink)] mb-4">
            Cấu hình Webhook & Real-Time API Triggers trong TaskFlow
          </h1>

          <div className="flex items-center gap-4 text-xs text-[var(--muted)] border-b border-[var(--line)] pb-4 mb-6">
            <span>Cập nhật ngày 20/09/2026</span>
            <span>•</span>
            <span>Thời gian đọc: 5 phút</span>
          </div>

          {/* Article Body */}
          <div className="prose max-w-none text-sm leading-relaxed text-[var(--ink)] space-y-4">
            <p>
              TaskFlow hỗ trợ kết nối Webhook theo thời gian thực để gửi sự kiện thay đổi trạng thái công việc (Task Status Changed), tạo thành viên mới và cập nhật dự án tới hệ thống riêng của doanh nghiệp.
            </p>

            <h2 className="text-lg font-bold text-[var(--ink)] pt-4">1. Các bước tạo Webhook Endpoint</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Truy cập vào <strong>Cài đặt Workspace &gt; Tích hợp API</strong>.</li>
              <li>Nhấp vào nút <strong>Tạo Webhook Endpoint mới</strong>.</li>
              <li>Nhập URL nhận sự kiện từ phía server của bạn.</li>
              <li>Chọn danh sách sự kiện cần đăng ký lắng nghe (Payload events).</li>
            </ol>

            <h2 className="text-lg font-bold text-[var(--ink)] pt-4">2. Xác thực chữ ký HMAC SHA-256</h2>
            <p>
              Mọi yêu cầu HTTP POST từ TaskFlow đều đi kèm header <code>X-TaskFlow-Signature</code> chứa mã băm HMAC để đảm bảo tính an toàn dữ liệu.
            </p>
          </div>

          {/* Was this helpful */}
          <div className="mt-10 border-t border-[var(--line)] pt-6 text-center">
            <p className="text-xs font-semibold text-[var(--ink)] mb-3">Bài viết này có hữu ích với bạn không?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setFeedback("yes")}
                className={`button secondary text-xs ${feedback === "yes" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : ""}`}
              >
                <ThumbsUp size={14} /> Có, rất hữu ích
              </button>
              <button
                onClick={() => setFeedback("no")}
                className={`button secondary text-xs ${feedback === "no" ? "bg-red-100 text-red-800 border-red-300" : ""}`}
              >
                <ThumbsDown size={14} /> Chưa giải quyết được
              </button>
            </div>
            {feedback && <p className="text-xs text-emerald-600 mt-3 font-semibold">Cảm ơn bạn đã phản hồi!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
