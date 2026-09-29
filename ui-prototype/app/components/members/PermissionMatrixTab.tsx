"use client";

import { Check, X, Shield } from "lucide-react";
import { MOCK_PERMISSION_MATRIX } from "./constants";

export const PermissionMatrixTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner Intro */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3 shadow-md">
        <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0 mt-0.5">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">
            Bảng phân quyền chi tiết (Role Permissions Matrix)
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            So sánh trực quan ma trận quyền hạn tối cao giữa các vai trò **Owner**, **Admin**, **Member** và **Guest** trong Workspace TaskFlow.
          </p>
        </div>
      </div>

      {/* Permission Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
                <th className="py-3.5 px-4 min-w-[280px]">Danh mục & Quyền hạn</th>
                <th className="py-3.5 px-4 text-center w-28 bg-amber-950/20 text-amber-400">
                  Owner
                </th>
                <th className="py-3.5 px-4 text-center w-28 bg-purple-950/20 text-purple-400">
                  Admin
                </th>
                <th className="py-3.5 px-4 text-center w-28 bg-emerald-950/20 text-emerald-400">
                  Member
                </th>
                <th className="py-3.5 px-4 text-center w-28 text-zinc-400">
                  Guest
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {MOCK_PERMISSION_MATRIX.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/80 transition-colors">
                  {/* Permission Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {item.category}
                      </span>
                      <span className="font-semibold text-zinc-200">
                        {item.permissionName}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {item.description}
                    </p>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4 text-center bg-amber-950/10">
                    {item.ownerAllowed ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-zinc-950 text-zinc-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Admin */}
                  <td className="py-3.5 px-4 text-center bg-purple-950/10">
                    {item.adminAllowed ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-zinc-950 text-zinc-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Member */}
                  <td className="py-3.5 px-4 text-center bg-emerald-950/10">
                    {item.memberAllowed ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-zinc-950 text-zinc-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  {/* Guest */}
                  <td className="py-3.5 px-4 text-center">
                    {item.guestAllowed ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-zinc-950 text-zinc-600">
                        <X className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
