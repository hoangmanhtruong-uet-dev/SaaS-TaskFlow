import { useState, useCallback } from "react";
import {
  BillingCycle,
  PaymentMethod,
  BillingAddress,
  InvoiceItem,
  ToastNotice,
} from "./types";
import {
  initialPaymentMethod,
  initialBillingAddress,
  initialInvoices,
} from "./constants";

export function useBillingManager() {
  // Current Active Plan & Seats State
  const [currentPlanId, setCurrentPlanId] = useState<"starter" | "pro" | "enterprise">("pro");
  const [seatsUsed, _setSeatsUsed] = useState<number>(12);
  const [seatsTotal, setSeatsTotal] = useState<number>(25);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [nextRenewalDate, _setNextRenewalDate] = useState<string>("28/10/2026");

  // Payment Method & Corporate Billing Address
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [billingAddress, setBillingAddress] = useState<BillingAddress>(initialBillingAddress);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);

  // Modals States
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isManageSeatsModalOpen, setIsManageSeatsModalOpen] = useState(false);
  const [isUpdateCardModalOpen, setIsUpdateCardModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Toast Helper
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now().toString();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 3500);
    },
    []
  );

  // 1. Prorated Seat Calculator Engine
  // Assuming 15 days remaining in current 30-day billing cycle
  const daysRemainingInCycle = 15;
  const totalDaysInCycle = 30;
  const pricePerSeatMonthly = currentPlanId === "pro" ? 12 : currentPlanId === "enterprise" ? 24 : 0;

  const calculateProratedAmount = (additionalSeats: number) => {
    if (additionalSeats <= 0) return 0;
    const proratedFactor = daysRemainingInCycle / totalDaysInCycle;
    const rawCost = additionalSeats * pricePerSeatMonthly * proratedFactor;
    return parseFloat(rawCost.toFixed(2));
  };

  const handleUpdateSeatsTotal = (newTotalSeats: number) => {
    if (newTotalSeats < seatsUsed) {
      showToast(`Không thể giảm số ghế xuống dưới số lượng đang sử dụng (${seatsUsed} ghế)!`, "error");
      return;
    }

    const addedSeats = newTotalSeats - seatsTotal;
    const proratedCost = calculateProratedAmount(addedSeats);

    setSeatsTotal(newTotalSeats);
    setIsManageSeatsModalOpen(false);

    if (addedSeats > 0) {
      // Create new prorated invoice item
      const newInv: InvoiceItem = {
        id: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleDateString("vi-VN"),
        amount: `$${proratedCost.toFixed(2)}`,
        seatsCount: newTotalSeats,
        cycle: `Bổ sung ${addedSeats} ghế (Prorated)`,
        status: "paid",
        downloadPdfUrl: "#pdf-download-new",
      };
      setInvoices((prev) => [newInv, ...prev]);
      showToast(
        `Đã cập nhật lên ${newTotalSeats} ghế! Đã tính phí chênh lệch (Prorated): $${proratedCost.toFixed(2)}`,
        "success"
      );
    } else {
      showToast(`Đã điều chỉnh tổng số ghế xuống ${newTotalSeats} Seats!`, "info");
    }
  };

  // 2. Stripe Card Validation & Update Logic
  const handleUpdatePaymentMethod = (
    cardNumber: string,
    expMonth: number,
    expYear: number,
    cvc: string,
    holderName: string
  ) => {
    const cleanNum = cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanNum)) {
      showToast("Số thẻ thanh toán không hợp lệ (Phải đúng 16 chữ số)!", "error");
      return false;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      showToast("Mã CVC/CVV không hợp lệ!", "error");
      return false;
    }

    const last4 = cleanNum.slice(-4);
    const brand = cleanNum.startsWith("4") ? "VISA" : "Mastercard";

    setPaymentMethod({
      id: `card-${Date.now()}`,
      brand,
      last4,
      expMonth,
      expYear,
      holderName: holderName.toUpperCase(),
      isDefault: true,
    });

    setIsUpdateCardModalOpen(false);
    showToast(`Đã cập nhật thành công Thẻ ${brand} •••• ${last4}!`, "success");
    return true;
  };

  // 3. Corporate VAT Billing Info Updater
  const handleUpdateBillingAddress = (updated: BillingAddress) => {
    setBillingAddress(updated);
    showToast("Đã lưu Thông tin Xuất Hóa đơn VAT Doanh nghiệp!", "success");
  };

  // 4. Plan Upgrade / Change Handler
  const handleSelectPlanTier = (planId: "starter" | "pro" | "enterprise") => {
    setCurrentPlanId(planId);
    setIsPricingModalOpen(false);
    showToast(`Đã chuyển đổi sang gói ${planId.toUpperCase()} thành công!`, "success");
  };

  // 5. PDF Invoice Download Simulation
  const handleDownloadInvoicePdf = (invoiceId: string) => {
    showToast(`Đang tải file PDF hóa đơn VAT ${invoiceId}.pdf...`, "info");
  };

  // 6. Cancel Subscription Handler
  const handleConfirmCancelSubscription = (_reason: string) => {
    setIsCancelModalOpen(false);
    showToast(
      `Đã ghi nhận yêu cầu hủy gói Pro. Tài khoản của bạn sẽ hoạt động đến hết ngày ${nextRenewalDate}.`,
      "info"
    );
  };

  return {
    currentPlanId,
    seatsUsed,
    seatsTotal,
    pricePerSeatMonthly,
    billingCycle,
    setBillingCycle,
    nextRenewalDate,
    paymentMethod,
    billingAddress,
    invoices,
    daysRemainingInCycle,
    // Modals
    isPricingModalOpen,
    setIsPricingModalOpen,
    isManageSeatsModalOpen,
    setIsManageSeatsModalOpen,
    isUpdateCardModalOpen,
    setIsUpdateCardModalOpen,
    isCancelModalOpen,
    setIsCancelModalOpen,
    toast,
    // Actions & Handlers
    calculateProratedAmount,
    handleUpdateSeatsTotal,
    handleUpdatePaymentMethod,
    handleUpdateBillingAddress,
    handleSelectPlanTier,
    handleDownloadInvoicePdf,
    handleConfirmCancelSubscription,
    showToast,
  };
}
