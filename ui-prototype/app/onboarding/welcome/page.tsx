"use client";

import Link from "next/link";
import { CheckCircle, Rocket, Users, PlusCircle, Layout, ArrowRight } from "lucide-react";

export default function WelcomeOnboardingPage() {
  const steps = [
    { title: "Tạo không gian làm việc (Workspace)", desc: "Đã hoàn thành thiết lập workspace", done: true, icon: Layout },
    { title: "Mời đồng đội tham gia", desc: "Gửi lời mời email cho thành viên", done: false, icon: Users, link: "/app/members" },
    { title: "Tạo dự án đầu tiên", desc: "Lựa chọn mẫu Kanban hoặc List view", done: false, icon: PlusCircle, link: "/app/projects/new" },
    { title: "Khám phá giao diện Dashboard", desc: "Xem báo cáo tổng quan tiến độ", done: false, icon: Rocket, link: "/app" },
  ];

  return (
    <div className="marketing flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-white p-10 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="badge">ONBOARDING TASKFLOW</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
          Chào mừng bạn đến với TaskFlow! 🚀
        </h1>
        <p className="mt-2 text-base text-[var(--muted)]">
          Hoàn tất 4 bước nhanh dưới đây để làm quen với quy trình làm việc hiệu suất cao.
        </p>

        <div className="mt-8 space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  step.done ? "border-emerald-200 bg-emerald-50/50" : "border-[var(--line)] bg-white hover:border-[var(--primary)]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.done ? "bg-emerald-500 text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]"}`}>
                    {step.done ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--ink)] text-sm">{step.title}</h3>
                    <p className="text-xs text-[var(--muted)]">{step.desc}</p>
                  </div>
                </div>

                {step.done ? (
                  <span className="text-xs font-semibold text-emerald-700">Đã xong ✓</span>
                ) : (
                  <Link href={step.link || "#"} className="button secondary text-xs">
                    Thực hiện <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-6">
          <Link href="/app" className="text-xs text-[var(--muted)] hover:underline">
            Bỏ qua trải nghiệm ban đầu
          </Link>
          <Link href="/app" className="button primary">
            Vào ngay Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
