 
"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CancelSubscriptionPage() {
  const [, setReason] = useState("");
  const [cancelled, setCancelled] = useState(false);

  const handleConfirmCancel = () => {
    setCancelled(true);
  };

  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-white p-8 shadow-xl">
        {!cancelled ? (
          <>
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertTriangle size={28} />
              <h1 className="text-xl font-bold text-[var(--ink)]">Hủy đăng ký gói Pro?</h1>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
              Bạn vẫn có thể tiếp tục sử dụng tất cả tính năng Pro cho đến hết chu kỳ hiện tại (28/10/2026). Sau đó Workspace sẽ tự động chuyển về gói Free.
            </p>

            <div className="space-y-4 mb-6">
              <p className="text-xs font-bold text-[var(--ink)]">Vui lòng chọn lý do hủy gói:</p>
              {[
                "Chi phí cao hơn ngân sách đội nhóm",
                "Thiếu tính năng cần thiết",
                "Chuyển sang công cụ khác",
                "Không còn nhu cầu sử dụng",
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs text-[var(--ink)] cursor-pointer">
                  <input type="radio" name="reason" value={item} onChange={(e) => setReason(e.target.value)} />
                  {item}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
              <Link href="/app/settings/billing" className="button primary text-xs">
                Giữ lại gói Pro
              </Link>
              <button onClick={handleConfirmCancel} className="button danger text-xs">
                Xác nhận Hủy gói
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
            <h2 className="text-xl font-bold text-[var(--ink)] mb-2">Đã xác nhận hủy đăng ký</h2>
            <p className="text-xs text-[var(--muted)] mb-6">
              Gói dịch vụ của bạn sẽ hết hạn vào 28/10/2026. Bạn có thể gia hạn lại bất cứ lúc nào.
            </p>
            <Link href="/app" className="button primary w-full text-xs">
              <ArrowLeft size={14} /> Quay lại Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
