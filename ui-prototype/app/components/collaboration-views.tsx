 
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Mail } from "lucide-react";
import { useApiResource } from "@/app/hooks/use-api-resource";
import { collaborationService } from "@/app/services/collaboration-service";
import { ApiClientError } from "@/app/services/http-client";
import { Badge, Button, ButtonLink, ErrorState, ListSkeleton } from "./ui";
import type { Invitation } from "@/app/types/domain";

import { TeamManagementContainer } from "./members/TeamManagementContainer";

export function MembersView() {
  return <TeamManagementContainer />;
}


import { ActivityDashboardContainer } from "./activity/ActivityDashboardContainer";

export function ActivityView() {
  return <ActivityDashboardContainer />;
}


import { NotificationsContainer } from "./notifications/NotificationsContainer";

export function NotificationsView() {
  return (
    <div className="w-full h-full flex-1 p-4 sm:p-6 bg-zinc-950 text-zinc-100">
      <NotificationsContainer />
    </div>
  );
}


export function InvitationView({ token }: { token: string }) { const router = useRouter(); const resource = useApiResource(() => collaborationService.invitation(token), `invitation:${token}`); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [needsAuth, setNeedsAuth] = useState(false); if (resource.loading) return <main className="auth-stage"><ListSkeleton /></main>; if (resource.error || !resource.data) return <main className="auth-stage"><ErrorState retry={resource.reload} /></main>; const invitation: Invitation = resource.data; async function respond(action: "accept" | "decline") { setBusy(true); setError(""); setNeedsAuth(false); try { const result = await collaborationService.respondInvitation(token, action); if (action === "accept" && result.workspaceId) router.push("/app"); else await resource.reload(); } catch (value) { setNeedsAuth(value instanceof ApiClientError && value.code === "AUTH_REQUIRED"); setError(value instanceof Error ? value.message : "Không xử lý được lời mời"); } finally { setBusy(false); } } const loginUrl = `/login?next=${encodeURIComponent(`/invite/${token}`)}`; return <main className="auth-stage"><section className="invite-card"><Mail className="auth-icon" /><Badge>LỜI MỜI WORKSPACE</Badge><h1>{invitation.workspaceName}</h1><p>Bạn được mời tham gia với vai trò <strong>{invitation.role}</strong>.</p><div className="invite-detail"><span>Email<strong>{invitation.email}</strong></span><span>Trạng thái<strong>{invitation.status}</strong></span><span>Hết hạn<strong>{new Date(invitation.expiresAt).toLocaleDateString("vi-VN")}</strong></span></div>{invitation.status === "PENDING" ? <><Button disabled={busy} onClick={() => respond("accept")}>Chấp nhận lời mời</Button><Button disabled={busy} variant="secondary" onClick={() => respond("decline")}>Từ chối</Button></> : <p>Lời mời này không còn chờ xử lý.</p>}{error && <p className="form-error">{error}</p>}{needsAuth && <ButtonLink href={loginUrl}>Đăng nhập rồi quay lại lời mời</ButtonLink>}<small><Clock3 /> Liên kết chỉ dành cho đúng email được mời</small></section></main>; }
