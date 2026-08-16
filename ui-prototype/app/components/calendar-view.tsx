"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useApiResource } from "@/app/hooks/use-api-resource";
import { taskService } from "@/app/services/task-service";
import type { TaskSummary } from "@/app/types/domain";
import { taskDueState } from "@/app/lib/task-dates";
import { useWorkspace } from "./providers/workspace-provider";
import { ErrorState, ListSkeleton } from "./ui";
import { PageHeading } from "./product-views";

const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first); start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, index) => { const value = new Date(start); value.setDate(start.getDate() + index); return value; });
}

export function CalendarView() {
  const workspace = useWorkspace(); const resource = useApiResource(() => taskService.list(workspace.id), `calendar:${workspace.id}`); const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const days = useMemo(() => monthDays(month), [month]);
  if (resource.loading) return <ListSkeleton rows={6} />;
  if (resource.error) return <ErrorState retry={resource.reload} />;
  const tasks = resource.data ?? []; const scheduled = tasks.filter((task) => task.dueAt); const grouped = new Map<string, TaskSummary[]>();
  for (const task of scheduled) { const key = dateKey(new Date(task.dueAt!)); grouped.set(key, [...(grouped.get(key) ?? []), task]); }
  const overdue = scheduled.filter((task) => taskDueState(task.dueAt).tone === "overdue"); const today = dateKey(new Date());
  return <><PageHeading eyebrow={workspace.name} title="Lịch công việc" /><div className="calendar-toolbar"><button type="button" aria-label="Tháng trước" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></button><h2>Tháng {month.getMonth() + 1}, {month.getFullYear()}</h2><button type="button" aria-label="Tháng sau" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></button><button type="button" className="calendar-today" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Hôm nay</button></div><div className="calendar-layout"><section className="calendar-grid" aria-label={`Lịch tháng ${month.getMonth() + 1}`}><div className="calendar-weekdays">{weekdayLabels.map((label) => <strong key={label}>{label}</strong>)}</div><div className="calendar-days">{days.map((day) => { const key = dateKey(day); const items = grouped.get(key) ?? []; const outside = day.getMonth() !== month.getMonth(); return <article className={`${outside ? "outside" : ""} ${key === today ? "today" : ""}`} key={key}><time dateTime={key}>{day.getDate()}</time>{items.slice(0, 3).map((task) => <Link className={`calendar-task ${task.priority.toLowerCase()}`} href={`/app/tasks/${task.id}`} title={task.title} key={task.id}>{task.title}</Link>)}{items.length > 3 && <small>+{items.length - 3} công việc</small>}</article>; })}</div></section><aside className="calendar-summary"><h2>Cần chú ý</h2><div><strong>{overdue.length}</strong><span>Quá hạn</span></div><div><strong>{scheduled.filter((task) => taskDueState(task.dueAt).tone === "today").length}</strong><span>Đến hạn hôm nay</span></div><div><strong>{tasks.filter((task) => !task.dueAt).length}</strong><span>Chưa có hạn</span></div>{overdue.slice(0, 5).map((task) => <Link href={`/app/tasks/${task.id}`} key={task.id}><CalendarDays />{task.title}</Link>)}</aside></div></>;
}
