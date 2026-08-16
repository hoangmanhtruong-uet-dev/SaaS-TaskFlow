import { getAuthenticatedIdentity } from "@/app/lib/auth";
import { ensureCurrentUser } from "@/db/users";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function getApiUser() {
  const authenticated = await getAuthenticatedIdentity();
  if (!authenticated) return null;
  const user = await ensureCurrentUser(authenticated.authUser);
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return { identity: authenticated.identity, user, assurance };
}

export function hasAal2(auth: NonNullable<Awaited<ReturnType<typeof getApiUser>>>) {
  return auth.assurance?.currentLevel === "aal2";
}
