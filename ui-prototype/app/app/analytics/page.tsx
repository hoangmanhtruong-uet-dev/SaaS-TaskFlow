"use client";

import { useState } from "react";
import { Download, TrendingUp, CheckCircle, Clock, AlertTriangle, BarChart3, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7days");

  const kpis = [
    { title: "Công việc đã tạo", value: "148", change: "+12%", icon: BarChart3, color: "text-blue-600 bg-blue-50" },
    { title: "Công việc hoàn thành", value: "112", change: "+18%", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { title: "Công việc quá hạn", value: "6", change: "-4%", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { title: "Thời gian xử lý TB", value: "1.4 ngày", change: "-8%", icon: Clock, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[var(--muted)]">BÁO CÁO & THỐNG KÊ</span>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Phân tích hiệu suất Workspace</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-[var(--line-strong)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="quarter">Qúy này</option>
          </select>

          <button className="button secondary text-xs">
            <Download size={14} /> Xuất CSV
          </button>
          <button className="button primary text-xs">
            <Download size={14} /> Xuất Báo cáo PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--muted)]">{kpi.title}</span>
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[var(--ink)]">{kpi.value}</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={12} /> {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Burn-down Chart Visual */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center justify-between">
            <span>Burn-down Chart (Biểu đồ tiến độ Sprint)</span>
            <span className="text-xs font-normal text-[var(--muted)]">Mục tiêu: 0 task còn lại</span>
          </h3>

          <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-[var(--line)] pt-6 px-2 pb-1">
            {[90, 82, 70, 55, 40, 22, 10].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-[var(--primary-soft)] rounded-t-md relative flex items-end" style={{ height: `${val * 2}px` }}>
                  <div className="w-full bg-[var(--primary)] rounded-t-md transition-all" style={{ height: `${val * 1.6}px` }} />
                </div>
                <span className="text-[10px] text-[var(--muted)]">Ngày {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center justify-between">
            <span>Phân bổ độ ưu tiên (Priority Distribution)</span>
            <PieChart size={18} className="text-[var(--muted)]" />
          </h3>

          <div className="space-y-4 pt-2">
            {[
              { label: "Khẩn cấp (URGENT)", count: 14, percent: "10%", color: "bg-red-500" },
              { label: "Cao (HIGH)", count: 42, percent: "30%", color: "bg-amber-500" },
              { label: "Trung bình (MEDIUM)", count: 68, percent: "45%", color: "bg-blue-500" },
              { label: "Thấp (LOW)", count: 24, percent: "15%", color: "bg-gray-400" },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[var(--ink)]">
                  <span>{p.label}</span>
                  <span>{p.count} tasks ({p.percent})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${p.color}`} style={{ width: p.percent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
