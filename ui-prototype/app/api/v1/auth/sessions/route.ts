import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { listProviderSessions } from "@/db/auth";

export async function GET() {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required or session revoked", 401);
  const sessions = await listProviderSessions(auth.user.id);
  return ok(sessions.map((session) => ({
    ...session,
    current: session.id === auth.session?.id,
    expiresAt: session.expiresAt.toISOString(),
    lastSeenAt: session.lastSeenAt.toISOString(),
    revokedAt: session.revokedAt?.toISOString() ?? null,
    createdAt: session.createdAt.toISOString(),
  })));
}
