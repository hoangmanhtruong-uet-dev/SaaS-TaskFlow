import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { authorizeWorkspace } from "./authorization";
import { getWorkspaceEntitlements } from "./billing";

type ActivityRow = {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  profiles: { name?: string | null } | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function recordActivity(workspaceId: string, actorUserId: string | null, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  await insertActivity(null, workspaceId, actorUserId, action, targetType, targetId, metadata);
}
export async function insertActivity(_db: unknown, workspaceId: string, actorUserId: string | null, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("activity_events").insert({
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      actor_user_id: actorUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
    });
  } catch (err) {
    console.error("insertActivity failed:", err);
  }
}

export async function listActivity(workspaceId: string, userId: string) {
  if (!await authorizeWorkspace(workspaceId, userId, "audit.read")) return null;
  const entitlements = await getWorkspaceEntitlements(workspaceId);
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("activity_events")
    .select("*, profiles(name)")
    .eq("workspace_id", workspaceId);

  if (!entitlements.canReadFullActivity) {
    query = query.gt("created_at", cutoff);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((event: ActivityRow) => ({
    id: event.id,
    action: event.action,
    targetType: event.target_type,
    targetId: event.target_id,
    actorName: event.profiles?.name ?? null,
    metadata: event.metadata,
    createdAt: event.created_at,
  }));
}
