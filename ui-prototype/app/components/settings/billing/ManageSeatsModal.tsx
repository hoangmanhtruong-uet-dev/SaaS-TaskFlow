 
import React, { useState } from "react";
import { X, Users, Plus, Minus, Calculator, Check } from "lucide-react";

interface ManageSeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatsUsed: number;
  seatsTotal: number;
  pricePerSeatMonthly: number;
  daysRemainingInCycle: number;
  calculateProratedAmount: (additionalSeats: number) => number;
  onConfirmUpdateSeats: (newSeatsTotal: number) => void;
}

export const ManageSeatsModal: React.FC<ManageSeatsModalProps> = ({
  isOpen,
  onClose,
  seatsUsed,
  seatsTotal,
  daysRemainingInCycle,
  calculateProratedAmount,
  onConfirmUpdateSeats,
}) => {
  const [newTotal, setNewTotal] = useState<number>(seatsTotal);

  if (!isOpen) return null;

  const additionalSeats = Math.max(0, newTotal - seatsTotal);
  const proratedCost = calculateProratedAmount(additionalSeats);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Users className="w-5 h-5" />
            <h3 className="text-lg font-bold text-zinc-100">Điều chỉnh Số lượng Ghế (Seats)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Seats Usage Overview */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="block text-zinc-400">Ghế đang sử dụng:</span>
            <span className="block text-sm font-bold text-emerald-400 font-mono">{seatsUsed} Seats</span>
          </div>
          <div className="text-right">
            <span className="block text-zinc-400">Hạn mức hiện tại:</span>
            <span className="block text-sm font-bold text-zinc-100 font-mono">{seatsTotal} Seats</span>
          </div>
        </div>

        {/* Seat Counter Control */}
        <div className="space-y-3">
          <div className="block text-xs font-semibold text-zinc-300 text-center">
            Lựa chọn Tổng số ghế người dùng mới:
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={newTotal <= seatsUsed}
              onClick={() => setNewTotal((prev) => Math.max(seatsUsed, prev - 1))}
              className="w-12 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 disabled:opacity-30 transition font-bold"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="w-28 text-center bg-zinc-900 border border-emerald-500/50 rounded-2xl py-2 shadow-inner">
              <span className="text-2xl font-black font-mono text-emerald-400">{newTotal}</span>
              <span className="block text-[10px] text-zinc-400 uppercase font-semibold">SEATS</span>
            </div>

            <button
              type="button"
              onClick={() => setNewTotal((prev) => prev + 1)}
              className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition font-bold shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="range"
              min={seatsUsed}
              max="100"
              value={newTotal}
              onChange={(e) => setNewTotal(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Prorated Calculation Breakdown Box */}
        {additionalSeats > 0 && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Tính toán Phí chênh lệch (Prorated Calculator):</span>
            </div>
            <div className="space-y-1 text-zinc-300 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>Số ghế mua thêm:</span>
                <span className="font-bold text-white">+{additionalSeats} Seats</span>
              </div>
              <div className="flex justify-between">
                <span>Số ngày còn lại trong chu kỳ:</span>
                <span>{daysRemainingInCycle} / 30 ngày</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-indigo-500/20 text-xs font-bold text-emerald-400">
                <span>Thanh toán bổ sung ngay:</span>
                <span>${proratedCost.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        )}

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
            type="button"
            onClick={() => onConfirmUpdateSeats(newTotal)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
          >
            <Check className="w-4 h-4" />
            <span>Xác nhận Cập nhật ({newTotal} Seats)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
