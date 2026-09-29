 
import React, { useState } from "react";
import { X, Check, Sparkles, ArrowRight } from "lucide-react";
import { mockPricingTiers } from "./constants";
import { BillingCycle } from "./types";

interface PricingComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: string;
  onSelectTier: (tierId: "starter" | "pro" | "enterprise") => void;
}

export const PricingComparisonModal: React.FC<PricingComparisonModalProps> = ({
  isOpen,
  onClose,
  currentPlanId,
  onSelectTier,
}) => {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Nâng cấp & So sánh Các Gói cước TaskFlow</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Lựa chọn giải pháp phù hợp với quy mô tăng trưởng của tổ chức bạn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Switch Bar */}
        <div className="flex justify-center">
          <div className="flex items-center p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                cycle === "monthly" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Thanh toán Hàng tháng
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition ${
                cycle === "yearly" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Thanh toán Hàng năm</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPricingTiers.map((tier) => {
            const isCurrent = currentPlanId === tier.id;
            const price = cycle === "yearly" ? tier.yearlyPricePerUser : tier.monthlyPricePerUser;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between space-y-6 relative transition duration-200 hover:border-zinc-700 shadow-xl ${
                  tier.isRecommended
                    ? "bg-gradient-to-b from-zinc-900 via-zinc-900 to-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : "bg-zinc-900/60 border-zinc-800"
                }`}
              >
                {/* Recommended Badge */}
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 font-black text-[10px] tracking-wider uppercase shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name & Price */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-zinc-100">{tier.name}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[32px]">
                      {tier.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-3xl font-black text-zinc-100 font-mono">
                        ${price}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono"> / user / tháng</span>
                      {cycle === "yearly" && price > 0 && (
                        <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                          Thanh toán 1 lần theo năm (${price * 12}/user/năm)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-4 border-t border-zinc-800">
                    <span className="block text-xs font-semibold text-zinc-300">
                      Tính năng bao gồm:
                    </span>
                    <ul className="space-y-2 text-xs">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              feat.included ? "text-emerald-400" : "text-zinc-600"
                            }`}
                          />
                          <span
                            className={feat.included ? "text-zinc-200 font-medium" : "text-zinc-600 line-through"}
                          >
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div>
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700 cursor-default text-center"
                    >
                      Gói Đang Sử Dụng
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectTier(tier.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg ${
                        tier.isRecommended
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                      }`}
                    >
                      <span>Chọn {tier.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
