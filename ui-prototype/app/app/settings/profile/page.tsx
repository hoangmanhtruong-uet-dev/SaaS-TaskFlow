import { requireAuthenticatedIdentity } from "@/app/lib/auth";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { ProfileSettingsContainer } from "@/app/components/settings/profile/ProfileSettingsContainer";

export const metadata = { title: "Trang cá nhân — Cài đặt TaskFlow" };

export default async function ProfileSettingsPage() {
  let name = "Hoàng Mạnh Trường";
  let email = "hoangmanhtruong@taskflow.io";
  let timezone = "Asia/Ho_Chi_Minh";
  let avatarUrl: string | null =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  try {
    const { identity } = await requireAuthenticatedIdentity("/app/settings/profile");
    if (identity) {
      name = identity.displayName || name;
      email = identity.email || email;
      avatarUrl = identity.avatarUrl || avatarUrl;

      const supabase = createSupabaseAdminClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, avatar_url, timezone")
        .eq("id", identity.userId)
        .single();

      if (profile) {
        name = profile.name || name;
        email = profile.email || email;
        timezone = profile.timezone || timezone;
        avatarUrl = profile.avatar_url || avatarUrl;
      }
    }
  } catch {
    // Fallback to default mock profile if unauthenticated
  }

  return (
    <ProfileSettingsContainer
      initialName={name}
      initialEmail={email}
      initialTimezone={timezone}
      initialAvatarUrl={avatarUrl}
    />
  );
}
