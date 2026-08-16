import Link from "next/link";
import { CalendarDays, CheckSquare, FolderKanban, LockKeyhole, Plus } from "lucide-react";
import type { Project, TaskSummary } from "@/app/types/domain";
import { taskDueState } from "@/app/lib/task-dates";
import { Avatar, Badge, ButtonLink, Card, EmptyState } from "./ui";

export function PageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p>{eyebrow}</p><h1>{title}</h1></div>{action}</div>;
}

export function TaskList({ tasks }: { tasks: TaskSummary[] }) {
  if (!tasks.length) return <EmptyState title="Chưa có công việc" body="Tạo công việc đầu tiên để bắt đầu theo dõi tiến độ." />;
  return <div>{tasks.map((task) => { const due = taskDueState(task.dueAt); return <Link className="task-row" href={`/app/tasks/${task.id}`} key={task.id}><span className={`priority-line ${task.tone}`} /><div><strong>{task.title}</strong><small><FolderKanban size={13} />{task.projectName} · {task.columnName}</small>{task.checklistTotal > 0 && <small><CheckSquare size={13} />{task.checklistCompleted}/{task.checklistTotal} hoàn tất</small>}</div><Badge tone={task.tone}>{priorityLabel(task.priority)}</Badge><span className={`due ${due.tone}`}><CalendarDays size={14} />{due.label}</span><Avatar name="Lan Anh" small /></Link>; })}</div>;
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (!projects.length) return <EmptyState title="Chưa có dự án" body="Tạo dự án để gom board và công việc theo mục tiêu." />;
  return <div className="project-list-grid">{projects.map((project) => <Card className="project-card" key={project.id}><div><span className="project-icon"><FolderKanban /></span>{project.visibility === "PRIVATE" && <LockKeyhole size={16} />}</div><h3><Link href={`/app/projects/${project.id}/board`}>{project.name}</Link></h3><p>{project.description} · {project.taskCount} công việc</p><div className="progress"><span style={{ width: `${project.progress}%` }} /></div><footer><span>{project.progress}% hoàn thành</span><Avatar name="Lan Anh" small /></footer></Card>)}</div>;
}

export function NewTaskAction() { return <ButtonLink href="/app/tasks/new"><Plus size={16} />Tạo công việc</ButtonLink>; }
function priorityLabel(value: TaskSummary["priority"]) { return ({ LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn cấp" })[value]; }
