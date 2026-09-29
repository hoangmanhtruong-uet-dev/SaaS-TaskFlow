 
import React, { useState } from "react";
import { Sliders, Plus, Trash2, FolderKanban, CheckCircle2, XCircle } from "lucide-react";
import { ProjectPermissionOverride, RoleInfo, RoleKey } from "./types";
import { mockWorkspaceProjectsList, permissionGroups } from "./constants";

interface ProjectPermissionOverridesCardProps {
  roles: RoleInfo[];
  projectOverrides: ProjectPermissionOverride[];
  onAddOverride: (
    projectId: string,
    roleKey: RoleKey,
    permissionId: string,
    accessState: "allow" | "deny"
  ) => void;
  onRemoveOverride: (overrideId: string) => void;
}

export const ProjectPermissionOverridesCard: React.FC<ProjectPermissionOverridesCardProps> = ({
  roles,
  projectOverrides,
  onAddOverride,
  onRemoveOverride,
}) => {
  const [selectedProject, setSelectedProject] = useState(mockWorkspaceProjectsList[0].id);
  const [selectedRole, setSelectedRole] = useState<RoleKey>("member");
  const [selectedPermission, setSelectedPermission] = useState("project_delete");
  const [selectedAccessState, setSelectedAccessState] = useState<"allow" | "deny">("deny");

  const allPermissions = permissionGroups.flatMap((g) => g.permissions);

  const handleAddClick = () => {
    onAddOverride(selectedProject, selectedRole, selectedPermission, selectedAccessState);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">
            Khối 3: Ghi đè Phân quyền theo Dự án (Project-Level Overrides)
          </h2>
          <p className="text-xs text-zinc-400">
            Thiết lập quy tắc loại trừ hoặc cấp bổ sung quyền hạn cho các Dự án có tính chất bảo mật đặc thù.
          </p>
        </div>
      </div>

      {/* Add New Rule Form Bar */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <span className="block text-xs font-semibold text-zinc-300">
          Thêm Quy tắc Ghi đè Quyền mới:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Select Project */}
          <div className="space-y-1">
            <label htmlFor="override-project" className="text-[11px] text-zinc-400 font-medium">Dự án áp dụng</label>
            <select
              id="override-project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              {mockWorkspaceProjectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Role */}
          <div className="space-y-1">
            <label htmlFor="override-role" className="text-[11px] text-zinc-400 font-medium">Vai trò áp dụng</label>
            <select
              id="override-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              {roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Permission */}
          <div className="space-y-1">
            <label htmlFor="override-permission" className="text-[11px] text-zinc-400 font-medium">Quyền hạn</label>
            <select
              id="override-permission"
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              {allPermissions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select State (Allow/Deny) */}
          <div className="space-y-1">
            <label htmlFor="override-state" className="text-[11px] text-zinc-400 font-medium">Trạng thái Ghi đè</label>
            <select
              id="override-state"
              value={selectedAccessState}
              onChange={(e) => setSelectedAccessState(e.target.value as "allow" | "deny")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="deny">🚫 Từ chối (DENY)</option>
              <option value="allow">✅ Cho phép (ALLOW)</option>
            </select>
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddClick}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Quy tắc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Override Rules List Table */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-zinc-300">
          Danh sách Quy tắc Ghi đè đang kích hoạt ({projectOverrides.length}):
        </span>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Dự án</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Quyền hạn bị ghi đè</th>
                <th className="p-3">Trạng thái Override</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
              {projectOverrides.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                  <td className="p-3 font-sans font-bold text-zinc-100 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-indigo-400" />
                    {item.projectName}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold uppercase text-[10px] text-zinc-300">
                      {item.roleKey.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-sans text-zinc-300">{item.permissionName}</td>
                  <td className="p-3">
                    {item.accessState === "deny" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-sans font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> TỪ CHỐI (DENY)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-sans font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> CHO PHÉP (ALLOW)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveOverride(item.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 transition"
                      title="Gỡ bỏ quy tắc ghi đè"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {projectOverrides.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500 italic font-sans">
                    Chưa có quy tắc ghi đè riêng biệt nào cho từng dự án.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
