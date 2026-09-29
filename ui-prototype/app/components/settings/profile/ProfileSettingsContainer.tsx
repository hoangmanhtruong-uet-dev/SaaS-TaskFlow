"use client";

import React from "react";
import { CheckCircle2, User } from "lucide-react";
import { useProfileSettings } from "./useProfileSettings";
import { AvatarManagerCard } from "./AvatarManagerCard";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { TimezoneScheduleCard } from "./TimezoneScheduleCard";
import { LocalPreferencesCard } from "./LocalPreferencesCard";
import { SocialLinksCard } from "./SocialLinksCard";
import { FloatingSaveBar } from "./FloatingSaveBar";
import { EmailChangeModal } from "./EmailChangeModal";
import { SettingsNavPill } from "../SettingsNavPill";

interface ProfileSettingsContainerProps {
  initialName?: string;
  initialEmail?: string;
  initialTimezone?: string;
  initialAvatarUrl?: string | null;
}

export const ProfileSettingsContainer: React.FC<ProfileSettingsContainerProps> = ({
  initialName,
  initialEmail,
  initialTimezone,
  initialAvatarUrl,
}) => {
  const {
    formState,
    errors,
    isDirty,
    saving,
    toast,
    // Updaters
    updateField,
    updateStatus,
    updateWorkingSchedule,
    updatePreferences,
    updateSocialLinks,
    autoDetectTimezone,
    // Avatar
    handleSelectImageForCrop,
    selectPresetAvatar,
    removeAvatar,
    // Crop Modal
    cropModalImage,
    setCropModalImage,
    cropZoom,
    setCropZoom,
    cropRotation,
    setCropRotation,
    applyCroppedAvatar,
    // Email Modal
    isEmailModalOpen,
    openEmailModal,
    closeEmailModal,
    confirmNewEmail,
    // Actions
    handleSave,
    handleReset,
    showToast,
  } = useProfileSettings({
    fullName: initialName,
    email: initialEmail,
    timezone: initialTimezone,
    avatarUrl: initialAvatarUrl,
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative pb-28">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : "bg-red-950 border-red-700 text-red-200"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="border-b border-zinc-800 pb-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>Thiết lập tài khoản cá nhân</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Trang cá nhân (Personal Profile)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Cập nhật ảnh đại diện, thông tin làm việc, múi giờ và đồng bộ hiện diện của bạn trong Workspace
          </p>

          {/* Pill Segmented Control Navigation */}
          <SettingsNavPill />
        </div>

        {/* Khối 1: Avatar Manager */}
        <AvatarManagerCard
          avatarUrl={formState.avatarUrl}
          fullName={formState.fullName}
          onSelectFile={handleSelectImageForCrop}
          onSelectPreset={selectPresetAvatar}
          onRemoveAvatar={removeAvatar}
          cropImage={cropModalImage}
          onCloseCropModal={() => setCropModalImage(null)}
          cropZoom={cropZoom}
          onZoomChange={setCropZoom}
          cropRotation={cropRotation}
          onRotationChange={setCropRotation}
          onApplyCrop={applyCroppedAvatar}
        />

        {/* Khối 2: Profile Info & Status */}
        <ProfileInfoCard
          fullName={formState.fullName}
          email={formState.email}
          jobTitle={formState.jobTitle}
          department={formState.department}
          bio={formState.bio}
          status={formState.status}
          errors={errors}
          onUpdateField={updateField}
          onUpdateStatus={updateStatus}
          onOpenEmailModal={openEmailModal}
        />

        {/* Khối 3: Timezone & Schedule */}
        <TimezoneScheduleCard
          timezone={formState.timezone}
          workingSchedule={formState.workingSchedule}
          onUpdateTimezone={(tz) => updateField("timezone", tz)}
          onUpdateSchedule={updateWorkingSchedule}
          onAutoDetectTimezone={autoDetectTimezone}
        />

        {/* Khối 4: Local Preferences */}
        <LocalPreferencesCard
          preferences={formState.preferences}
          onUpdatePreferences={updatePreferences}
        />

        {/* Khối 5: Social & Contact Links */}
        <SocialLinksCard
          socialLinks={formState.socialLinks}
          errors={errors}
          onUpdateSocialLinks={updateSocialLinks}
        />
      </div>

      {/* Floating Save Bar (When form is dirty) */}
      <FloatingSaveBar
        isDirty={isDirty}
        saving={saving}
        onReset={handleReset}
        onSave={() => handleSave()}
      />

      {/* Security Email Change Modal */}
      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={closeEmailModal}
        currentEmail={formState.email}
        onConfirmNewEmail={confirmNewEmail}
        onSuccessToast={(msg) => showToast(msg, "success")}
      />
    </div>
  );
};
