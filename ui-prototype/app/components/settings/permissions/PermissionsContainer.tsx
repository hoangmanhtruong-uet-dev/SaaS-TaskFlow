"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { usePermissionSettings } from "./usePermissionSettings";
import { PermissionsHeaderNav } from "./PermissionsHeaderNav";
import { RoleHeaderCard } from "./RoleHeaderCard";
import { RolePermissionMatrixTable } from "./RolePermissionMatrixTable";
import { ProjectPermissionOverridesCard } from "./ProjectPermissionOverridesCard";
import { CustomRoleModal } from "./CustomRoleModal";
import { FloatingSaveBar } from "./FloatingSaveBar";
import { permissionGroups } from "./constants";

export const PermissionsContainer: React.FC = () => {
  const {
    roles,
    matrixState,
    isDirty,
    saving,
    toast,
    projectOverrides,
    isCustomRoleModalOpen,
    setIsCustomRoleModalOpen,
    // Handlers
    isRoleLocked,
    togglePermissionCell,
    toggleRoleColumn,
    toggleGroupForRole,
    createCustomRole,
    deleteCustomRole,
    addProjectOverride,
    removeProjectOverride,
    handleSave,
    handleReset,
  } = usePermissionSettings();

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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Navigation & Segmented Tabs */}
        <PermissionsHeaderNav />

        {/* Khối 1: Roles Overview & Custom Role Button */}
        <RoleHeaderCard
          roles={roles}
          onOpenCustomRoleModal={() => setIsCustomRoleModalOpen(true)}
          onDeleteCustomRole={deleteCustomRole}
        />

        {/* Khối 2: Interactive Role Permission Matrix Table */}
        <RolePermissionMatrixTable
          roles={roles}
          permissionGroups={permissionGroups}
          matrixState={matrixState}
          isRoleLocked={isRoleLocked}
          onToggleCell={togglePermissionCell}
          onToggleColumn={toggleRoleColumn}
          onToggleGroupForRole={toggleGroupForRole}
        />

        {/* Khối 3: Project Level Permission Overrides */}
        <ProjectPermissionOverridesCard
          roles={roles}
          projectOverrides={projectOverrides}
          onAddOverride={addProjectOverride}
          onRemoveOverride={removeProjectOverride}
        />
      </div>

      {/* Floating Save Bar */}
      <FloatingSaveBar
        isDirty={isDirty}
        saving={saving}
        onReset={handleReset}
        onSave={handleSave}
      />

      {/* Custom Role Builder Modal */}
      <CustomRoleModal
        isOpen={isCustomRoleModalOpen}
        onClose={() => setIsCustomRoleModalOpen(false)}
        onCreateRole={createCustomRole}
      />
    </div>
  );
};
