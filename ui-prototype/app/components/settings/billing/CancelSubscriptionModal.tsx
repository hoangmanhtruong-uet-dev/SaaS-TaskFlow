 
import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextRenewalDate: string;
  onConfirmCancel: (reason: string) => void;
}

const cancelReasons = [
  "Chi phí quá cao so với nhu cầu hiện tại",
  "Chuyển sang sử dụng công cụ khác",
  "Thiếu các tính năng cần thiết",
  "Dự án công ty đã hoàn thành / kết thúc",
  "Lý do khác",
];

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  nextRenewalDate,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(cancelReasons[0]);
  const [otherText, setOtherText] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmCancel(selectedReason === "Lý do khác" ? otherText : selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-red-500/40 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
          <div className="flex items-center gap-2.5 text-red-500">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-bold text-red-400">Hủy đăng ký gói Pro Tier</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Feature Locks Banner */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-red-400">
            <ShieldAlert className="w-4 h-4" /> Cảnh báo khi chuyển về gói Starter Free:
          </div>
          <ul className="space-y-1 list-disc list-inside text-[11px] text-red-300/80">
            <li>Giới hạn tối đa 5 thành viên (20 thành viên thừa sẽ bị khóa tạm thời).</li>
            <li>Vô hiệu hóa toàn bộ tích hợp Slack, GitHub, Jira & Outgoing Webhooks.</li>
            <li>Tắt chính sách Bắt buộc 2FA/MFA và thu hồi dung lượng 100 GB.</li>
          </ul>
        </div>

        {/* Cancellation Reason Survey */}
        <div className="space-y-3">
          <div className="block text-xs font-semibold text-zinc-300">
            Cho chúng tôi biết lý do bạn muốn hủy đăng ký:
          </div>

          <div className="space-y-2">
            {cancelReasons.map((r) => (
              <label
                key={r}
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                  selectedReason === r
                    ? "bg-red-500/10 border-red-500/40 text-zinc-100 font-semibold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <span>{r}</span>
                <input
                  type="radio"
                  name="cancelReason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="accent-red-500"
                />
              </label>
            ))}
          </div>

          {selectedReason === "Lý do khác" && (
            <textarea
              rows={2}
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Nhập chi tiết đóng góp ý kiến của bạn..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-red-500"
            />
          )}
        </div>

        {/* Renewal Expiry Information */}
        <p className="text-[11px] text-zinc-400 italic text-center">
          * Gói Pro của bạn vẫn được duy trì đầy đủ tính năng cho đến hết ngày <strong>{nextRenewalDate}</strong>.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Giữ lại gói Pro
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition"
          >
            <span>Xác nhận Hủy vào cuối kỳ hạn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
