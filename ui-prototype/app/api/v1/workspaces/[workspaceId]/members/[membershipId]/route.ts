import { getApiUser, hasAal2 } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { membershipSuspendedEmail } from "@/app/lib/email-templates";
import { sendTransactionalEmail } from "@/app/lib/email";
import { routeError } from "@/app/lib/route-handler";
import { enumValue, parseJson } from "@/app/lib/validation";
import { getMembershipEmailContext, removeMember, updateMember } from "@/db/collaboration";

function response(result: Awaited<ReturnType<typeof updateMember>>) {
  if (result.kind === "ok") return ok(result.membership);
  if (result.kind === "transfer_required") return fail("OWNERSHIP_TRANSFER_REQUIRED", "Dùng quy trình chuyển ownership", 422);
  if (result.kind === "last_owner") return fail("LAST_OWNER", "Workspace phải còn ít nhất một owner", 409);
  if (result.kind === "denied") return fail("PERMISSION_DENIED", "Bạn không có quyền thay đổi thành viên này", 403);
  return fail("NOT_FOUND", "Membership not found", 404);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ workspaceId: string; membershipId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    if (!hasAal2(auth)) return fail("MFA_REQUIRED", "Verify MFA before changing a member", 403);
    const { workspaceId, membershipId } = await params;
    const body = await parseJson(request);
    const changes = {
      ...(body.role !== undefined ? { role: enumValue(body, "role", ["OWNER", "ADMIN", "MEMBER", "GUEST"] as const) } : {}),
      ...(body.status !== undefined ? { status: enumValue(body, "status", ["ACTIVE", "SUSPENDED", "LEFT"] as const) } : {}),
    };
    const result = await updateMember(workspaceId, membershipId, auth.user.id, changes);
    if (result.kind === "ok" && changes.status === "SUSPENDED") {
      const context = await getMembershipEmailContext(workspaceId, membershipId);
      if (context) {
        const message = membershipSuspendedEmail({ ...context, name: context.name ?? "Thành viên" });
        try { await sendTransactionalEmail({ to: context.email, ...message, idempotencyKey: `membership-suspended-${membershipId}-${result.membership?.updated_at ?? ""}` }); }
        catch { /* Authorization stays authoritative if email delivery fails. */ }
      }
    }
    return response(result);
  } catch (error) { return routeError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ workspaceId: string; membershipId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  if (!hasAal2(auth)) return fail("MFA_REQUIRED", "Verify MFA before removing a member", 403);
  const { workspaceId, membershipId } = await params;
  return response(await removeMember(workspaceId, membershipId, auth.user.id));
}
