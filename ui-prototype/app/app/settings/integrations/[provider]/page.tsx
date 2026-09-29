 
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, Unplug, Save } from "lucide-react";

export default function IntegrationDetailPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = use(params);
  const [channel, setChannel] = useState("#proj-taskflow-updates");
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const providerName = provider.toUpperCase();

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/app/settings/integrations" className="text-xs font-semibold text-[var(--muted)] hover:underline flex items-center gap-1">
        <ArrowLeft size={14} /> Danh sách ứng dụng
      </Link>

      <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--ink)]">Cấu hình kết nối {providerName}</h1>
            <p className="text-xs text-[var(--muted)] mt-1">Trạng thái: Đã xác thực tài khoản tổ chức</p>
          </div>
          <span className="badge">Đang hoạt động</span>
        </div>

        {testSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} /> Gửi tin nhắn thử nghiệm tới {providerName} thành công!
          </div>
        )}

        <div className="space-y-4">
          <div className="field">
            <label htmlFor="notifChannel">Kênh nhận thông báo (Notification Channel / Webhook)</label>
            <input id="notifChannel" value={channel} onChange={(e) => setChannel(e.target.value)} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleTestConnection} disabled={testing} className="button secondary text-xs">
              <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
              {testing ? "Đang thử..." : "Gửi thử nghiệm"}
            </button>
            <button className="button primary text-xs">
              <Save size={14} /> Lưu cài đặt
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--line)] pt-6 flex justify-between items-center">
          <span className="text-xs text-[var(--muted)]">Hủy liên kết tài khoản {providerName} khỏi workspace</span>
          <button className="button danger text-xs">
            <Unplug size={14} /> Ngắt kết nối
          </button>
        </div>
      </div>
    </div>
  );
}
