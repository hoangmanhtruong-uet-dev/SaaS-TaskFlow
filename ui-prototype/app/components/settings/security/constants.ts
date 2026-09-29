import {
  TwoFactorConfig,
  ConnectedAccount,
  ActiveSessionItem,
  SecurityLogItem,
} from "./types";

export const MOCK_2FA_CONFIG: TwoFactorConfig = {
  enabled: true,
  method: "totp",
  secretKey: "JBSW Y3DP EHPK 3PXP",
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/TaskFlow:hoangmanhtruong@taskflow.io?secret=JBSWY3DPEHPK3PXP&issuer=TaskFlow",
  backupCodes: [
    "A82F-91K2",
    "4B7C-12D9",
    "99X2-M3P1",
    "77L4-00Z8",
    "51A9-33V2",
    "12Q8-44R7",
    "88M2-66Y1",
    "33C9-22B4",
    "66D1-88E5",
    "21H9-99J3",
  ],
};

export const MOCK_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: "sso-1",
    provider: "google",
    providerName: "Google Account",
    email: "hoangmanhtruong.uet@gmail.com",
    connected: true,
    connectedAt: "10/01/2026",
  },
  {
    id: "sso-2",
    provider: "github",
    providerName: "GitHub Identity",
    email: "hoangmanhtruong-uet-dev",
    connected: true,
    connectedAt: "15/01/2026",
  },
  {
    id: "sso-3",
    provider: "microsoft",
    providerName: "Microsoft 365 Enterprise",
    email: "Chưa kết nối",
    connected: false,
  },
];

export const MOCK_ACTIVE_SESSIONS: ActiveSessionItem[] = [
  {
    id: "sess-1",
    deviceType: "desktop",
    browserName: "Chrome 128.0",
    osName: "Windows 11 Pro",
    ipAddress: "113.190.45.12",
    location: "Hà Nội, Vietnam",
    isCurrent: true,
    lastActive: "Vừa xong (Phiên đang chọn)",
  },
  {
    id: "sess-2",
    deviceType: "laptop",
    browserName: "Safari 17.4",
    osName: "macOS Sonoma 14.5",
    ipAddress: "14.232.18.99",
    location: "TP. Hồ Chí Minh, Vietnam",
    isCurrent: false,
    lastActive: "2 giờ trước",
  },
  {
    id: "sess-3",
    deviceType: "mobile",
    browserName: "TaskFlow Native App",
    osName: "iOS 18.1 (iPhone 15 Pro)",
    ipAddress: "27.72.102.5",
    location: "Đà Nẵng, Vietnam",
    isCurrent: false,
    lastActive: "1 ngày trước",
  },
];

export const MOCK_SECURITY_LOGS: SecurityLogItem[] = [
  {
    id: "log-1",
    event: "Cập nhật mật khẩu tài khoản thành công",
    timestamp: "25/09/2026 14:30:15",
    ipAddress: "113.190.45.12",
    location: "Hà Nội, Vietnam",
    device: "Chrome / Windows 11",
    status: "success",
  },
  {
    id: "log-2",
    event: "Kích hoạt Xác thực 2 yếu tố Authenticator App (TOTP)",
    timestamp: "24/09/2026 09:15:00",
    ipAddress: "113.190.45.12",
    location: "Hà Nội, Vietnam",
    device: "Chrome / Windows 11",
    status: "success",
  },
  {
    id: "log-3",
    event: "Thử đăng nhập thất bại (Sai mật khẩu)",
    timestamp: "22/09/2026 21:04:33",
    ipAddress: "42.115.89.201",
    location: "Hải Phòng, Vietnam",
    device: "Unknown Browser",
    status: "failed",
  },
  {
    id: "log-4",
    event: "Đăng nhập thành công từ địa chỉ IP mới",
    timestamp: "20/09/2026 11:20:45",
    ipAddress: "14.232.18.99",
    location: "TP. Hồ Chí Minh, Vietnam",
    device: "Safari / macOS",
    status: "success",
  },
  {
    id: "log-5",
    event: "Thu hồi tất cả phiên đăng nhập khác",
    timestamp: "18/09/2026 18:00:10",
    ipAddress: "113.190.45.12",
    location: "Hà Nội, Vietnam",
    device: "Chrome / Windows 11",
    status: "success",
  },
];
