"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("technical");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="marketing min-h-screen bg-[var(--surface)] p-6">
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/support" className="text-xs font-semibold text-[var(--muted)] hover:underline flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Trung tâm hỗ trợ
        </Link>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
          {!submitted ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--ink)]">Gửi yêu cầu hỗ trợ (Support Ticket)</h1>
                  <p className="text-xs text-[var(--muted)]">Đội ngũ kỹ thuật sẽ phản hồi bạn trong vòng 24 giờ làm việc.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                  <label htmlFor="category">Danh mục hỗ trợ</label>
                  <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="technical">Sự cố kỹ thuật & Lỗi hệ thống</option>
                    <option value="billing">Hóa đơn & Thanh toán gói cước</option>
                    <option value="account">Tài khoản & Xác thực MFA</option>
                    <option value="feature">Góp ý tính năng mới</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="subject">Tiêu đề yêu cầu (Subject)</label>
                  <input
                    id="subject"
                    placeholder="Mô tả tóm tắt vấn đề bạn gặp phải..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="message">Mô tả chi tiết</label>
                  <textarea
                    id="message"
                    placeholder="Vui lòng cung cấp các bước tạo lại lỗi hoặc thông tin liên quan..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button type="submit" className="button primary">
                    <Send size={16} /> Gửi yêu cầu hỗ trợ
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 size={56} className="mx-auto text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">Đã gửi yêu cầu thành công!</h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                Mã yêu cầu của bạn là <strong>#TK-89421</strong>. Thông báo phản hồi sẽ được gửi tới email của bạn.
              </p>
              <Link href="/app" className="button primary text-xs">
                Quay lại Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
