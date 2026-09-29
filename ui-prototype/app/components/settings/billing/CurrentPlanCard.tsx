 
import React from "react";
import { Zap, Users, Calendar, ArrowUpRight, Sparkles, SlidersHorizontal, ShieldCheck } from "lucide-react";

interface CurrentPlanCardProps {
  currentPlanId: string;
  seatsUsed: number;
  seatsTotal: number;
  pricePerUser: number;
  nextRenewalDate: string;
  onOpenManageSeatsModal: () => void;
  onOpenPricingModal: () => void;
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  currentPlanId: _currentPlanId,
  seatsUsed,
  seatsTotal,
  pricePerUser,
  nextRenewalDate,
  onOpenManageSeatsModal,
  onOpenPricingModal,
}) => {
  const usagePercentage = Math.round((seatsUsed / seatsTotal) * 100);

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner & Main Information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              GÓI ĐANG KÍCH HOẠT: PRO TIER
            </span>
            <span className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-semibold">
              HÀNG THÁNG
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-3">
            <span>Pro Tier Plan</span>
            <span className="text-base font-normal text-zinc-400 font-mono">
              (${pricePerUser}/user/tháng)
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Ngày gia hạn tự động tiếp theo: <strong className="text-zinc-200">{nextRenewalDate}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Bao gồm toàn bộ tính năng Pro & Bắt buộc MFA
            </span>
          </div>
        </div>

        {/* Upgrade CTA Button */}
        <button
          type="button"
          onClick={onOpenPricingModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5 shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-zinc-950" />
          <span>Nâng cấp Enterprise</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Seats Usage Progress Bar Box */}
      <div className="pt-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-zinc-100">Số lượng ghế người dùng (Seats Usage)</span>
            <span className="text-zinc-400 text-[11px]">(Đã cấp quyền truy cập)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {seatsUsed} / {seatsTotal} Seats <span className="text-zinc-400 text-xs font-normal">({usagePercentage}%)</span>
            </span>

            <button
              type="button"
              onClick={onOpenManageSeatsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thêm / Bớt Ghế</span>
            </button>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-3 w-full rounded-full bg-zinc-950 border border-zinc-800 p-0.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-500 shadow-sm"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
          <span>{seatsUsed} ghế đang hoạt động</span>
          <span>Còn trống {seatsTotal - seatsUsed} ghế chưa phân bổ</span>
        </div>
      </div>
    </div>
  );
};
