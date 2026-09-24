import type { User } from "@supabase/supabase-js";
import { identityFromUser } from "@/app/lib/auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function ensureCurrentUser(authUser: User) {
  const identity = identityFromUser(authUser);
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: authUser.id,
        provider_user_id: authUser.id,
        email: identity.email,
        name: identity.displayName ?? "",
        avatar_url: identity.avatarUrl,
        email_verified_at: authUser.email_confirmed_at ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) throw new Error(`ensureCurrentUser failed: ${error.message}`);
  return data;
}

export async function listUserWorkspaces(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("id, role, workspaces(id, name, slug, plan, archived_at, deletion_requested_at)")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  if (error) throw new Error(`listUserWorkspaces failed: ${error.message}`);

  return (data ?? [])
    .filter((m) => m.workspaces)
    .map((m) => {
      const ws = m.workspaces as unknown as { id: string; name: string; slug: string; plan: string; archived_at: string | null; deletion_requested_at: string | null };
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan as "FREE" | "PRO",
        role: m.role as "OWNER" | "ADMIN" | "MEMBER" | "GUEST",
        archivedAt: ws.archived_at ? new Date(ws.archived_at) : null,
        deletionRequestedAt: ws.deletion_requested_at ? new Date(ws.deletion_requested_at) : null,
      };
    });
}
