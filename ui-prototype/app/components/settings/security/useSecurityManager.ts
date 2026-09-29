"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ChangePasswordForm,
  PasswordStrength,
  TwoFactorConfig,
  ConnectedAccount,
  ActiveSessionItem,
  SecurityLogItem,
} from "./types";
import {
  MOCK_2FA_CONFIG,
  MOCK_CONNECTED_ACCOUNTS,
  MOCK_ACTIVE_SESSIONS,
  MOCK_SECURITY_LOGS,
} from "./constants";

export function useSecurityManager() {
  // ── 1. Password Change State ──
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password Strength Meter Engine
  const passwordStrength = useMemo<PasswordStrength>(() => {
    const pwd = passwordForm.newPassword;
    const checks = {
      hasMinLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasDigit: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd),
    };

    const count = Object.values(checks).filter(Boolean).length;
    let score = 0;
    let label: PasswordStrength["label"] = "Rất yếu";
    let color = "bg-red-500 text-red-400";

    if (pwd.length === 0) {
      return { score: 0, label: "Rất yếu", color: "bg-zinc-700 text-zinc-500", checks };
    }

    if (count <= 2) {
      score = 1;
      label = "Yếu";
      color = "bg-red-500 text-red-400";
    } else if (count === 3) {
      score = 2;
      label = "Trung bình";
      color = "bg-amber-500 text-amber-400";
    } else if (count === 4) {
      score = 3;
      label = "Mạnh";
      color = "bg-emerald-500 text-emerald-400";
    } else if (count === 5) {
      score = 4;
      label = "Tuyệt vời";
      color = "bg-emerald-400 text-emerald-300";
    }

    return { score, label, color, checks };
  }, [passwordForm.newPassword]);

  // ── 2. MFA / 2FA State ──
  const [mfaConfig, setMfaConfig] = useState<TwoFactorConfig>(MOCK_2FA_CONFIG);
  const [isMfaWizardOpen, setIsMfaWizardOpen] = useState(false);
  const [mfaWizardStep, setMfaWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [mfaConfirmPassword, setMfaConfirmPassword] = useState("");
  const [mfaOtpPin, setMfaOtpPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sensitive Re-auth Modal State
  const [reauthReason, setReauthReason] = useState<"disable_2fa" | "view_backup" | null>(null);
  const [reauthPassword, setReauthPassword] = useState("");

  // ── 3. Sessions & SSO State ──
  const [sessions, setSessions] = useState<ActiveSessionItem[]>(MOCK_ACTIVE_SESSIONS);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(MOCK_CONNECTED_ACCOUNTS);
  const [securityLogs] = useState<SecurityLogItem[]>(MOCK_SECURITY_LOGS);

  // Toast Feedback State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  // ── Actions: Password Change ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (passwordStrength.score < 2) {
      setPasswordError("Mật khẩu mới chưa đủ mạnh. Vui lòng kiểm tra lại các yêu cầu bảo mật.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }

    setPasswordLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Đã đổi mật khẩu tài khoản thành công!", "success");
    } catch {
      setPasswordError("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Actions: MFA Setup Wizard ──
  const openMfaWizard = () => {
    setMfaWizardStep(1);
    setMfaConfirmPassword("");
    setMfaOtpPin(["", "", "", "", "", ""]);
    setIsMfaWizardOpen(true);
  };

  const handleMfaStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaConfirmPassword) {
      showToast("Vui lòng nhập mật khẩu xác nhận.", "error");
      return;
    }
    setMfaWizardStep(2);
  };

  const handleMfaOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...mfaOtpPin];
    newPin[index] = value.slice(-1);
    setMfaOtpPin(newPin);

    // Auto advance to next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleMfaOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !mfaOtpPin[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyMfaOtp = () => {
    const code = mfaOtpPin.join("");
    if (code.length < 6) {
      showToast("Vui lòng nhập đủ 6 chữ số mã OTP.", "error");
      return;
    }
    setMfaWizardStep(4); // Advance to backup codes step
    setMfaConfig((prev) => ({ ...prev, enabled: true }));
    showToast("Đã xác thực và kích hoạt 2FA thành công!", "success");
  };

  // ── Actions: Re-authentication Guard for Sensitive Actions ──
  const requestDisableMfa = () => {
    setReauthReason("disable_2fa");
    setReauthPassword("");
  };

  const requestViewBackupCodes = () => {
    setReauthReason("view_backup");
    setReauthPassword("");
  };

  const confirmReauth = () => {
    if (!reauthPassword) {
      showToast("Vui lòng nhập mật khẩu xác nhận.", "error");
      return;
    }

    if (reauthReason === "disable_2fa") {
      setMfaConfig((prev) => ({ ...prev, enabled: false }));
      showToast("Đã tắt Xác thực hai yếu tố (2FA).", "info");
    } else if (reauthReason === "view_backup") {
      setIsBackupModalOpen(true);
    }

    setReauthReason(null);
    setReauthPassword("");
  };

  // ── Actions: Session Management ──
  const revokeSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast(`Đã thu hồi phiên làm việc từ thiết bị ${target?.deviceType || "lạ"}.`, "info");
  };

  const revokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast("Đã đăng xuất thành công khỏi tất cả các thiết bị khác!", "success");
  };

  // ── Actions: SSO Toggle ──
  const toggleSSOAccount = (accountId: string) => {
    setConnectedAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const next = !acc.connected;
          showToast(
            `Đã ${next ? "kết nối" : "hủy kết nối"} tài khoản ${acc.providerName}.`,
            next ? "success" : "info"
          );
          return { ...acc, connected: next };
        }
        return acc;
      })
    );
  };

  // Backup codes text download
  const downloadBackupCodesTxt = () => {
    const textContent = `TASKFLOW 2FA RECOVERY CODES\nWorkspace Security Audit\n---------------------------------\n` +
      mfaConfig.backupCodes.join("\n") +
      `\n---------------------------------\nLưu ý: Mỗii mã chỉ có thể sử dụng một lần để khôi phục tài khoản.`;

    const element = document.createElement("a");
    const file = new Blob([textContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `taskflow-2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast("Đã tải xuống file mã khôi phục 2FA dạng .txt!", "success");
  };

  const copyBackupCodes = () => {
    navigator.clipboard?.writeText(mfaConfig.backupCodes.join("\n"));
    showToast("Đã sao chép 10 mã khôi phục 2FA vào bộ nhớ tạm!", "success");
  };

  return {
    // Password state
    passwordForm,
    setPasswordForm,
    showPassword,
    setShowPassword,
    passwordError,
    passwordLoading,
    passwordStrength,
    handleChangePassword,
    // 2FA state
    mfaConfig,
    isMfaWizardOpen,
    closeMfaWizard: () => setIsMfaWizardOpen(false),
    mfaWizardStep,
    setMfaWizardStep,
    mfaConfirmPassword,
    setMfaConfirmPassword,
    mfaOtpPin,
    handleMfaOtpChange,
    handleMfaOtpKeyDown,
    verifyMfaOtp,
    handleMfaStep1Submit,
    openMfaWizard,
    // Backup modal
    isBackupModalOpen,
    closeBackupModal: () => setIsBackupModalOpen(false),
    downloadBackupCodesTxt,
    copyBackupCodes,
    // Reauth guard
    reauthReason,
    closeReauthModal: () => setReauthReason(null),
    reauthPassword,
    setReauthPassword,
    confirmReauth,
    requestDisableMfa,
    requestViewBackupCodes,
    // Sessions & SSO & Logs
    sessions,
    revokeSession,
    revokeAllOtherSessions,
    connectedAccounts,
    toggleSSOAccount,
    securityLogs,
    // Toast
    toast,
    showToast,
  };
}
