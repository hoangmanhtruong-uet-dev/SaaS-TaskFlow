import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { parseJson } from "@/app/lib/validation";

// GET /api/v1/profile — lấy thông tin profile của user hiện tại
export async function GET() {
  try {
    const auth = await getApiUser();
    if (!auth?.user?.id) return fail("AUTH_REQUIRED", "Bạn cần đăng nhập", 401);

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, avatar_url, timezone, created_at")
      .eq("id", auth.user.id)
      .single();

    if (error || !data) return fail("NOT_FOUND", "Không tìm thấy profile", 404);

    return ok({
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      timezone: data.timezone,
      createdAt: data.created_at,
    });
  } catch (error) {
    return routeError(error);
  }
}

// PATCH /api/v1/profile — cập nhật name, timezone, avatarUrl
export async function PATCH(request: Request) {
  try {
    const auth = await getApiUser();
    if (!auth?.user?.id) return fail("AUTH_REQUIRED", "Bạn cần đăng nhập", 401);

    const body = await parseJson(request);

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim().slice(0, 100);
    }
    if (typeof body.timezone === "string" && body.timezone.trim()) {
      updates.timezone = body.timezone.trim();
    }
    if (typeof body.avatarUrl === "string") {
      // Allow empty string to clear avatar
      updates.avatar_url = body.avatarUrl || null;
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", auth.user.id)
      .select("id, name, email, avatar_url, timezone")
      .single();

    if (error) return fail("UPDATE_FAILED", error.message, 500);

    return ok({
      message: "Cập nhật thông tin thành công!",
      profile: {
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
        timezone: data.timezone,
      },
    });
  } catch (error) {
    return routeError(error);
  }
}
