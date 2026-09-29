import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Shield,
  Bell,
  User,
  Lock,
  Plug,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const PermissionsHeaderNav: React.FC = () => {
  const pathname = usePathname();

  const settingsTabs = [
    { label: "Trang cá nhân", href: "/app/settings/profile", icon: User },
    { label: "Workspace", href: "/app/settings/workspace", icon: Building2 },
    { label: "Bảo mật & MFA", href: "/app/settings/security", icon: Shield },
    { label: "Thông báo", href: "/app/settings/notifications", icon: Bell },
    { label: "Phân quyền", href: "/app/settings/permissions", icon: Lock },
    { label: "Tích hợp", href: "/app/settings/integrations", icon: Plug },
    { label: "Gói cước & Billing", href: "/app/settings/billing", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 border-b border-zinc-800/80 pb-6">
      {/* Top Header Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>Quản trị Vai trò & Quyền truy cập</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            Ma trận Phân quyền (Role & Permissions Matrix)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Cấu hình ma trận truy cập chi tiết theo từng vai trò hệ thống, tạo vai trò tùy chỉnh và quản lý quy tắc ghi đè dự án.
          </p>
        </div>

        {/* Security Status Badge */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>RBAC Security Engine</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kích hoạt 48 Thành viên</span>
          </div>
        </div>
      </div>

      {/* Pill Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800/80 overflow-x-auto scrollbar-none">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5 animate-ping" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
