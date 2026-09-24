import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { authorizeWorkspace } from "@/db/authorization";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params;
  if (!(await authorizeWorkspace(workspaceId, auth.user.id, "workspace.archive"))) return fail("PERMISSION_DENIED", "Chỉ Owner có thể lưu trữ workspace", 403);

  const restore = new URL(request.url).searchParams.get("restore") === "true";
  const supabase = createSupabaseAdminClient();

  const { data: row } = await supabase
    .from("workspaces")
    .update({
      archived_at: restore ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", workspaceId)
    .select()
    .maybeSingle();

  return row ? ok({ ...row, archivedAt: row.archived_at ? new Date(row.archived_at).toISOString() : null }) : fail("NOT_FOUND", "Workspace not found", 404);
}
