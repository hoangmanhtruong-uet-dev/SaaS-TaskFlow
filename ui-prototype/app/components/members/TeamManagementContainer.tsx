 
"use client";

import React from "react";
import { CheckCircle2, Inbox, RotateCcw } from "lucide-react";
import { useTeamManagement } from "./useTeamManagement";
import { MembersKpiHeader } from "./MembersKpiHeader";
import { MembersToolbar } from "./MembersToolbar";
import { MembersTable } from "./MembersTable";
import { PendingInvitesTable } from "./PendingInvitesTable";
import { PermissionMatrixTab } from "./PermissionMatrixTab";
import { InviteMemberModal } from "./InviteMemberModal";
import { MemberWorkloadDrawer } from "./MemberWorkloadDrawer";
import { RoleChangeModal, TransferOwnershipModal } from "./ConfirmationModal";
import { useWorkspace } from "../providers/workspace-provider";

export const TeamManagementContainer: React.FC = () => {
  const workspace = useWorkspace();
  const {
    members,
    pendingInvites,
    metrics,
    filters,
    setFilters,
    resetFilters,
    activeTab,
    setActiveTab,

    // Drawer & Modals
    selectedMember,
    setSelectedMember,
    isInviteModalOpen,
    openInviteModal,
    closeInviteModal,

    transferTarget,
    closeTransferModal,
    confirmOwnershipTransfer,

    roleChangeTarget,
    closeRoleChangeModal,
    confirmRoleChange,

    // Actions
    requestRoleChange,
    requestOwnershipTransfer,
    toggleMemberStatus,
    removeMember,
    sendBulkInvite,
    resendInvite,
    revokeInvite,
    copyInviteLink,

    // Toast
    toast,
  } = useTeamManagement(workspace.id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* KPI Summary Metrics Header */}
        <MembersKpiHeader
          total={metrics.total}
          active={metrics.active}
          pending={metrics.pending}
          guests={metrics.guests}
        />

        {/* Toolbar & Tabs Bar */}
        <MembersToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingInvites.length}
          membersCount={members.length}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={resetFilters}
          onOpenInviteModal={openInviteModal}
        />

        {/* Tab 1: Member List Table */}
        {activeTab === "members" && (
          <>
            {members.length > 0 ? (
              <MembersTable
                members={members}
                onSelectMember={(m) => setSelectedMember(m)}
                onRequestRoleChange={requestRoleChange}
                onRequestOwnershipTransfer={requestOwnershipTransfer}
                onToggleStatus={toggleMemberStatus}
                onRemoveMember={removeMember}
              />
            ) : (
              /* Empty State */
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center my-6">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <Inbox className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-1">
                  Không tìm thấy thành viên phù hợp
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
                  Không có thành viên nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại của bạn.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Bỏ bộ lọc tìm kiếm</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Pending Invites Table */}
        {activeTab === "pending" && (
          <PendingInvitesTable
            invites={pendingInvites}
            onResend={resendInvite}
            onRevoke={revokeInvite}
          />
        )}

        {/* Tab 3: Role Permission Matrix */}
        {activeTab === "permissions" && <PermissionMatrixTab />}
      </div>

      {/* Modals & Drawers */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
        onSendInvite={sendBulkInvite}
        onCopyLink={copyInviteLink}
      />

      <MemberWorkloadDrawer
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
      />

      <RoleChangeModal
        isOpen={Boolean(roleChangeTarget)}
        onClose={closeRoleChangeModal}
        onConfirm={confirmRoleChange}
        member={roleChangeTarget?.member || null}
        newRole={roleChangeTarget?.newRole || null}
      />

      <TransferOwnershipModal
        isOpen={Boolean(transferTarget)}
        onClose={closeTransferModal}
        onConfirm={confirmOwnershipTransfer}
        member={transferTarget}
      />
    </div>
  );
};
