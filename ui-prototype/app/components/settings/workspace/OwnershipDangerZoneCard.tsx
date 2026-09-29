 
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { UserCheck, AlertTriangle, Snowflake, Trash2, ShieldAlert } from "lucide-react";
import { mockWorkspaceMembers } from "./constants";

interface OwnershipDangerZoneCardProps {
  ownerId: string;
  status: "active" | "frozen" | "deleted";
  onOpenTransferModal: () => void;
  onToggleFreeze: () => void;
  onOpenDeleteModal: () => void;
}

export const OwnershipDangerZoneCard: React.FC<OwnershipDangerZoneCardProps> = ({
  ownerId,
  status,
  onOpenTransferModal,
  onToggleFreeze,
  onOpenDeleteModal,
}) => {
  const currentOwner = mockWorkspaceMembers.find((m) => m.id === ownerId) || mockWorkspaceMembers[0];

  return (
    <div className="space-y-6">
      {/* Transfer Ownership Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Khối 6: Chuyển quyền Sở hữu (Transfer Ownership)
            </h2>
            <p className="text-xs text-zinc-400">
              Chuyển giao vai trò Quyền lực cao nhất (Owner) cho thành viên khác trong tổ chức.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
              {currentOwner.avatarUrl ? (
                 
                <img src={currentOwner.avatarUrl} alt={currentOwner.name} className="w-full h-full object-cover" />
              ) : (
                currentOwner.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-400">Owner hiện tại:</span>
              <span className="block text-sm font-bold text-zinc-100">{currentOwner.name} ({currentOwner.email})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTransferModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/10 hover:bg-amber-600 hover:text-white border border-amber-500/30 text-amber-300 font-semibold text-xs shadow-sm transition shrink-0"
          >
            <UserCheck className="w-4 h-4" />
            <span>Chuyển quyền sở hữu Workspace</span>
          </button>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 shadow-xl space-y-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
          <div className="p-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-400">Vùng Nguy Hiểm (Danger Zone)</h2>
            <p className="text-xs text-red-300/70">
              Các thao tác nhạy cảm liên quan đến đóng đóng băng dữ liệu hoặc xóa vĩnh viễn không gian làm việc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Freeze Workspace */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                <span>{status === "frozen" ? "Bật lại Workspace" : "Tạm dừng Workspace (Freeze)"}</span>
              </div>
              <p className="text-xs text-zinc-400">
                {status === "frozen"
                  ? "Kích hoạt lại quyền chỉnh sửa cho tất cả thành viên trong tổ chức."
                  : "Chuyển Workspace sang trạng thái Read-Only. Thành viên sẽ không thể tạo mới hay sửa dự án/task."}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleFreeze}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition border shadow-sm ${
                status === "frozen"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
              }`}
            >
              <Snowflake className="w-4 h-4" />
              <span>{status === "frozen" ? "Mở lại Workspace" : "Tạm dừng Workspace"}</span>
            </button>
          </div>

          {/* Action 2: Delete Workspace */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Xóa vĩnh viễn Workspace</span>
              </div>
              <p className="text-xs text-red-300/80">
                Xóa toàn bộ dữ liệu dự án, nhiệm vụ, file đính kèm và tài khoản thành viên liên kết. Không thể khôi phục.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenDeleteModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/30 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Yêu cầu Xóa vĩnh viễn Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
