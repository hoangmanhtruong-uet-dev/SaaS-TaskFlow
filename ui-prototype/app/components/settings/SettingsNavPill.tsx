"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Shield,
  Bell,
  Lock,
  Plug,
  CreditCard,
} from "lucide-react";

export const SettingsNavPill: React.FC = () => {
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
    <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800/80 overflow-x-auto scrollbar-none my-4">
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
  );
};
