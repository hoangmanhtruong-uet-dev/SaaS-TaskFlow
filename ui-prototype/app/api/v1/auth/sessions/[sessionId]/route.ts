import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { revokeProviderSession } from "@/db/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { sessionId } = await params;
  return await revokeProviderSession(auth.user.id, sessionId) ? ok({ revoked: true }) : fail("SESSION_NOT_FOUND", "Session not found", 404);
}
