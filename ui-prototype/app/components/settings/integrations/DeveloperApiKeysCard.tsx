 
import React from "react";
import { KeyRound, Plus, Trash2, Calendar, Clock, Code2 } from "lucide-react";
import { ApiKeyItem } from "./types";

interface DeveloperApiKeysCardProps {
  apiKeys: ApiKeyItem[];
  onOpenCreateModal: () => void;
  onRevokeKey: (id: string) => void;
}

export const DeveloperApiKeysCard: React.FC<DeveloperApiKeysCardProps> = ({
  apiKeys,
  onOpenCreateModal,
  onRevokeKey,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Khối 5: Quản lý API Keys (Developer RESTful API Tokens)
            </h2>
            <p className="text-xs text-zinc-400">
              Cấp phát Personal Access Tokens để truy vấn REST API của TaskFlow từ ứng dụng nội bộ hoặc script tự động.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo API Key mới</span>
        </button>
      </div>

      {/* API Keys Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-3">Tên API Key</th>
              <th className="p-3">Mã Token (Masked)</th>
              <th className="p-3">Phạm vi Quyền (Scope)</th>
              <th className="p-3">Ngày tạo & Sử dụng lần cuối</th>
              <th className="p-3 text-right">Thu hồi Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
            {apiKeys.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                {/* Name */}
                <td className="p-3 font-sans font-bold text-zinc-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>{item.name}</span>
                </td>

                {/* Masked Key */}
                <td className="p-3">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-300 font-bold tracking-wider">
                    {item.keyMasked}
                  </span>
                </td>

                {/* Scope */}
                <td className="p-3 font-sans">
                  {item.scope === "read_write" && (
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                      Read & Write
                    </span>
                  )}
                  {item.scope === "read" && (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                      Read-Only
                    </span>
                  )}
                  {item.scope === "admin" && (
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                      Full Admin
                    </span>
                  )}
                </td>

                {/* Date & Last Used */}
                <td className="p-3 space-y-0.5 text-[11px] font-sans">
                  <div className="text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    Tạo ngày: {item.createdDate}
                  </div>
                  <div className="text-zinc-500 flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3" />
                    Dùng gần nhất: {item.lastUsedAt || "Chưa sử dụng"}
                  </div>
                </td>

                {/* Revoke Action */}
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRevokeKey(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 text-xs font-sans font-semibold transition"
                    title="Thu hồi API Key này vĩnh viễn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                </td>
              </tr>
            ))}

            {apiKeys.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-zinc-500 italic font-sans">
                  Chưa có API Key nào được cấp phát.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
