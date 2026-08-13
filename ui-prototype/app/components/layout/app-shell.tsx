import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, Archive, Bell, CheckCircle2, FolderKanban, LayoutDashboard, LogOut, Search, Settings, Users } from "lucide-react";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import type { Workspace } from "@/app/types/domain";
import { WorkspaceProvider } from "../providers/workspace-provider";
import { Avatar } from "../ui";
import { Brand } from "./brand";
const nav = [[LayoutDashboard, "Tổng quan", "/app"], [Search, "Tìm kiếm", "/app/search"], [FolderKanban, "Dự án", "/app/projects"], [CheckCircle2, "Việc của tôi", "/app/tasks"], [Archive, "Đã lưu trữ", "/app/archived"], [Activity, "Hoạt động", "/app/activity"], [Users, "Thành viên", "/app/members"], [Settings, "Cài đặt", "/app/settings"]] as const;
export function AppShell({ user, workspace, children }: { user: ChatGPTUser; workspace: Workspace; children: ReactNode }) {
  return <WorkspaceProvider workspace={workspace}><div className="app-stage desktop-app production-app"><aside className="app-sidebar"><Brand href="/app" /><nav>{nav.map(([Icon, label, href]) => <Link href={href} key={href}><Icon size={18} />{label}</Link>)}</nav><div className="sidebar-profile"><Avatar name={user.displayName} /><span><strong>{user.displayName}</strong><small>{workspace.role}</small></span><Link href={chatGPTSignOutPath("/")} aria-label="Đăng xuất"><LogOut size={18} /></Link></div></aside><main className="app-main"><header className="app-header"><strong>{workspace.name}</strong><div className="app-header-actions"><Link href="/app/notifications" aria-label="Thông báo"><Bell /></Link><Avatar name={user.displayName} small /></div></header><div className="app-content">{children}</div></main></div></WorkspaceProvider>;
}
