export interface WorkspaceSecurityPolicy {
  require2FA: boolean;
  allowPublicLinkSharing: boolean;
  restrictProjectCreationToAdmin: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelistEnabled: boolean;
}

export interface DnsRecordItem {
  id: string;
  type: "CNAME" | "A" | "TXT";
  host: string;
  target: string;
  ttl: string;
  status: "verified" | "pending" | "failed";
}

export interface CustomDomainConfig {
  domain: string;
  isVerified: boolean;
  cnameRecord: DnsRecordItem;
  lastCheckedAt?: string;
}

export interface DataExportHistoryItem {
  id: string;
  requestedAt: string;
  requestedBy: string;
  fileSize: string;
  status: "ready" | "processing" | "expired";
  downloadUrl?: string;
  expiryDate: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "Owner" | "Admin" | "Member";
}

export interface WorkspaceSettingsForm {
  // Khối 1: Nhận diện thương hiệu
  name: string;
  description: string;
  industry: string;
  brandColor: string;
  logoUrl: string | null;

  // Khối 2: Tên miền
  subdomain: string;
  customDomain: CustomDomainConfig;

  // Khối 3: Mặc định & Múi giờ
  timezone: string;
  allowedEmailDomains: string[];
  currency: string;
  language: string;
  dateFormat: string;

  // Khối 4: Bảo mật
  securityPolicy: WorkspaceSecurityPolicy;

  // Khối 6: Quyền sở hữu
  ownerId: string;
  status: "active" | "frozen" | "deleted";
}

export type SubdomainStatus = "checking" | "available" | "taken" | "invalid";

export interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
