export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  id: "starter" | "pro" | "enterprise";
  name: string;
  badge?: string;
  monthlyPricePerUser: number;
  yearlyPricePerUser: number; // Discounted e.g. $10 vs $12
  description: string;
  isRecommended?: boolean;
  features: PlanFeature[];
}

export interface PaymentMethod {
  id: string;
  brand: "VISA" | "Mastercard" | "AMEX";
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
  isDefault: boolean;
}

export interface BillingAddress {
  companyName: string;
  taxId: string; // Mã số thuế VAT
  email: string;
  address: string;
  city: string;
  country: string;
}

export interface InvoiceItem {
  id: string; // e.g. "INV-2026-009"
  date: string;
  amount: string;
  seatsCount: number;
  cycle: string;
  status: "paid" | "pending" | "failed";
  downloadPdfUrl?: string;
}

export interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
