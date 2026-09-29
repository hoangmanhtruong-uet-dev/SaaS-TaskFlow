import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { listMembers, leaveWorkspace } from "@/db/collaboration";

export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params; const data = await listMembers(workspaceId, auth.user.id);
  return data ? ok(data) : fail("NOT_FOUND", "Workspace not found", 404);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params; const result = await leaveWorkspace(workspaceId, auth.user.id);
  if (result.kind === "last_owner") return fail("LAST_OWNER", "Workspace phải còn ít nhất một owner", 409);
  return result.kind === "ok" ? ok({ left: true }) : fail("NOT_FOUND", "Workspace not found", 404);
}
