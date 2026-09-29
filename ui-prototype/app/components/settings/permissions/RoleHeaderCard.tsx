 
import React from "react";
import { Plus, Users, Shield, Lock, Trash2, Crown } from "lucide-react";
import { RoleInfo, RoleKey } from "./types";

interface RoleHeaderCardProps {
  roles: RoleInfo[];
  onOpenCustomRoleModal: () => void;
  onDeleteCustomRole: (roleKey: RoleKey) => void;
}

export const RoleHeaderCard: React.FC<RoleHeaderCardProps> = ({
  roles,
  onOpenCustomRoleModal,
  onDeleteCustomRole,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Khối 1: Tổng quan Vai trò Hệ thống (System Roles Overview)
            </h2>
            <p className="text-xs text-zinc-400">
              Danh sách các vai trò mặc định và vai trò tùy chỉnh đang được gán cho nhân sự trong Workspace.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCustomRoleModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo vai trò tùy chỉnh (Custom Role)</span>
        </button>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {roles.map((role) => (
          <div
            key={role.key}
            className={`p-4 rounded-xl border bg-zinc-950/80 flex flex-col justify-between space-y-3 transition hover:border-zinc-700 relative group shadow-inner ${
              role.key === "owner" ? "border-amber-500/40 bg-amber-950/10" : "border-zinc-800"
            }`}
          >
            <div>
              {/* Badge & Crown / Lock Icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wider ${role.badgeBg} ${role.badgeText}`}
                >
                  {role.key === "owner" && <Crown className="w-3 h-3 text-amber-400" />}
                  {role.label}
                </span>

                {role.isSystem ? (
                  <span
                    className="p-1 rounded text-zinc-500 hover:text-zinc-400"
                    title="Vai trò mặc định của hệ thống"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDeleteCustomRole(role.key)}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Xóa vai trò tùy chỉnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                {role.description}
              </p>
            </div>

            {/* Member Count Footer */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span>Thành viên:</span>
              </span>
              <span className="font-bold font-mono text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {role.memberCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
