"use client";

import React from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import { useSecurityManager } from "./useSecurityManager";
import { ChangePasswordCard } from "./ChangePasswordCard";
import { TwoFactorAuthCard } from "./TwoFactorAuthCard";
import { MfaSetupWizardModal } from "./MfaSetupWizardModal";
import { ConnectedAccountsCard } from "./ConnectedAccountsCard";
import { ActiveSessionsCard } from "./ActiveSessionsCard";
import { SecurityLogCard } from "./SecurityLogCard";
import { ReauthModal } from "./ReauthModal";
import { SettingsNavPill } from "../SettingsNavPill";

export const SecuritySettingsContainer: React.FC = () => {
  const {
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
    closeMfaWizard,
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
    downloadBackupCodesTxt,
    copyBackupCodes,
    // Reauth guard
    reauthReason,
    closeReauthModal,
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
  } = useSecurityManager();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : toast.type === "error"
              ? "bg-red-950 border-red-700 text-red-200"
              : "bg-zinc-900 border-zinc-700 text-zinc-200"
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
            <Shield className="w-4 h-4" />
            <span>Cấu hình bảo mật & Đăng nhập</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Bảo mật & MFA (Security Settings)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Quản lý mật khẩu, xác thực hai yếu tố 2FA, tài khoản đã liên kết SSO và kiểm soát phiên đăng nhập
          </p>

          {/* Pill Segmented Control Navigation */}
          <SettingsNavPill />
        </div>

        {/* Khối 1: Đổi Mật Khẩu */}
        <ChangePasswordCard
          form={passwordForm}
          onChangeForm={setPasswordForm}
          showPassword={showPassword}
          onToggleShow={(field) =>
            setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
          }
          strength={passwordStrength}
          error={passwordError}
          loading={passwordLoading}
          onSubmit={handleChangePassword}
        />

        {/* Khối 2: Xác thực hai yếu tố (2FA / MFA) */}
        <TwoFactorAuthCard
          config={mfaConfig}
          onOpenWizard={openMfaWizard}
          onRequestDisable={requestDisableMfa}
          onRequestViewBackup={requestViewBackupCodes}
        />

        {/* Khối 3: Tài khoản đã liên kết (SSO Logins) */}
        <ConnectedAccountsCard
          accounts={connectedAccounts}
          onToggleConnect={toggleSSOAccount}
        />

        {/* Khối 4: Quản lý Phiên đăng nhập */}
        <ActiveSessionsCard
          sessions={sessions}
          onRevokeSession={revokeSession}
          onRevokeAllOthers={revokeAllOtherSessions}
        />

        {/* Khối 5: Nhật ký hoạt động bảo mật */}
        <SecurityLogCard logs={securityLogs} />
      </div>

      {/* Modals */}
      <MfaSetupWizardModal
        isOpen={isMfaWizardOpen}
        onClose={closeMfaWizard}
        step={mfaWizardStep}
        onStepChange={setMfaWizardStep}
        config={mfaConfig}
        confirmPassword={mfaConfirmPassword}
        onConfirmPasswordChange={setMfaConfirmPassword}
        onStep1Submit={handleMfaStep1Submit}
        otpPin={mfaOtpPin}
        onOtpChange={handleMfaOtpChange}
        onOtpKeyDown={handleMfaOtpKeyDown}
        onVerifyOtp={verifyMfaOtp}
        onDownloadTxt={downloadBackupCodesTxt}
        onCopyBackupCodes={copyBackupCodes}
      />

      <ReauthModal
        isOpen={Boolean(reauthReason)}
        onClose={closeReauthModal}
        reason={reauthReason}
        password={reauthPassword}
        onPasswordChange={setReauthPassword}
        onConfirm={confirmReauth}
      />
    </div>
  );
};
