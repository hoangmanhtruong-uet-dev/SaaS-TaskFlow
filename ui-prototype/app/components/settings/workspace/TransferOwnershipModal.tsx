/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle2, UserCheck, ArrowRight } from "lucide-react";
import { mockWorkspaceMembers } from "./constants";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOwnerId: string;
  onConfirmTransfer: (newOwnerId: string) => void;
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  currentOwnerId,
  onConfirmTransfer,
}) => {
  const [selectedId, setSelectedId] = useState<string>("");

  if (!isOpen) return null;

  const eligibleMembers = mockWorkspaceMembers.filter((m) => m.id !== currentOwnerId);
  const selectedMember = mockWorkspaceMembers.find((m) => m.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <UserCheck className="w-5 h-5" />
            <h3 className="text-lg font-bold text-zinc-100">Chuyển giao quyền Sở hữu (Transfer Owner)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <ShieldAlert className="w-4 h-4" /> Cảnh báo quan trọng:
          </div>
          <p>
            Sau khi chuyển quyền Owner, bạn sẽ hạ cấp xuống vai trò <strong>Admin</strong>. Chỉ có duy nhất 01 Owner điều hành thanh toán & xóa Workspace.
          </p>
        </div>

        {/* Member Selector */}
        <div className="space-y-2">
          <div className="block text-xs font-semibold text-zinc-300">
            Chọn thành viên nhận quyền Sở hữu mới:
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {eligibleMembers.map((member) => {
              const isSelected = selectedId === member.id;
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedId(member.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs border border-zinc-700 overflow-hidden">
                      {member.avatarUrl ? (
                         
                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-100">{member.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-semibold text-zinc-300">
                      {member.role}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Hủy bỏ
          </button>
          <button
            disabled={!selectedId}
            onClick={() => selectedId && onConfirmTransfer(selectedId)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 disabled:opacity-50 transition"
          >
            <span>Xác nhận chuyển quyền cho {selectedMember?.name || "thành viên"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
