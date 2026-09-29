"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useWorkspaceSettings } from "./useWorkspaceSettings";
import { WorkspaceHeaderNav } from "./WorkspaceHeaderNav";
import { BrandingIdentityCard } from "./BrandingIdentityCard";
import { SubdomainCustomDomainCard } from "./SubdomainCustomDomainCard";
import { DefaultRegionalSettingsCard } from "./DefaultRegionalSettingsCard";
import { WorkspaceSecurityPoliciesCard } from "./WorkspaceSecurityPoliciesCard";
import { DataExportBackupCard } from "./DataExportBackupCard";
import { OwnershipDangerZoneCard } from "./OwnershipDangerZoneCard";
import { FloatingSaveBar } from "./FloatingSaveBar";
import { TransferOwnershipModal } from "./TransferOwnershipModal";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";

export const WorkspaceSettingsContainer: React.FC = () => {
  const {
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
    // Crop Modal
    cropModalImage,
    setCropModalImage,
    cropZoom,
    setCropZoom,
    cropRotation,
    setCropRotation,
    // Handlers
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
  } = useWorkspaceSettings();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative pb-32">
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : toast.type === "error"
              ? "bg-red-950 border-red-700 text-red-200"
              : "bg-indigo-950 border-indigo-700 text-indigo-200"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Segmented Pill Navigation */}
        <WorkspaceHeaderNav
          workspaceName={formState.name}
          subdomain={formState.subdomain}
          status={formState.status}
        />

        {/* Khối 1: Branding & Identity */}
        <BrandingIdentityCard
          name={formState.name}
          description={formState.description}
          industry={formState.industry}
          brandColor={formState.brandColor}
          logoUrl={formState.logoUrl}
          onUpdateField={updateField}
          onSelectFile={handleSelectLogoForCrop}
          onRemoveLogo={removeLogo}
          onSelectPresetLogo={selectPresetLogo}
          cropModalImage={cropModalImage}
          onCloseCropModal={() => setCropModalImage(null)}
          cropZoom={cropZoom}
          onZoomChange={setCropZoom}
          cropRotation={cropRotation}
          onRotationChange={setCropRotation}
          onApplyCrop={applyCroppedLogo}
        />

        {/* Khối 2: Subdomain & Custom Domain */}
        <SubdomainCustomDomainCard
          subdomain={formState.subdomain}
          subdomainStatus={subdomainStatus}
          customDomain={formState.customDomain}
          isCheckingDns={isCheckingDns}
          onUpdateSubdomain={(sub) => updateField("subdomain", sub)}
          onUpdateCustomDomainName={(domainName) =>
            updateField("customDomain", {
              ...formState.customDomain,
              domain: domainName,
              isVerified: domainName === formState.customDomain.domain ? formState.customDomain.isVerified : false,
            })
          }
          onVerifyDns={verifyCustomDomainDns}
        />

        {/* Khối 3: Regional & Defaults */}
        <DefaultRegionalSettingsCard
          timezone={formState.timezone}
          allowedEmailDomains={formState.allowedEmailDomains}
          currency={formState.currency}
          language={formState.language}
          dateFormat={formState.dateFormat}
          onUpdateField={updateField}
          onAddEmailDomain={addEmailDomain}
          onRemoveEmailDomain={removeEmailDomain}
        />

        {/* Khối 4: Security Policies */}
        <WorkspaceSecurityPoliciesCard
          securityPolicy={formState.securityPolicy}
          onUpdateSecurityPolicy={updateSecurityPolicy}
        />

        {/* Khối 5: Data Export & Backup */}
        <DataExportBackupCard
          exportHistory={exportHistory}
          isExporting={isExporting}
          onTriggerExport={triggerDataExport}
        />

        {/* Khối 6: Transfer Ownership & Danger Zone */}
        <OwnershipDangerZoneCard
          ownerId={formState.ownerId}
          status={formState.status}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
          onToggleFreeze={toggleFreezeWorkspace}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        />
      </div>

      {/* Floating Save Bar */}
      <FloatingSaveBar
        isDirty={isDirty}
        saving={saving}
        onReset={handleReset}
        onSave={handleSave}
      />

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        currentOwnerId={formState.ownerId}
        onConfirmTransfer={confirmTransferOwnership}
      />

      {/* Permanent Delete Modal */}
      <DeleteWorkspaceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        subdomain={formState.subdomain}
        onConfirmDelete={confirmDeleteWorkspace}
      />
    </div>
  );
};
