 
import React, { useState } from "react";
import { CreditCard, FileText, Check } from "lucide-react";
import { PaymentMethod, BillingAddress } from "./types";
import { UpdateCardModal } from "./UpdateCardModal";

interface PaymentMethodBillingAddressCardProps {
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  isUpdateCardModalOpen: boolean;
  onOpenUpdateCardModal: () => void;
  onCloseUpdateCardModal: () => void;
  onSaveCard: (
    cardNumber: string,
    expMonth: number,
    expYear: number,
    cvc: string,
    holderName: string
  ) => boolean;
  onUpdateBillingAddress: (address: BillingAddress) => void;
}

export const PaymentMethodBillingAddressCard: React.FC<PaymentMethodBillingAddressCardProps> = ({
  paymentMethod,
  billingAddress,
  isUpdateCardModalOpen,
  onOpenUpdateCardModal,
  onCloseUpdateCardModal,
  onSaveCard,
  onUpdateBillingAddress,
}) => {
  const [addressForm, setAddressForm] = useState<BillingAddress>(billingAddress);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBillingAddress(addressForm);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Credit Card Payment Method */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Thẻ Thanh toán (Payment Method)</h2>
              <p className="text-xs text-zinc-400">
                Thẻ ghi nợ / Tín dụng gia hạn tự động chu kỳ dịch vụ.
              </p>
            </div>
          </div>

          {/* Active Card Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-blue-900 text-white font-black text-xs tracking-widest shadow">
                {paymentMethod.brand}
              </div>
              <div>
                <div className="font-bold font-mono text-sm text-zinc-100 tracking-wider">
                  •••• •••• •••• {paymentMethod.last4}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Hạn thẻ: {paymentMethod.expMonth}/{paymentMethod.expYear.toString().slice(-2)} • {paymentMethod.holderName}
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase shrink-0">
              Mặc định
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenUpdateCardModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
          >
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Cập nhật Thẻ Thanh toán Mới</span>
          </button>
        </div>
      </div>

      {/* Right Column: Corporate Billing Address Form */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">Thông tin Xuất Hóa đơn VAT</h2>
            <p className="text-xs text-zinc-400">
              Tự động khởi tạo và gửi hóa đơn VAT điện tử mỗi kỳ thanh toán.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAddress} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="billing-company" className="block text-[11px] font-semibold text-zinc-300">Tên công ty / Tổ chức</label>
            <input
              id="billing-company"
              type="text"
              required
              value={addressForm.companyName}
              onChange={(e) => setAddressForm({ ...addressForm, companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="billing-tax-id" className="block text-[11px] font-semibold text-zinc-300">Mã số thuế (Tax ID)</label>
              <input
                  id="billing-tax-id"
                type="text"
                required
                value={addressForm.taxId}
                onChange={(e) => setAddressForm({ ...addressForm, taxId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="billing-email" className="block text-[11px] font-semibold text-zinc-300">Email nhận hóa đơn</label>
              <input
                  id="billing-email"
                type="email"
                required
                value={addressForm.email}
                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="billing-address" className="block text-[11px] font-semibold text-zinc-300">Địa chỉ ĐKKD</label>
            <input
              id="billing-address"
              type="text"
              required
              value={addressForm.address}
              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu thông tin hóa đơn</span>
            </button>
          </div>
        </form>
      </div>

      {/* Update Card Modal Trigger */}
      <UpdateCardModal
        isOpen={isUpdateCardModalOpen}
        onClose={onCloseUpdateCardModal}
        onSaveCard={onSaveCard}
      />
    </div>
  );
};
