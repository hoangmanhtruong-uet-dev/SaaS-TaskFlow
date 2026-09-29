import {
  WorkspaceSettingsForm,
  WorkspaceMember,
  DataExportHistoryItem,
} from "./types";

export const initialWorkspaceData: WorkspaceSettingsForm = {
  name: "ACME Corporation",
  description:
    "Hệ thống điều hành dự án và quản lý quy trình công việc toàn diện cho đội ngũ ACME.",
  industry: "Technology",
  brandColor: "#6366F1", // Indigo accent
  logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",

  subdomain: "acme",
  customDomain: {
    domain: "tasks.acmecorp.com",
    isVerified: true,
    lastCheckedAt: "26/09/2026 07:30",
    cnameRecord: {
      id: "dns-1",
      type: "CNAME",
      host: "tasks",
      target: "cname.taskflow.app",
      ttl: "3600",
      status: "verified",
    },
  },

  timezone: "Asia/Ho_Chi_Minh",
  allowedEmailDomains: ["acme.com", "acmecorp.vn", "acme-tech.io"],
  currency: "VND",
  language: "vi",
  dateFormat: "DD/MM/YYYY",

  securityPolicy: {
    require2FA: true,
    allowPublicLinkSharing: false,
    restrictProjectCreationToAdmin: true,
    sessionTimeoutMinutes: 120,
    ipWhitelistEnabled: false,
  },

  ownerId: "user-owner-1",
  status: "active",
};

export const mockWorkspaceMembers: WorkspaceMember[] = [
  {
    id: "user-owner-1",
    name: "Hoàng Mạnh Trường",
    email: "truong.hm@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Owner",
  },
  {
    id: "user-admin-2",
    name: "Nguyễn Văn An",
    email: "an.nv@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Admin",
  },
  {
    id: "user-admin-3",
    name: "Lê Thị Bích",
    email: "bich.lt@acme.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Admin",
  },
  {
    id: "user-member-4",
    name: "Phạm Minh Đức",
    email: "duc.pm@acme.com",
    avatarUrl: undefined,
    role: "Member",
  },
];

export const mockExportHistory: DataExportHistoryItem[] = [
  {
    id: "exp-1092",
    requestedAt: "25/09/2026 - 14:30",
    requestedBy: "Hoàng Mạnh Trường (Owner)",
    fileSize: "142.8 MB",
    status: "ready",
    downloadUrl: "#download-exp-1092",
    expiryDate: "02/10/2026",
  },
  {
    id: "exp-0841",
    requestedAt: "10/08/2026 - 09:15",
    requestedBy: "Nguyễn Văn An (Admin)",
    fileSize: "128.4 MB",
    status: "expired",
    downloadUrl: undefined,
    expiryDate: "17/08/2026",
  },
];

export const mockPresetLogos = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
];

export const reservedSubdomains = [
  "admin",
  "app",
  "api",
  "taskflow",
  "auth",
  "billing",
  "support",
  "google",
  "facebook",
  "stripe",
  "system",
];
