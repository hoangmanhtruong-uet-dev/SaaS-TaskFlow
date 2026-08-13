import { getAuthenticatedIdentity } from "@/app/lib/auth";
import { fail, ok } from "@/app/lib/api-response";
import { ensureCurrentUser, listUserWorkspaces } from "@/db/users";
export async function GET() {
  const authenticated = await getAuthenticatedIdentity();
  if (!authenticated) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const user = await ensureCurrentUser(authenticated.authUser);
  if (!user) return fail("USER_PROVISION_FAILED", "Could not provision user", 500);
  const workspaceRows = await listUserWorkspaces(user.id);
  const workspaces = workspaceRows.map((workspace: Awaited<ReturnType<typeof listUserWorkspaces>>[number]) => ({ ...workspace, archivedAt: workspace.archivedAt?.toISOString() ?? null }));
  return ok({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null, timezone: user.timezone, workspaces });
}
