"use client";

import { useState, useMemo, useCallback } from "react";
import {
  WorkspaceMember,
  PendingInvite,
  UserRole,
  MemberStatus,
  MemberFilterState,
} from "./types";
import { useEffect } from "react";
import { collaborationService } from "@/app/services/collaboration-service";

const INITIAL_FILTERS: MemberFilterState = {
  searchQuery: "",
  role: "all",
  status: "all",
  sortBy: "name",
};

export function useTeamManagement(workspaceId: string) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    collaborationService.members(workspaceId)
      .then(fetched => {
        const mapped: WorkspaceMember[] = fetched.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role.toLowerCase() as UserRole,
          status: m.status.toLowerCase() as MemberStatus,
          avatar: m.name.charAt(0).toUpperCase(),
          joinDate: m.createdAt,
          taskCount: 0,
          projects: [],
          isCurrentUser: false // Mocked since we don't know current user id
        }));
        setMembers(mapped);
      })
      .catch(console.error);
    collaborationService.invitations(workspaceId)
      .then(invites => {
        const pending = invites.map((i, idx) => ({
          id: i.id,
          email: i.email,
          role: i.role.toLowerCase() as UserRole,
          invitedBy: "System",
          invitedAt: i.createdAt,
          expiresAt: i.expiresAt,
          projects: []
        }));
        setPendingInvites(pending);
      })
      .catch(console.error);
  }, [workspaceId]);

  const [filters, setFilters] = useState<MemberFilterState>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<"members" | "pending" | "permissions">("members");

  // Drawer & Modals State
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<WorkspaceMember | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    member: WorkspaceMember;
    newRole: UserRole;
  } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Search by Name or Email
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = m.name.toLowerCase().includes(q);
          const matchEmail = m.email.toLowerCase().includes(q);
          if (!matchName && !matchEmail) return false;
        }

        // Filter by Role
        if (filters.role !== "all" && m.role !== filters.role) {
          return false;
        }

        // Filter by Status
        if (filters.status !== "all" && m.status !== filters.status) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "name") {
          return a.name.localeCompare(b.name, "vi");
        }
        if (filters.sortBy === "taskCount") {
          return b.taskCount - a.taskCount;
        }
        // joinDate
        return a.joinDate.localeCompare(b.joinDate);
      });
  }, [members, filters]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "active").length;
    const pending = pendingInvites.length;
    const guests = members.filter((m) => m.role === "guest").length;
    return { total, active, pending, guests };
  }, [members, pendingInvites]);

  // Actions: Role Change
  const requestRoleChange = (member: WorkspaceMember, newRole: UserRole) => {
    if (member.role === newRole) return;
    if (newRole === "admin" || newRole === "owner") {
      setRoleChangeTarget({ member, newRole });
    } else {
      executeRoleChange(member.id, newRole);
    }
  };

  const executeRoleChange = (memberId: string, newRole: UserRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const target = members.find((m) => m.id === memberId);
    showToast(`Đã cập nhật vai trò của ${target?.name || "thành viên"} thành "${newRole.toUpperCase()}".`, "success");
    setRoleChangeTarget(null);
  };

  // Actions: Ownership Transfer
  const requestOwnershipTransfer = (member: WorkspaceMember) => {
    setTransferTarget(member);
  };

  const confirmOwnershipTransfer = () => {
    if (!transferTarget) return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.isCurrentUser) {
          return { ...m, role: "admin", isCurrentUser: false };
        }
        if (m.id === transferTarget.id) {
          return { ...m, role: "owner", isCurrentUser: true };
        }
        return m;
      })
    );
    showToast(`Đã chuyển quyền Owner Workspace thành công cho ${transferTarget.name}!`, "success");
    setTransferTarget(null);
  };

  // Actions: Suspend / Unsuspend
  const toggleMemberStatus = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newStatus: MemberStatus = m.status === "active" ? "suspended" : "active";
          showToast(
            `Đã ${newStatus === "suspended" ? "tạm dừng" : "kích hoạt lại"} tài khoản của ${m.name}.`,
            newStatus === "suspended" ? "info" : "success"
          );
          return { ...m, status: newStatus };
        }
        return m;
      })
    );
  };

  // Actions: Remove Member
  const removeMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    showToast(`Đã xóa thành viên ${target?.name || ""} khỏi Workspace.`, "info");
  };

  // Actions: Bulk Invite
  const sendBulkInvite = (emails: string[], role: UserRole, projects: string[]) => {
    const newInvites: PendingInvite[] = emails.map((email, idx) => ({
      id: `inv-${Date.now()}-${idx}`,
      email,
      role,
      invitedBy: "Hoàng Mạnh Trường (Bạn)",
      invitedAt: new Date().toLocaleDateString("vi-VN"),
      expiresAt: "7 ngày tới",
      projects: projects.length > 0 ? projects : ["Website E-Commerce V2"],
    }));

    setPendingInvites((prev) => [...newInvites, ...prev]);
    setIsInviteModalOpen(false);
    showToast(`Đã gửi lời mời tham gia Workspace thành công đến ${emails.length} email!`, "success");
  };

  // Actions: Pending Invites (Resend & Revoke)
  const resendInvite = (inviteId: string) => {
    const inv = pendingInvites.find((i) => i.id === inviteId);
    showToast(`Đã gửi lại email lời mời đến ${inv?.email || ""}.`, "success");
  };

  const revokeInvite = (inviteId: string) => {
    const inv = pendingInvites.find((i) => i.id === inviteId);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    showToast(`Đã thu hồi lời mời đến ${inv?.email || ""}.`, "info");
  };

  // Actions: Copy Invite Link
  const copyInviteLink = (expiration: string) => {
    const fakeLink = `https://taskflow.io/invite/ws-dev-8849?exp=${expiration}`;
    navigator.clipboard?.writeText(fakeLink);
    showToast(`Đã sao chép liên kết mời (Hạn: ${expiration}) vào bộ nhớ tạm!`, "success");
  };

  return {
    members: filteredMembers,
    rawMembers: members,
    pendingInvites,
    metrics,
    filters,
    setFilters,
    resetFilters: () => setFilters(INITIAL_FILTERS),
    activeTab,
    setActiveTab,
    // Drawer & Modals
    selectedMember,
    setSelectedMember,
    isInviteModalOpen,
    openInviteModal: () => setIsInviteModalOpen(true),
    closeInviteModal: () => setIsInviteModalOpen(false),
    transferTarget,
    closeTransferModal: () => setTransferTarget(null),
    confirmOwnershipTransfer,
    roleChangeTarget,
    closeRoleChangeModal: () => setRoleChangeTarget(null),
    confirmRoleChange: () => {
      if (roleChangeTarget) {
        executeRoleChange(roleChangeTarget.member.id, roleChangeTarget.newRole);
      }
    },
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
  };
}
