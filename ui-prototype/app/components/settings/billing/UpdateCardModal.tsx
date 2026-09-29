 
import React, { useState } from "react";
import { X, CreditCard, Lock, Check } from "lucide-react";

interface UpdateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (
    cardNumber: string,
    expMonth: number,
    expYear: number,
    cvc: string,
    holderName: string
  ) => boolean;
}

export const UpdateCardModal: React.FC<UpdateCardModalProps> = ({
  isOpen,
  onClose,
  onSaveCard,
}) => {
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expDate, setExpDate] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [holderName, setHolderName] = useState("HOANG MANH TRUONG");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = expDate.split("/");
    const expMonth = parseInt(parts[0]) || 12;
    const expYear = parseInt(`20${parts[1] || "28"}`) || 2028;

    onSaveCard(cardNumber, expMonth, expYear, cvc, holderName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5 text-blue-400">
            <CreditCard className="w-5 h-5" />
            <h3 className="text-lg font-bold text-zinc-100">Cập nhật Thẻ Thanh toán (Stripe Element)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cardholder Name */}
          <div className="space-y-1.5">
            <label htmlFor="update-cardholder" className="block text-xs font-semibold text-zinc-300">
              Tên chủ thẻ (Cardholder Name)
            </label>
            <input
              id="update-cardholder"
              type="text"
              required
              value={holderName}
              onChange={(e) => setHolderName(e.target.value.toUpperCase())}
              placeholder="HOANG MANH TRUONG"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono uppercase focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Card Number */}
          <div className="space-y-1.5">
            <label htmlFor="update-card-number" className="block text-xs font-semibold text-zinc-300">
              Số thẻ (Card Number)
            </label>
            <div className="relative">
              <input
                id="update-card-number"
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-blue-900 text-white font-black text-[10px]">
                VISA
              </div>
            </div>
          </div>

          {/* Expiry & CVC Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="update-card-expiry" className="block text-xs font-semibold text-zinc-300">Hạn thẻ (MM/YY)</label>
              <input
                id="update-card-expiry"
                type="text"
                required
                maxLength={5}
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                placeholder="12/28"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="update-card-cvc" className="block text-xs font-semibold text-zinc-300">CVC / CVV</label>
              <input
                id="update-card-cvc"
                type="password"
                required
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Thông tin thẻ được mã hóa bảo mật 256-bit SSL qua Stripe.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thẻ Thanh toán</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
