"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useBillingManager } from "./useBillingManager";
import { BillingHeaderNav } from "./BillingHeaderNav";
import { CurrentPlanCard } from "./CurrentPlanCard";
import { PricingComparisonModal } from "./PricingComparisonModal";
import { ManageSeatsModal } from "./ManageSeatsModal";
import { PaymentMethodBillingAddressCard } from "./PaymentMethodBillingAddressCard";
import { InvoicesHistoryCard } from "./InvoicesHistoryCard";
import { CancelDowngradeZoneCard } from "./CancelDowngradeZoneCard";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";

export const BillingContainer: React.FC = () => {
  const {
    currentPlanId,
    seatsUsed,
    seatsTotal,
    pricePerSeatMonthly,
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
    // Actions
    calculateProratedAmount,
    handleUpdateSeatsTotal,
    handleUpdatePaymentMethod,
    handleUpdateBillingAddress,
    handleSelectPlanTier,
    handleDownloadInvoicePdf,
    handleConfirmCancelSubscription,
  } = useBillingManager();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative pb-28">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : toast.type === "error"
              ? "bg-red-950 border-red-700 text-red-200"
              : "bg-indigo-950 border-indigo-700 text-indigo-200"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Navigation & Segmented Tabs */}
        <BillingHeaderNav />

        {/* Khối 1: Gói cước Hiện tại & Ghế người dùng */}
        <CurrentPlanCard
          currentPlanId={currentPlanId}
          seatsUsed={seatsUsed}
          seatsTotal={seatsTotal}
          pricePerUser={pricePerSeatMonthly}
          nextRenewalDate={nextRenewalDate}
          onOpenManageSeatsModal={() => setIsManageSeatsModalOpen(true)}
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
        />

        {/* Khối 3: Thẻ Thanh toán & Thông tin Xuất hóa đơn VAT */}
        <PaymentMethodBillingAddressCard
          paymentMethod={paymentMethod}
          billingAddress={billingAddress}
          isUpdateCardModalOpen={isUpdateCardModalOpen}
          onOpenUpdateCardModal={() => setIsUpdateCardModalOpen(true)}
          onCloseUpdateCardModal={() => setIsUpdateCardModalOpen(false)}
          onSaveCard={handleUpdatePaymentMethod}
          onUpdateBillingAddress={handleUpdateBillingAddress}
        />

        {/* Khối 4: Lịch sử Hóa đơn */}
        <InvoicesHistoryCard
          invoices={invoices}
          onDownloadPdf={handleDownloadInvoicePdf}
        />

        {/* Khối 5: Hủy gói & Hạ cấp */}
        <CancelDowngradeZoneCard
          onOpenCancelModal={() => setIsCancelModalOpen(true)}
        />
      </div>

      {/* Khối 2: Bảng So sánh & Nâng cấp Gói cước Modal */}
      <PricingComparisonModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentPlanId={currentPlanId}
        onSelectTier={handleSelectPlanTier}
      />

      {/* Modal Điều chỉnh Ghế (Prorated Calculator) */}
      <ManageSeatsModal
        isOpen={isManageSeatsModalOpen}
        onClose={() => setIsManageSeatsModalOpen(false)}
        seatsUsed={seatsUsed}
        seatsTotal={seatsTotal}
        pricePerSeatMonthly={pricePerSeatMonthly}
        daysRemainingInCycle={daysRemainingInCycle}
        calculateProratedAmount={calculateProratedAmount}
        onConfirmUpdateSeats={handleUpdateSeatsTotal}
      />

      {/* Modal Hủy Đăng ký Gói */}
      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        nextRenewalDate={nextRenewalDate}
        onConfirmCancel={handleConfirmCancelSubscription}
      />
    </div>
  );
};
