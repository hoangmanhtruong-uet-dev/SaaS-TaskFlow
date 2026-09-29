"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kanban, List, GanttChartSquare, FolderKanban, Settings } from "lucide-react";

export function ProjectSubNav({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Board", href: `/app/projects/${projectId}/board`, icon: Kanban },
    { label: "Danh sách", href: `/app/projects/${projectId}/list`, icon: List },
    { label: "Timeline", href: `/app/projects/${projectId}/timeline`, icon: GanttChartSquare },
    { label: "Tệp tin", href: `/app/projects/${projectId}/files`, icon: FolderKanban },
    { label: "Cài đặt", href: `/app/projects/${projectId}/settings`, icon: Settings },
  ];

  return (
    <div className="border-b border-[var(--line)] bg-white px-6 pt-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-[var(--muted)]">DỰ ÁN</span>
          <h1 className="text-xl font-bold text-[var(--ink)]">{projectName || "Dự án TaskFlow"}</h1>
        </div>
      </div>

      <nav className="flex gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
