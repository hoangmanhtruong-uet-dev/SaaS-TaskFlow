import { getApiUser, hasAal2 } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { enumValue, parseJson, requiredString } from "@/app/lib/validation";
import { createInvitation, listInvitations } from "@/db/collaboration";
import { processOutbox } from "@/db/outbox";

export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params; const data = await listInvitations(workspaceId, auth.user.id);
  return data ? ok(data) : fail("PERMISSION_DENIED", "Bạn không có quyền xem lời mời", 403);
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    if (!hasAal2(auth)) return fail("MFA_REQUIRED", "Verify MFA before inviting a member", 403);
    const { workspaceId } = await params; const body = await parseJson(request);
    const email = requiredString(body, "email", 254);
    const role = enumValue(body, "role", ["ADMIN", "MEMBER", "GUEST"] as const, "MEMBER");
    const result = await createInvitation(workspaceId, auth.user.id, email, role, new URL(request.url).origin);
    if (result.kind === "denied") return fail("PERMISSION_DENIED", "Bạn không có quyền mời role này", 403);
    if (result.kind === "rate_limited") return fail("RATE_LIMITED", "Bạn đã gửi quá nhiều lời mời", 429, { retryAfterSeconds: result.retryAfterSeconds });
    if (result.kind === "duplicate") return fail("INVITATION_ALREADY_PENDING", "Email này đã có lời mời đang chờ", 409);
    if (result.kind === "seat_limit") return fail("SEAT_LIMIT_REACHED", "Workspace đã dùng hết số seat của gói hiện tại.", 402);
    const delivery = await processOutbox(1);
    return ok({ id: result.id, token: result.token, inviteUrl: `/invite/${result.token}`, expiresAt: result.expiresAt.toISOString(), emailDelivery: delivery.processed > 0 ? "sent" : "queued" }, 201);
  } catch (error) { return routeError(error); }
}
