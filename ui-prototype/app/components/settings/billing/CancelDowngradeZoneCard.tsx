 
import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface CancelDowngradeZoneCardProps {
  onOpenCancelModal: () => void;
}

export const CancelDowngradeZoneCard: React.FC<CancelDowngradeZoneCardProps> = ({
  onOpenCancelModal,
}) => {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-950/10 p-6 shadow-xl space-y-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
        <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-red-400">Khối 5: Hủy gói & Hạ cấp (Downgrade Zone)</h2>
          <p className="text-xs text-red-300/70">
            Tùy chọn dừng gia hạn tự động hoặc quay trở lại gói Starter Free cuối kỳ hạn.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Hủy tự động gia hạn gói Pro Tier</span>
          </div>
          <p className="text-xs text-zinc-400">
            Dịch vụ Pro Tier của bạn sẽ tiếp tục hoạt động cho đến hết chu kỳ thanh toán hiện tại mà không phát sinh thêm chi phí.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCancelModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-400 font-semibold text-xs transition shrink-0"
        >
          <span>Hủy đăng ký gói Pro</span>
        </button>
      </div>
    </div>
  );
};
