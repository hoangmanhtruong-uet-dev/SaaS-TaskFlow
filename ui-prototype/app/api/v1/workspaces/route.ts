import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { parseJson, requiredString } from "@/app/lib/validation";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { listUserWorkspaces } from "@/db/users";
import { consumeRateLimit } from "@/db/auth";

export async function GET() {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const rows = await listUserWorkspaces(auth.user.id);
  return ok(rows.map((row) => ({ ...row, archivedAt: row.archivedAt?.toISOString() ?? null })));
}
export async function POST(request: Request) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);

    const rate = await consumeRateLimit(`workspace:create:${auth.user.id}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) return fail("RATE_LIMITED", "Too many workspace creation attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });

    const body = await parseJson(request);
    const name = requiredString(body, "name", 100);
    const slug = requiredString(body, "slug", 80).toLowerCase();

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail("SLUG_INVALID", "Slug chỉ gồm chữ thường, số và dấu gạch ngang", 400);

    const supabase = createSupabaseAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabase.from("workspaces").select("id").eq("slug", slug).maybeSingle();
    if (existing) return fail("SLUG_TAKEN", "Slug đã được sử dụng", 409, { suggestion: `${slug}-${Math.floor(Math.random() * 900 + 100)}` });

    const id = crypto.randomUUID();

    // Create workspace
    const { error: wsError } = await supabase.from("workspaces").insert({ id, name, slug });
    if (wsError) throw new Error(`Failed to create workspace: ${wsError.message}`);

    // Add owner membership
    const { error: memError } = await supabase.from("memberships").insert({ id: crypto.randomUUID(), workspace_id: id, user_id: auth.user.id, role: "OWNER" });
    if (memError) throw new Error(`Failed to create membership: ${memError.message}`);

    return ok({ id, name, slug, plan: "FREE", role: "OWNER", archivedAt: null }, 201);
  } catch (error) {
    return routeError(error);
  }
}
