import {
  PricingTier,
  PaymentMethod,
  BillingAddress,
  InvoiceItem,
} from "./types";

export const mockPricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter Free",
    monthlyPricePerUser: 0,
    yearlyPricePerUser: 0,
    description: "Miễn phí dành cho cá nhân hoặc nhóm nhỏ khởi tạo dự án.",
    features: [
      { text: "Tối đa 5 thành viên", included: true },
      { text: "3 Dự án không giới hạn Task", included: true },
      { text: "Dung lượng lưu trữ 1 GB", included: true },
      { text: "Giao diện Kanban Board cơ bản", included: true },
      { text: "Tích hợp Slack & Email", included: false },
      { text: "Báo cáo Analytics nâng cao", included: false },
      { text: "Bảo mật MFA & Audit Log", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Tier",
    badge: "Gói Đề Xuất",
    isRecommended: true,
    monthlyPricePerUser: 12,
    yearlyPricePerUser: 10, // 20% discount
    description: "Giải pháp toàn diện cho doanh nghiệp vừa và nhỏ cần tối ưu quy trình.",
    features: [
      { text: "Không giới hạn thành viên & ghế", included: true },
      { text: "Dự án & Gantt Chart không giới hạn", included: true },
      { text: "Dung lượng lưu trữ 100 GB", included: true },
      { text: "Custom Fields & Project Templates", included: true },
      { text: "Tích hợp Slack, GitHub, Jira & Zapier", included: true },
      { text: "Chính sách Bắt buộc 2FA/MFA", included: true },
      { text: "Hỗ trợ Kỹ thuật Ưu tiên 24/7", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Doanh Nghiệp",
    monthlyPricePerUser: 24,
    yearlyPricePerUser: 20,
    description: "Được thiết kế cho các tập đoàn lớn có yêu cầu khắt khe về bảo mật & SLA.",
    features: [
      { text: "Toàn bộ tính năng gói Pro Tier", included: true },
      { text: "Dung lượng lưu trữ 1 TB+", included: true },
      { text: "SSO (SAML, Okta, Azure AD)", included: true },
      { text: "Custom Domain & SSL riêng", included: true },
      { text: "Bản ghi Audit Log lưu trữ 365 ngày", included: true },
      { text: "Dedicated Customer Success Manager", included: true },
      { text: "Cam kết SLA 99.99% Uptime", included: true },
    ],
  },
];

export const initialPaymentMethod: PaymentMethod = {
  id: "card-9012",
  brand: "VISA",
  last4: "4242",
  expMonth: 12,
  expYear: 2028,
  holderName: "HOANG MANH TRUONG",
  isDefault: true,
};

export const initialBillingAddress: BillingAddress = {
  companyName: "CÔNG TY CỔ PHẦN ACME CORPORATION",
  taxId: "0108992120-001",
  email: "billing@acme.com",
  address: "Tầng 12, Tòa nhà Keangnam Landmark 72, Đường Phạm Hùng",
  city: "Quận Nam Từ Liêm, Hà Nội",
  country: "Việt Nam",
};

export const initialInvoices: InvoiceItem[] = [
  {
    id: "INV-2026-009",
    date: "28/08/2026",
    amount: "$144.00",
    seatsCount: 12,
    cycle: "Hàng tháng ($12/user)",
    status: "paid",
    downloadPdfUrl: "#pdf-inv-2026-009",
  },
  {
    id: "INV-2026-008",
    date: "28/07/2026",
    amount: "$144.00",
    seatsCount: 12,
    cycle: "Hàng tháng ($12/user)",
    status: "paid",
    downloadPdfUrl: "#pdf-inv-2026-008",
  },
  {
    id: "INV-2026-007",
    date: "28/06/2026",
    amount: "$120.00",
    seatsCount: 10,
    cycle: "Hàng tháng ($12/user)",
    status: "paid",
    downloadPdfUrl: "#pdf-inv-2026-007",
  },
];
