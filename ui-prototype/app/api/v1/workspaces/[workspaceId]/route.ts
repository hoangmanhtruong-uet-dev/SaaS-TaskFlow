import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { optionalString, parseJson } from "@/app/lib/validation";
import { authorizeWorkspace } from "@/db/authorization";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params;
  const membership = await authorizeWorkspace(workspaceId, auth.user.id, "workspace.read");
  if (!membership) return fail("NOT_FOUND", "Workspace not found", 404);

  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase.from("workspaces").select("*").eq("id", workspaceId).maybeSingle();
  if (!row) return fail("NOT_FOUND", "Workspace not found", 404);

  return ok({
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan,
    role: membership.role,
    archivedAt: row.archived_at ? new Date(row.archived_at).toISOString() : null,
    deletionRequestedAt: row.deletion_requested_at ? new Date(row.deletion_requested_at).toISOString() : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const { workspaceId } = await params;
    if (!(await authorizeWorkspace(workspaceId, auth.user.id, "workspace.update"))) return fail("PERMISSION_DENIED", "Bạn không có quyền sửa workspace", 403);

    const body = await parseJson(request);
    const name = body.name !== undefined ? optionalString(body, "name", 100) : undefined;
    const slug = body.slug !== undefined ? optionalString(body, "slug", 80)?.toLowerCase() : undefined;

    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail("SLUG_INVALID", "Slug không hợp lệ", 400);

    const supabase = createSupabaseAdminClient();
    if (slug) {
      const { data: existing } = await supabase.from("workspaces").select("id").eq("slug", slug).neq("id", workspaceId).maybeSingle();
      if (existing) return fail("SLUG_TAKEN", "Slug đã được sử dụng", 409);
    }

    const updateData = {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data: row } = await supabase.from("workspaces").update(updateData).eq("id", workspaceId).select().maybeSingle();
    if (!row) return fail("NOT_FOUND", "Workspace not found", 404);

    return ok({
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      archivedAt: row.archived_at ? new Date(row.archived_at).toISOString() : null,
    });
  } catch (error) {
    return routeError(error);
  }
}
