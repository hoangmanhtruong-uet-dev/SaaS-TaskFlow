import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { enumValue, parseJson, requiredString } from "@/app/lib/validation";
import { createInvitation, listInvitations } from "@/db/collaboration";

export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params; const data = await listInvitations(workspaceId, auth.user.id);
  return data ? ok(data) : fail("PERMISSION_DENIED", "Bạn không có quyền xem lời mời", 403);
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId } = await params; const body = await parseJson(request);
    const result = await createInvitation(workspaceId, auth.user.id, requiredString(body, "email", 254), enumValue(body, "role", ["ADMIN", "MEMBER", "GUEST"] as const, "MEMBER"));
    if (result.kind === "denied") return fail("PERMISSION_DENIED", "Bạn không có quyền mời role này", 403);
    if (result.kind === "rate_limited") return fail("RATE_LIMITED", "Bạn đã gửi quá nhiều lời mời", 429, { retryAfterSeconds: result.retryAfterSeconds });
    if (result.kind === "duplicate") return fail("INVITATION_ALREADY_PENDING", "Email này đã có lời mời đang chờ", 409);
    return ok({ id: result.id, token: result.token, inviteUrl: `/invite/${result.token}`, expiresAt: result.expiresAt.toISOString() }, 201);
  } catch (error) { return routeError(error); }
}
