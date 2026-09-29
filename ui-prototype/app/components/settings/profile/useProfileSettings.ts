"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { z } from "zod";
import { UserProfileForm, UserStatus, WorkingSchedule, LocalPreferences, SocialLinks } from "./types";
import { INITIAL_USER_PROFILE } from "./constants";

// Zod Validation Schema
export const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(50, "Họ và tên không vượt quá 50 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  jobTitle: z.string().max(80, "Chức danh tối đa 80 ký tự").optional(),
  department: z.string().max(80, "Phòng ban tối đa 80 ký tự").optional(),
  bio: z.string().max(250, "Mô tả ngắn tối đa 250 ký tự").optional(),
  timezone: z.string(),
  socialLinks: z.object({
    linkedin: z.string().refine((val) => !val || /^https?:\/\//i.test(val), {
      message: "URL LinkedIn phải bắt đầu bằng http:// hoặc https://",
    }),
    github: z.string().refine((val) => !val || /^https?:\/\//i.test(val), {
      message: "URL GitHub phải bắt đầu bằng http:// hoặc https://",
    }),
    portfolio: z.string().refine((val) => !val || /^https?:\/\//i.test(val), {
      message: "URL Portfolio phải bắt đầu bằng http:// hoặc https://",
    }),
  }),
});

export type ProfileErrors = Record<string, string>;

export function useProfileSettings(initialData?: Partial<UserProfileForm>) {
  const [formState, setFormState] = useState<UserProfileForm>(() => ({
    ...INITIAL_USER_PROFILE,
    ...initialData,
  }));

  const [savedState, setSavedState] = useState<UserProfileForm>(() => ({
    ...INITIAL_USER_PROFILE,
    ...initialData,
  }));

  // Dirty state tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(savedState);
  }, [formState, savedState]);

  // Validation Errors
  const [errors, setErrors] = useState<ProfileErrors>({});

  // UI States
  const [saving, setSaving] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Avatar Crop Modal State
  const [cropModalImage, setCropModalImage] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Unsaved Changes Guard (Browser beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa lưu trên trang này. Bạn có chắc chắn muốn rời đi?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Validate form with Zod
  const validateForm = (): boolean => {
    const result = profileFormSchema.safeParse(formState);
    if (!result.success) {
      const formattedErrors: ProfileErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Field updaters
  const updateField = <K extends keyof UserProfileForm>(field: K, value: UserProfileForm[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateStatus = (status: UserStatus) => {
    setFormState((prev) => ({ ...prev, status }));
  };

  const updateWorkingSchedule = (schedule: WorkingSchedule) => {
    setFormState((prev) => ({ ...prev, workingSchedule: schedule }));
  };

  const updatePreferences = (preferences: LocalPreferences) => {
    setFormState((prev) => ({ ...prev, preferences }));
  };

  const updateSocialLinks = (socialLinks: SocialLinks) => {
    setFormState((prev) => ({ ...prev, socialLinks }));
  };

  // Timezone Auto Detect Engine
  const autoDetectTimezone = useCallback(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        updateField("timezone", detected);
        showToast(`Đã tự động phát hiện múi giờ: ${detected}`, "success");
      }
    } catch {
      showToast("Không thể tự động phát hiện múi giờ thiết bị", "error");
    }
  }, [showToast]);

  // Avatar Upload Handling
  const handleSelectImageForCrop = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file định dạng ảnh (JPG, PNG, WEBP).", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File quá lớn! Kích thước tối đa là 5MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropModalImage(reader.result as string);
      setCropZoom(1);
      setCropRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const applyCroppedAvatar = () => {
    if (cropModalImage) {
      updateField("avatarUrl", cropModalImage);
      setCropModalImage(null);
      showToast("Đã cắt & cập nhật ảnh đại diện mới!", "success");
    }
  };

  const selectPresetAvatar = (url: string) => {
    updateField("avatarUrl", url);
    showToast("Đã chọn ảnh đại diện preset!", "success");
  };

  const removeAvatar = () => {
    updateField("avatarUrl", null);
    showToast("Đã xóa ảnh đại diện. Dùng initials chữ cái mặc định.", "success");
  };

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      showToast("Vui lòng kiểm tra và sửa các lỗi trong form trước khi lưu.", "error");
      return;
    }

    setSaving(true);
    try {
      // Simulate API PATCH /api/v1/profile
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSavedState({ ...formState });
      showToast("Đã lưu tất cả thay đổi trang cá nhân thành công!", "success");
    } catch {
      showToast("Lỗi khi lưu thông tin cá nhân. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmNewEmail = (newEmail: string) => {
    setFormState((prev) => ({ ...prev, email: newEmail }));
    setSavedState((prev) => ({ ...prev, email: newEmail }));
  };

  const handleReset = () => {
    setFormState({ ...savedState });
    setErrors({});
    showToast("Đã hủy bỏ tất cả thay đổi chưa lưu.", "success");
  };

  return {
    formState,
    errors,
    isDirty,
    saving,
    toast,
    // Field updaters
    updateField,
    updateStatus,
    updateWorkingSchedule,
    updatePreferences,
    updateSocialLinks,
    autoDetectTimezone,
    // Avatar actions
    handleSelectImageForCrop,
    selectPresetAvatar,
    removeAvatar,
    // Crop Modal State
    cropModalImage,
    setCropModalImage,
    cropZoom,
    setCropZoom,
    cropRotation,
    setCropRotation,
    applyCroppedAvatar,
    // Email Modal
    isEmailModalOpen,
    openEmailModal: () => setIsEmailModalOpen(true),
    closeEmailModal: () => setIsEmailModalOpen(false),
    confirmNewEmail,
    // Form actions
    handleSave,
    handleReset,
    showToast,
  };
}
