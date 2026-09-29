import { useState, useEffect, useRef, useCallback } from "react";
import {
  WorkspaceSettingsForm,
  SubdomainStatus,
  ToastNotice,
  DataExportHistoryItem,
} from "./types";
import {
  initialWorkspaceData,
  mockExportHistory,
  reservedSubdomains,
  mockWorkspaceMembers,
} from "./constants";

export function useWorkspaceSettings() {
  const [formState, setFormState] = useState<WorkspaceSettingsForm>(initialWorkspaceData);
  const [initialState, setInitialState] = useState<WorkspaceSettingsForm>(initialWorkspaceData);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  // Subdomain Debounced Checker State
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("available");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Domain Verification
  const [isCheckingDns, setIsCheckingDns] = useState(false);

  // Data Export State
  const [exportHistory, setExportHistory] = useState<DataExportHistoryItem[]>(mockExportHistory);
  const [isExporting, setIsExporting] = useState(false);

  // Modals & Confirmation States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState<string>("");

  // Logo Crop Modal
  const [cropModalImage, setCropModalImage] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);

  // Toast Helper
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  }, []);

  // Compute if form is dirty
  const isDirty = JSON.stringify(formState) !== JSON.stringify(initialState);

  // 1. Debounce 500ms Subdomain Check
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const sub = formState.subdomain.trim().toLowerCase();

    if (!sub || sub.length < 3 || sub.length > 30 || !/^[a-z0-9-]+$/.test(sub)) {
      window.setTimeout(() => setSubdomainStatus("invalid"), 0);
      return;
    }

    window.setTimeout(() => setSubdomainStatus("checking"), 0);

    debounceTimerRef.current = setTimeout(() => {
      // Check reserved subdomains or mock taken
      if (reservedSubdomains.includes(sub) || (sub === "test" && sub !== initialState.subdomain)) {
        setSubdomainStatus("taken");
      } else {
        setSubdomainStatus("available");
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [formState.subdomain, initialState.subdomain]);

  // Field updaters
  const updateField = <K extends keyof WorkspaceSettingsForm>(field: K, value: WorkspaceSettingsForm[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateSecurityPolicy = (policyKey: keyof WorkspaceSettingsForm["securityPolicy"], value: boolean | number) => {
    setFormState((prev) => ({
      ...prev,
      securityPolicy: {
        ...prev.securityPolicy,
        [policyKey]: value,
      },
    }));
  };

  // Allowed Email Domains Parser (Tags)
  const addEmailDomain = (rawDomain: string) => {
    const cleaned = rawDomain.trim().toLowerCase().replace(/^@/, "");
    if (!cleaned) return;
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleaned)) {
      showToast("Định dạng tên miền email không hợp lệ (VD: acme.com)", "error");
      return;
    }
    if (formState.allowedEmailDomains.includes(cleaned)) {
      showToast("Tên miền này đã có trong danh sách", "info");
      return;
    }
    setFormState((prev) => ({
      ...prev,
      allowedEmailDomains: [...prev.allowedEmailDomains, cleaned],
    }));
  };

  const removeEmailDomain = (domainToRemove: string) => {
    setFormState((prev) => ({
      ...prev,
      allowedEmailDomains: prev.allowedEmailDomains.filter((d) => d !== domainToRemove),
    }));
  };

  // Logo Handlers
  const handleSelectLogoForCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Kích thước file vượt quá 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropModalImage(reader.result as string);
        setCropZoom(1);
        setCropRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCroppedLogo = () => {
    if (cropModalImage) {
      updateField("logoUrl", cropModalImage);
      setCropModalImage(null);
      showToast("Đã cập nhật Logo Workspace thành công!", "success");
    }
  };

  const removeLogo = () => {
    updateField("logoUrl", null);
    showToast("Đã xóa Logo Workspace", "info");
  };

  const selectPresetLogo = (presetUrl: string) => {
    updateField("logoUrl", presetUrl);
    showToast("Đã chọn Logo từ thư viện mẫu", "success");
  };

  // Custom Domain DNS Verifier
  const verifyCustomDomainDns = () => {
    if (!formState.customDomain.domain) {
      showToast("Vui lòng nhập tên miền tùy chỉnh trước khi kiểm tra", "error");
      return;
    }
    setIsCheckingDns(true);
    setTimeout(() => {
      setIsCheckingDns(false);
      setFormState((prev) => ({
        ...prev,
        customDomain: {
          ...prev.customDomain,
          isVerified: true,
          lastCheckedAt: new Date().toLocaleString("vi-VN"),
          cnameRecord: {
            ...prev.customDomain.cnameRecord,
            status: "verified",
          },
        },
      }));
      showToast("Xác thực bản ghi CNAME thành công! Tên miền đã kích hoạt.", "success");
    }, 1800);
  };

  // Data Export Handler
  const triggerDataExport = () => {
    setIsExporting(true);
    showToast("Đang khởi tạo gói xuất dữ liệu Workspace (.ZIP)...", "info");
    setTimeout(() => {
      setIsExporting(false);
      const newExport: DataExportHistoryItem = {
        id: `exp-${Math.floor(1000 + Math.random() * 9000)}`,
        requestedAt: new Date().toLocaleString("vi-VN"),
        requestedBy: "Hoàng Mạnh Trường (Owner)",
        fileSize: "156.4 MB",
        status: "ready",
        downloadUrl: "#download-latest",
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
      };
      setExportHistory((prev) => [newExport, ...prev]);
      showToast("Gói dữ liệu đã được xuất thành công! File sẵn sàng để tải xuống.", "success");
    }, 2500);
  };

  // Ownership Transfer Handler
  const confirmTransferOwnership = (newOwnerId: string) => {
    const newOwner = mockWorkspaceMembers.find((m) => m.id === newOwnerId);
    if (!newOwner) return;
    updateField("ownerId", newOwnerId);
    setIsTransferModalOpen(false);
    showToast(`Đã chuyển quyền sở hữu Workspace cho ${newOwner.name} (${newOwner.email})`, "success");
  };

  // Freeze Workspace Handler
  const toggleFreezeWorkspace = () => {
    const nextStatus = formState.status === "frozen" ? "active" : "frozen";
    updateField("status", nextStatus);
    showToast(
      nextStatus === "frozen"
        ? "Đã tạm dừng (Freeze) Workspace. Thành viên chỉ có thể đọc dữ liệu."
        : "Đã kích hoạt lại Workspace thành công!",
      nextStatus === "frozen" ? "info" : "success"
    );
  };

  // Permanent Delete Handler
  const confirmDeleteWorkspace = () => {
    updateField("status", "deleted");
    setIsDeleteModalOpen(false);
    showToast("Workspace đã bị xóa vĩnh viễn. Đang chuyển hướng...", "error");
  };

  // Save Form Handler
  const handleSave = async () => {
    if (subdomainStatus === "taken") {
      showToast("Subdomain đã bị đăng ký bởi công ty khác. Vui lòng chọn tên khác!", "error");
      return;
    }
    if (subdomainStatus === "invalid") {
      showToast("Subdomain không đúng định dạng!", "error");
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setInitialState(formState);
    setSaving(false);
    showToast("Đã lưu toàn bộ cấu hình Workspace thành công!", "success");
  };

  // Reset Form Handler
  const handleReset = () => {
    setFormState(initialState);
    showToast("Đã khôi phục các thay đổi chưa lưu", "info");
  };

  return {
    formState,
    isDirty,
    saving,
    toast,
    subdomainStatus,
    isCheckingDns,
    exportHistory,
    isExporting,
    // Modals
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isTransferModalOpen,
    setIsTransferModalOpen,
    selectedNewOwnerId,
    setSelectedNewOwnerId,
    // Crop Modal
    cropModalImage,
    setCropModalImage,
    cropZoom,
    setCropZoom,
    cropRotation,
    setCropRotation,
    // Updaters & Actions
    updateField,
    updateSecurityPolicy,
    addEmailDomain,
    removeEmailDomain,
    handleSelectLogoForCrop,
    applyCroppedLogo,
    removeLogo,
    selectPresetLogo,
    verifyCustomDomainDns,
    triggerDataExport,
    confirmTransferOwnership,
    toggleFreezeWorkspace,
    confirmDeleteWorkspace,
    handleSave,
    handleReset,
    showToast,
  };
}
