 
"use client";

import { use, useState } from "react";
import { ProjectSubNav } from "@/app/components/project-sub-nav";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectTimelinePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [zoom, setZoom] = useState<"Day" | "Week" | "Month">("Week");

  const timelineTasks = [
    { title: "Database Architecture", start: 5, duration: 25, color: "bg-emerald-500", assignee: "Quân Nguyễn" },
    { title: "Authentication & MFA", start: 20, duration: 35, color: "bg-blue-500", assignee: "Trường Hoàng" },
    { title: "Kanban Board Interactivity", start: 40, duration: 30, color: "bg-amber-500", assignee: "Lan Anh" },
    { title: "Analytics & Stripe Billing", start: 60, duration: 30, color: "bg-purple-500", assignee: "Minh Châu" },
  ];

  return (
    <div className="p-6">
      <ProjectSubNav projectId={projectId} projectName="Dự án SaaS TaskFlow" />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button className="button secondary">
            <ChevronLeft size={16} /> Tháng trước
          </button>
          <span className="font-semibold text-sm text-[var(--ink)]">Tháng 9 - Tháng 10 / 2026</span>
          <button className="button secondary">
            Tháng sau <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white p-1">
          {(["Day", "Week", "Month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setZoom(mode)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                zoom === mode ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Timeline Graphic */}
      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="min-w-[800px]">
          {/* Timeline Header Months/Weeks */}
          <div className="flex border-b border-[var(--line)] pb-3 font-semibold text-xs text-[var(--muted)]">
            <div className="w-64">Tên công việc</div>
            <div className="flex-1 grid grid-cols-4 text-center">
              <span>Tuần 1</span>
              <span>Tuần 2</span>
              <span>Tuần 3</span>
              <span>Tuần 4</span>
            </div>
          </div>

          {/* Timeline Bars */}
          <div className="divide-y divide-[var(--line)]">
            {timelineTasks.map((t, idx) => (
              <div key={idx} className="flex items-center py-4 hover:bg-[#f8fbf8] transition-colors">
                <div className="w-64 pr-4">
                  <div className="font-semibold text-sm text-[var(--ink)]">{t.title}</div>
                  <div className="text-xs text-[var(--muted)]">{t.assignee}</div>
                </div>
                <div className="flex-1 relative h-8 bg-gray-50 rounded-lg overflow-hidden">
                  <div
                    className={`absolute top-1 bottom-1 rounded-md ${t.color} text-white flex items-center px-3 text-xs font-bold shadow-sm transition-all`}
                    style={{ left: `${t.start}%`, width: `${t.duration}%` }}
                  >
                    {t.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
