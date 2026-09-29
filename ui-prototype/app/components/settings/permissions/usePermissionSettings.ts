import { useState, useCallback } from "react";
import {
  RoleInfo,
  MatrixState,
  ProjectPermissionOverride,
  ToastNotice,
  RoleKey,
} from "./types";
import {
  defaultSystemRoles,
  permissionGroups,
  initialMatrixState,
  mockProjectOverrides,
  mockWorkspaceProjectsList,
} from "./constants";

export function usePermissionSettings() {
  const [roles, setRoles] = useState<RoleInfo[]>(defaultSystemRoles);
  const [matrixState, setMatrixState] = useState<MatrixState>(initialMatrixState);
  const [initialState, setInitialState] = useState<MatrixState>(initialMatrixState);

  // Project Overrides State
  const [projectOverrides, setProjectOverrides] =
    useState<ProjectPermissionOverride[]>(mockProjectOverrides);

  // Modals & Saving State
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  // Toast Helper
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now().toString();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 3500);
    },
    []
  );

  // Compute if form is dirty
  const isDirty = JSON.stringify(matrixState) !== JSON.stringify(initialState);

  // Guard Helper: Check if role is locked (e.g. Owner)
  const isRoleLocked = (roleKey: RoleKey) => roleKey === "owner";

  // 1. Toggle single permission cell
  const togglePermissionCell = (roleKey: RoleKey, permissionId: string) => {
    if (isRoleLocked(roleKey)) {
      showToast("Quyền hạn của Chủ sở hữu (OWNER) luôn được bảo vệ cố định!", "info");
      return;
    }

    setMatrixState((prev) => {
      const currentRolePerms = prev[roleKey] || {};
      const nextVal = !currentRolePerms[permissionId];
      return {
        ...prev,
        [roleKey]: {
          ...currentRolePerms,
          [permissionId]: nextVal,
        },
      };
    });
  };

  // 2. Toggle Column (Select All / Clear All for a Role)
  const toggleRoleColumn = (roleKey: RoleKey) => {
    if (isRoleLocked(roleKey)) {
      showToast("Quyền hạn của OWNER là toàn quyền hệ thống và không thể thay đổi.", "info");
      return;
    }

    // Determine all permission IDs
    const allPermIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
    const currentRolePerms = matrixState[roleKey] || {};
    const areAllChecked = allPermIds.every((id) => currentRolePerms[id]);

    const targetVal = !areAllChecked;

    setMatrixState((prev) => {
      const updatedPerms = { ...(prev[roleKey] || {}) };
      allPermIds.forEach((id) => {
        updatedPerms[id] = targetVal;
      });
      return {
        ...prev,
        [roleKey]: updatedPerms,
      };
    });

    showToast(
      targetVal
        ? `Đã bật tất cả quyền cho vai trò ${roleKey.toUpperCase()}`
        : `Đã tắt tất cả quyền cho vai trò ${roleKey.toUpperCase()}`,
      "info"
    );
  };

  // 3. Toggle Group for a specific Role
  const toggleGroupForRole = (roleKey: RoleKey, groupPermIds: string[]) => {
    if (isRoleLocked(roleKey)) {
      showToast("Quyền hạn của OWNER không thể thay đổi.", "info");
      return;
    }

    const currentRolePerms = matrixState[roleKey] || {};
    const areGroupChecked = groupPermIds.every((id) => currentRolePerms[id]);
    const targetVal = !areGroupChecked;

    setMatrixState((prev) => {
      const updatedPerms = { ...(prev[roleKey] || {}) };
      groupPermIds.forEach((id) => {
        updatedPerms[id] = targetVal;
      });
      return {
        ...prev,
        [roleKey]: updatedPerms,
      };
    });
  };

  // 4. Create Dynamic Custom Role
  const createCustomRole = (
    name: string,
    description: string,
    color: string,
    selectedPermIds: string[]
  ) => {
    const roleKey = `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString().slice(-4)}`;
    
    const newRole: RoleInfo = {
      key: roleKey,
      label: name.toUpperCase(),
      description: description || "Vai trò tùy chỉnh được tạo bởi Quản trị viên.",
      memberCount: 0,
      isSystem: false,
      color: color || "indigo",
      badgeBg: `bg-${color}-500/10 border-${color}-500/30`,
      badgeText: `text-${color}-400`,
    };

    // Build permission map for this custom role
    const allPermIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
    const rolePermMap: Record<string, boolean> = {};
    allPermIds.forEach((id) => {
      rolePermMap[id] = selectedPermIds.includes(id);
    });

    setRoles((prev) => [...prev, newRole]);
    setMatrixState((prev) => ({
      ...prev,
      [roleKey]: rolePermMap,
    }));

    setIsCustomRoleModalOpen(false);
    showToast(`Đã khởi tạo thành công Vai trò tùy chỉnh "${name}"!`, "success");
  };

  // 5. Delete Custom Role
  const deleteCustomRole = (roleKey: RoleKey) => {
    const targetRole = roles.find((r) => r.key === roleKey);
    if (targetRole?.isSystem) {
      showToast("Không thể xóa các vai trò mặc định của hệ thống!", "error");
      return;
    }

    setRoles((prev) => prev.filter((r) => r.key !== roleKey));
    setMatrixState((prev) => {
      const nextMap = { ...prev };
      delete nextMap[roleKey];
      return nextMap;
    });

    showToast(`Đã xóa vai trò tùy chỉnh "${targetRole?.label}"`, "info");
  };

  // 6. Project Override Handlers
  const addProjectOverride = (
    projectId: string,
    roleKey: RoleKey,
    permissionId: string,
    accessState: "allow" | "deny"
  ) => {
    const project = mockWorkspaceProjectsList.find((p) => p.id === projectId);
    const permName = permissionGroups
      .flatMap((g) => g.permissions)
      .find((p) => p.id === permissionId)?.name;

    if (!project || !permName) return;

    const newOverride: ProjectPermissionOverride = {
      id: `override-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      roleKey,
      permissionId,
      permissionName: permName,
      accessState,
    };

    setProjectOverrides((prev) => [newOverride, ...prev]);
    showToast(`Đã thêm quy tắc ghi đè quyền cho ${project.name}`, "success");
  };

  const removeProjectOverride = (overrideId: string) => {
    setProjectOverrides((prev) => prev.filter((o) => o.id !== overrideId));
    showToast("Đã gỡ bỏ quy tắc ghi đè quyền dự án", "info");
  };

  // 7. Save Matrix Handler
  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setInitialState(matrixState);
    setSaving(false);
    showToast("Đã cập nhật Ma trận phân quyền thành công!", "success");
  };

  // 8. Reset Matrix Handler
  const handleReset = () => {
    setMatrixState(initialState);
    showToast("Đã khôi phục ma trận phân quyền về trạng thái trước đó", "info");
  };

  return {
    roles,
    matrixState,
    isDirty,
    saving,
    toast,
    projectOverrides,
    isCustomRoleModalOpen,
    setIsCustomRoleModalOpen,
    // Actions & Handlers
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
    showToast,
  };
}
