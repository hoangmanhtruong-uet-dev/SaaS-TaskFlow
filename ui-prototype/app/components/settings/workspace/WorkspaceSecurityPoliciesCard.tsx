import React from "react";
import { Shield, Lock, Share2, AlertTriangle, Users, KeyRound } from "lucide-react";
import { WorkspaceSecurityPolicy } from "./types";

interface WorkspaceSecurityPoliciesCardProps {
  securityPolicy: WorkspaceSecurityPolicy;
  onUpdateSecurityPolicy: (key: keyof WorkspaceSecurityPolicy, val: boolean | number) => void;
}

export const WorkspaceSecurityPoliciesCard: React.FC<WorkspaceSecurityPoliciesCardProps> = ({
  securityPolicy,
  onUpdateSecurityPolicy,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">
            Khối 4: Chính sách Bảo mật Bắt buộc (Security & Compliance Policies)
          </h2>
          <p className="text-xs text-zinc-400">
            Thiết lập các tiêu chuẩn an toàn dữ liệu, bắt buộc 2FA và kiểm soát quyền chia sẻ công khai.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Policy 1: Mandatory 2FA */}
        <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 transition hover:border-zinc-700 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-zinc-100">
                  Bắt buộc 2FA cho toàn bộ Thành viên (Mandatory 2FA/MFA)
                </span>
                <span className="block text-xs text-zinc-400 mt-0.5">
                  Yêu cầu tất cả thành viên (bao gồm Owner, Admin và Member) phải bật xác thực 2 lớp (MFA) để đăng nhập và truy cập dữ liệu Workspace.
                </span>
              </div>
            </div>

            {/* Switch Toggle */}
            <label aria-label="Toggle" className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={securityPolicy.require2FA}
                onChange={(e) => onUpdateSecurityPolicy("require2FA", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Warning Banner when 2FA is forced */}
          {securityPolicy.require2FA && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Đang kích hoạt:</strong> Tất cả thành viên sẽ bị bắt buộc thiết lập App Authenticator (Google Authenticator / Authy) ở phiên đăng nhập tiếp theo.
              </span>
            </div>
          )}
        </div>

        {/* Policy 2: Public Link Sharing */}
        <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 transition hover:border-zinc-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-zinc-100">
                  Cho phép chia sẻ Dự án / Task công khai (Public Link Sharing)
                </span>
                <span className="block text-xs text-zinc-400 mt-0.5">
                  Cho phép tạo đường dẫn xem trực tiếp (read-only link) các dự án hoặc công việc cho khách hàng ngoài hệ thống mà không cần tài khoản TaskFlow.
                </span>
              </div>
            </div>

            {/* Switch Toggle */}
            <label aria-label="Toggle" className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={securityPolicy.allowPublicLinkSharing}
                onChange={(e) => onUpdateSecurityPolicy("allowPublicLinkSharing", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Policy 3: Admin-only Project Creation */}
        <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 transition hover:border-zinc-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-zinc-100">
                  Chỉ Admin mới có quyền khởi tạo Dự án mới (Admin-Only Project Creation)
                </span>
                <span className="block text-xs text-zinc-400 mt-0.5">
                  Giới hạn quyền tạo Dự án mới cho Quản trị viên (Admin & Owner). Thành viên thường (Member) chỉ có thể tham gia các dự án đã được cấp quyền.
                </span>
              </div>
            </div>

            {/* Switch Toggle */}
            <label aria-label="Toggle" className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={securityPolicy.restrictProjectCreationToAdmin}
                onChange={(e) =>
                  onUpdateSecurityPolicy("restrictProjectCreationToAdmin", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Policy 4: Session Timeout (Minutes) */}
        <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-sm font-semibold text-zinc-100">
                Thời gian tự động ngắt phiên làm việc không hoạt động (Session Timeout)
              </span>
              <span className="block text-xs text-zinc-400">
                Tự động đăng xuất thành viên sau khoảng thời gian không có thao tác chuột hoặc bàn phím.
              </span>
            </div>
          </div>

          <select
            value={securityPolicy.sessionTimeoutMinutes}
            onChange={(e) => onUpdateSecurityPolicy("sessionTimeoutMinutes", parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value={30}>30 phút</option>
            <option value={60}>1 tiếng</option>
            <option value={120}>2 tiếng (Mặc định)</option>
            <option value={480}>8 tiếng</option>
          </select>
        </div>
      </div>
    </div>
  );
};
