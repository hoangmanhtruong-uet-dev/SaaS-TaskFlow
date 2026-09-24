import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function listNotifications(userId: string, unreadOnly = false) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("recipient_user_id", userId);

  if (unreadOnly) {
    query = query.is("read_at", null);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    recipientUserId: row.recipient_user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : row.created_at,
  }));
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_user_id", userId)
    .select()
    .maybeSingle();

  return data;
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", userId)
    .is("read_at", null);
}
