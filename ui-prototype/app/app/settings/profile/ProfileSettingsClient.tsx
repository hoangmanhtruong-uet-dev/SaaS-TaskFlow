"use client";

import { ProfileSettingsContainer } from "@/app/components/settings/profile/ProfileSettingsContainer";

export interface ProfileSettingsClientProps {
  initialName?: string;
  initialEmail?: string;
  initialTimezone?: string;
  initialAvatarUrl?: string | null;
}

export function ProfileSettingsClient({
  initialName,
  initialEmail,
  initialTimezone,
  initialAvatarUrl,
}: ProfileSettingsClientProps) {
  return (
    <ProfileSettingsContainer
      initialName={initialName}
      initialEmail={initialEmail}
      initialTimezone={initialTimezone}
      initialAvatarUrl={initialAvatarUrl}
    />
  );
}

export default ProfileSettingsClient;
