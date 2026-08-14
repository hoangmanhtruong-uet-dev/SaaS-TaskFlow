import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeReturnPath } from "@/app/lib/auth-redirect";

export type AuthIdentity = {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

export function identityFromUser(user: User): AuthIdentity {
  const email = user.email ?? "";
  return {
    userId: user.id,
    email,
    displayName: String(user.user_metadata.full_name ?? user.user_metadata.name ?? email.split("@")[0] ?? "TaskFlow user"),
    avatarUrl: typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null,
  };
}

export async function getAuthenticatedIdentity() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : { identity: identityFromUser(user), authUser: user };
}

export async function requireAuthenticatedIdentity(returnTo: string) {
  const authenticated = await getAuthenticatedIdentity();
  if (authenticated) return authenticated;
  redirect(`/login?next=${encodeURIComponent(safeReturnPath(returnTo))}`);
}
