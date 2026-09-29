"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plan] = useState({ name: "Pro Tier (25 Seats)", price: "$144.00", cycle: "Monthly" });

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/checkout/success");
    }, 1500);
  };

  return (
    <div className="marketing min-h-screen p-6 bg-[var(--surface)]">
      <div className="max-w-4xl mx-auto py-10">
        <div className="mb-8 text-center">
          <span className="badge">THANH TOÁN AN TOÀN STRIPE</span>
          <h1 className="text-3xl font-extrabold text-[var(--ink)] mt-2">Hoàn tất nâng cấp gói Workspace</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Chi tiết đơn hàng</h2>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-4">
                <div>
                  <div className="font-bold text-base text-[var(--ink)]">{plan.name}</div>
                  <div className="text-xs text-[var(--muted)]">Chu kỳ thanh toán: {plan.cycle}</div>
                </div>
                <div className="text-xl font-extrabold text-[var(--primary)]">{plan.price}</div>
              </div>

              <ul className="space-y-3 text-xs text-[var(--muted)]">
                <li className="flex items-center gap-2 text-[var(--ink)] font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Không giới hạn dự án và công việc
                </li>
                <li className="flex items-center gap-2 text-[var(--ink)] font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Tích hợp Slack, GitHub, Jira
                </li>
                <li className="flex items-center gap-2 text-[var(--ink)] font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Báo cáo Analytics chuyên sâu
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--line)] flex items-center gap-2 text-xs text-[var(--muted)]">
              <ShieldCheck size={16} className="text-[var(--primary)]" />
              <span>Thanh toán mã hóa 256-bit SSL bảo mật tuyệt đối.</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePay} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-[var(--primary)]" /> Thông tin thẻ ngân hàng
            </h2>

            <div className="field">
              <label htmlFor="card-number">Số thẻ (Card Number)</label>
              <input id="card-number" placeholder="4242 •••• •••• 4242" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label htmlFor="card-expiry">Ngày hết hạn</label>
                <input id="card-expiry" placeholder="MM/YY" required />
              </div>
              <div className="field">
                <label htmlFor="card-cvc">Mã CVC</label>
                <input id="card-cvc" placeholder="123" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="cardholder-name">Tên chủ thẻ</label>
              <input id="cardholder-name" placeholder="NGUYEN VAN A" required />
            </div>

            <button type="submit" disabled={loading} className="button primary w-full text-base py-3 mt-4">
              <Lock size={18} /> {loading ? "Đang xử lý..." : `Thanh toán ${plan.price}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
