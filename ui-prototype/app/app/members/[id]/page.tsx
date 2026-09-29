"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Shield, CheckCircle2, FolderKanban, Activity } from "lucide-react";

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const member = {
    id,
    name: "Nguyễn Minh Quân",
    email: "quan.nguyen@example.com",
    role: "ADMIN",
    joinedDate: "15/01/2026",
    tasksCompleted: 42,
    projectsCount: 5,
  };

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/app/members" className="text-xs font-semibold text-[var(--muted)] hover:underline flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Danh sách thành viên
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--primary)] to-emerald-400 text-2xl font-bold text-white shadow-md">
            NQ
          </div>
          <h1 className="text-xl font-bold text-[var(--ink)]">{member.name}</h1>
          <p className="mt-1 text-xs text-[var(--muted)] flex items-center justify-center gap-1">
            <Mail size={12} /> {member.email}
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-dark)]">
            <Shield size={14} /> {member.role}
          </div>

          <div className="mt-6 border-t border-[var(--line)] pt-4 text-left text-xs space-y-2 text-[var(--muted)]">
            <div className="flex justify-between">
              <span>Ngày tham gia:</span>
              <strong className="text-[var(--ink)]">{member.joinedDate}</strong>
            </div>
            <div className="flex justify-between">
              <span>Công việc hoàn thành:</span>
              <strong className="text-[var(--ink)]">{member.tasksCompleted}</strong>
            </div>
            <div className="flex justify-between">
              <span>Dự án tham gia:</span>
              <strong className="text-[var(--ink)]">{member.projectsCount}</strong>
            </div>
          </div>
        </div>

        {/* Details & Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <FolderKanban size={18} className="text-[var(--primary)]" /> Dự án đang tham gia
            </h2>
            <div className="space-y-3">
              {["SaaS TaskFlow Redesign", "API Gateway Core Engine", "Stripe Payment Module"].map((proj, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-[var(--line)] p-3 hover:border-[var(--primary)] transition-colors">
                  <span className="font-semibold text-sm text-[var(--ink)]">{proj}</span>
                  <span className="badge">Đang hoạt động</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[var(--primary)]" /> Hoạt động gần đây
            </h2>
            <div className="space-y-4 text-xs text-[var(--muted)]">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Hoàn thành task <strong>&quot;Thiết kế schema DB&quot;</strong> (2 giờ trước)</span>
              </div>
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-blue-500" />
                <span>Cập nhật trạng thái dự án <strong>&quot;SaaS TaskFlow Redesign&quot;</strong> (Hôm qua)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
