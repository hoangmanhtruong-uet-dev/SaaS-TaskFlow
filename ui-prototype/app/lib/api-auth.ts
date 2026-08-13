import { getAuthenticatedIdentity } from "@/app/lib/auth";
import { ensureCurrentUser } from "@/db/users";

export async function getApiUser() {
  const authenticated = await getAuthenticatedIdentity();
  if (!authenticated) return null;
  const user = await ensureCurrentUser(authenticated.authUser);
  if (!user) return null;
  return { identity: authenticated.identity, user, session: null };
}
