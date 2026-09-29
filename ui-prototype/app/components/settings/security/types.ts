export interface PasswordChecklist {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Rất yếu" | "Yếu" | "Trung bình" | "Mạnh" | "Tuyệt vời";
  color: string;
  checks: PasswordChecklist;
}

export interface TwoFactorConfig {
  enabled: boolean;
  method: "totp" | "email_sms";
  secretKey: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface ConnectedAccount {
  id: string;
  provider: "google" | "github" | "microsoft";
  providerName: string;
  email: string;
  connected: boolean;
  connectedAt?: string;
}

export interface ActiveSessionItem {
  id: string;
  deviceType: "desktop" | "laptop" | "mobile";
  browserName: string;
  osName: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface SecurityLogItem {
  id: string;
  event: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  status: "success" | "failed";
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
