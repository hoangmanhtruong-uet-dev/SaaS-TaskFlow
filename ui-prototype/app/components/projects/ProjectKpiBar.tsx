"use client";

import { FolderKanban, Activity, AlertTriangle, Users } from "lucide-react";

interface KpiStats {
  totalProjects: number;
  activeProjects: number;
  overdueTasks: number;
  totalMembers: number;
}

interface ProjectKpiBarProps {
  stats: KpiStats;
}

export function ProjectKpiBar({ stats }: ProjectKpiBarProps) {
  const cards = [
    {
      title: "Tổng số dự án",
      value: stats.totalProjects,
      subtitle: "Đã khởi tạo trong workspace",
      icon: FolderKanban,
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    {
      title: "Dự án đang chạy",
      value: stats.activeProjects,
      subtitle: "Đang triển khai thực tế",
      icon: Activity,
      color: "blue",
      bgGradient: "from-blue-500/10 to-cyan-500/5",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Công việc quá hạn",
      value: stats.overdueTasks,
      subtitle: "Cần ưu tiên xử lý",
      icon: AlertTriangle,
      color: "rose",
      bgGradient: "from-rose-500/10 to-amber-500/5",
      borderColor: "border-rose-500/20",
      iconBg: "bg-rose-500/10 text-rose-400",
    },
    {
      title: "Tổng thành viên",
      value: stats.totalMembers,
      subtitle: "Tham gia các dự án",
      icon: Users,
      color: "purple",
      bgGradient: "from-purple-500/10 to-indigo-500/5",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500/10 text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
}
