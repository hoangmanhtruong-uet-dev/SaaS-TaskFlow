 
"use client";

import { Calendar, AlertTriangle, Activity, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { KpiStats } from "./types";

interface MyTasksKpiHeaderProps {
  stats: KpiStats;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function MyTasksKpiHeader({ stats, isExpanded, onToggleExpand }: MyTasksKpiHeaderProps) {
  const cards = [
    {
      title: "Cần làm hôm nay",
      value: stats.dueToday,
      unit: "task",
      subtitle: "Hạn chót trong 24h",
      icon: Calendar,
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Quá hạn cần xử lý",
      value: stats.overdue,
      unit: "task",
      subtitle: "Cần giải quyết ngay",
      icon: AlertTriangle,
      bgGradient: "from-rose-500/10 to-amber-500/5",
      borderColor: "border-rose-500/20",
      iconBg: "bg-rose-500/10 text-rose-400",
    },
    {
      title: "Đang thực hiện",
      value: stats.inProgress,
      unit: "task",
      subtitle: "Công việc đang chạy",
      icon: Activity,
      bgGradient: "from-blue-500/10 to-cyan-500/5",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Hoàn thành tuần này",
      value: stats.completedThisWeek,
      unit: "task",
      subtitle: "Năng suất cá nhân",
      icon: CheckCircle2,
      bgGradient: "from-purple-500/10 to-indigo-500/5",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
        <span>Chỉ số công việc cá nhân</span>
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-1 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-850 transition-colors"
          title={isExpanded ? "Thu gọn thống kê" : "Mở rộng thống kê"}
        >
          <span>{isExpanded ? "Thu gọn" : "Mở rộng"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl bg-gradient-to-br ${card.bgGradient} bg-zinc-900/80 border ${card.borderColor} shadow-sm backdrop-blur-sm transition-all hover:border-zinc-700`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">{card.title}</span>
                  <div className={`p-2 rounded-lg ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-zinc-100">{card.value}</span>
                  <span className="text-[11px] text-zinc-500">{card.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
