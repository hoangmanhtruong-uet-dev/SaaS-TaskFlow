 
import React from "react";
import { Check, Lock, ShieldCheck, CheckSquare, Info } from "lucide-react";
import { RoleInfo, PermissionGroup, MatrixState, RoleKey } from "./types";

interface RolePermissionMatrixTableProps {
  roles: RoleInfo[];
  permissionGroups: PermissionGroup[];
  matrixState: MatrixState;
  isRoleLocked: (roleKey: RoleKey) => boolean;
  onToggleCell: (roleKey: RoleKey, permId: string) => void;
  onToggleColumn: (roleKey: RoleKey) => void;
  onToggleGroupForRole: (roleKey: RoleKey, groupPermIds: string[]) => void;
}

export const RolePermissionMatrixTable: React.FC<RolePermissionMatrixTableProps> = ({
  roles,
  permissionGroups,
  matrixState,
  isRoleLocked,
  onToggleCell,
  onToggleColumn,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm overflow-hidden">
      {/* Table Header Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Khối 2: Ma trận Phân quyền Tương tác (Interactive Matrix)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Bật/tắt nhanh các quyền hạn theo từng nhóm phạm vi hoặc vai trò. Cột OWNER được bảo vệ tuyệt đối.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bấm tiêu đề vai trò để bật/tắt toàn bộ cột</span>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Head: Roles */}
          <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
            <tr>
              <th className="p-4 text-zinc-300 font-bold uppercase text-[11px] tracking-wider min-w-[280px]">
                Quyền hạn & Phạm vi truy cập
              </th>
              {roles.map((role) => {
                const locked = isRoleLocked(role.key);
                return (
                  <th key={role.key} className="p-4 text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${role.badgeBg} ${role.badgeText}`}
                        >
                          {role.label}
                        </span>
                        {locked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                      </div>

                      {/* Select Column All Toggle */}
                      {!locked ? (
                        <button
                          type="button"
                          onClick={() => onToggleColumn(role.key)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1 transition mt-0.5"
                          title="Tích/Bỏ chọn tất cả quyền cho vai trò này"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Tích tất cả</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Bảo vệ (Locked)</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Grouped Permissions */}
          <tbody className="divide-y divide-zinc-800/80">
            {permissionGroups.map((group) => {
              return (
                <React.Fragment key={group.id}>
                  {/* Group Header Row */}
                  <tr className="bg-zinc-900/90 border-t border-b border-zinc-800/90">
                    <td
                      colSpan={roles.length + 1}
                      className="p-3 bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 font-bold text-indigo-300 text-xs tracking-wide"
                    >
                      <div className="flex items-center justify-between">
                        <span>{group.title}</span>
                        <span className="text-[11px] font-normal text-zinc-400">
                          {group.permissions.length} quyền hạn
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Individual Permission Item Rows */}
                  {group.permissions.map((perm) => (
                    <tr
                      key={perm.id}
                      className="hover:bg-zinc-900/50 transition duration-150"
                    >
                      {/* Permission Description */}
                      <td className="p-4 space-y-0.5">
                        <div className="font-semibold text-zinc-100 text-xs flex items-center gap-2">
                          <span>{perm.name}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {perm.description}
                        </p>
                      </td>

                      {/* Checkboxes for each Role */}
                      {roles.map((role) => {
                        const locked = isRoleLocked(role.key);
                        const isChecked = locked ? true : !!matrixState[role.key]?.[perm.id];

                        return (
                          <td key={role.key} className="p-4 text-center align-middle">
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => onToggleCell(role.key, perm.id)}
                              className={`w-7 h-7 mx-auto rounded-lg border flex items-center justify-center transition ${
                                locked
                                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 cursor-not-allowed"
                                  : isChecked
                                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                                  : "bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-700"
                              }`}
                            >
                              {locked ? (
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                              ) : isChecked ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : null}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
