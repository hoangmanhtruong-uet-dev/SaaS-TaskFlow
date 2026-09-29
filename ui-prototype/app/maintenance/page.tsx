 
"use client";

import { useState, useEffect } from "react";
import { Wrench, RefreshCw, Clock } from "lucide-react";

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="marketing min-h-screen flex items-center justify-center p-6 bg-[var(--surface)]">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] animate-pulse">
          <Wrench size={48} />
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--ink)]">Hệ thống đang bảo trì định kỳ</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Chúng tôi đang thực hiện nâng cấp cơ sở dữ liệu và hạ tầng để phục vụ bạn tốt hơn.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          <Clock size={18} /> Dự kiến hoàn tất sau: {formatTime(timeLeft)}
        </div>

        <div className="mt-8">
          <button onClick={() => window.location.reload()} className="button primary w-full">
            <RefreshCw size={18} /> Kiếm tra kết nối lại
          </button>
        </div>
      </div>
    </div>
  );
}
