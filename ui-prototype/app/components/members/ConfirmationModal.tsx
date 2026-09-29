 
"use client";

import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { WorkspaceMember, UserRole } from "./types";

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: WorkspaceMember | null;
  newRole: UserRole | null;
}

export const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  newRole,
}) => {
  if (!isOpen || !member || !newRole) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              Xác nhận thay đổi vai trò
            </h3>
            <p className="text-xs text-zinc-400">
              Cập nhật quyền hạn sử dụng trong Workspace
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Bạn có chắc chắn muốn thay đổi vai trò của thành viên{" "}
          <strong className="text-zinc-100">{member.name}</strong> (`{member.email}`) từ{" "}
          <span className="uppercase text-amber-400 font-semibold">{member.role}</span> thành{" "}
          <span className="uppercase text-emerald-400 font-semibold">{newRole}</span> không?
        </p>

        {newRole === "admin" && (
          <div className="bg-zinc-950 border border-amber-900/40 rounded-xl p-3 text-[11px] text-amber-300">
            ⚠️ Vai trò Admin có toàn quyền quản lý dự án, xóa dữ liệu và thay đổi vai trò của các thành viên khác trong Workspace.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Xác nhận đổi vai trò
          </button>
        </div>
      </div>
    </div>
  );
};

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: WorkspaceMember | null;
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  member,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-red-950 border border-red-800 text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-400">
              Chuyển giao quyền Owner Workspace
            </h3>
            <p className="text-xs text-zinc-400">Thao tác quan trọng mang tính sở hữu</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
          <p>
            Bạn sắp chuyển giao **Quyền Owner Workspace tối cao** cho thành viên:
          </p>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
            <div>
              <div className="font-bold text-zinc-100">{member.name}</div>
              <div className="text-[11px] text-zinc-400">{member.email}</div>
            </div>
          </div>
          <p className="text-red-400 font-semibold pt-1">
            ⚠️ Lưu ý: Sau khi hoàn tất, vai trò hiện tại của bạn sẽ tự động hạ xuống là Admin. Thao tác này không thể hoàn tác trực tiếp trừ khi Owner mới chuyển giao lại cho bạn.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/60 transition-all"
          >
            Chuyển quyền Owner ngay
          </button>
        </div>
      </div>
    </div>
  );
};
