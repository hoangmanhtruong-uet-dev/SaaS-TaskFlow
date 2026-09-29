 
import React from "react";
import { Webhook, Plus, Send, Trash2, CheckCircle2, Loader2, Globe } from "lucide-react";
import { WebhookEndpoint } from "./types";

interface OutgoingWebhooksCardProps {
  webhooks: WebhookEndpoint[];
  testingWebhookId: string | null;
  onOpenCreateModal: () => void;
  onDeleteWebhook: (id: string) => void;
  onTestPing: (id: string) => void;
}

export const OutgoingWebhooksCard: React.FC<OutgoingWebhooksCardProps> = ({
  webhooks,
  testingWebhookId,
  onOpenCreateModal,
  onDeleteWebhook,
  onTestPing,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Khối 4: Quản lý Webhooks (Outgoing Webhooks Engine)
            </h2>
            <p className="text-xs text-zinc-400">
              Gửi dữ liệu sự kiện thời gian thực (Real-time Event Payload) đến Server riêng của doanh nghiệp.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Webhook mới</span>
        </button>
      </div>

      {/* Webhooks Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-3">Tên Endpoint & Target URL</th>
              <th className="p-3">Sự kiện Đăng ký</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Phản hồi lần cuối</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
            {webhooks.map((item) => {
              const isTesting = testingWebhookId === item.id;

              return (
                <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                  {/* Name & Target URL */}
                  <td className="p-3 space-y-0.5">
                    <div className="font-sans font-bold text-zinc-100 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono select-all">
                      {item.targetUrl}
                    </div>
                  </td>

                  {/* Registered Events Tags */}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {item.events.map((ev) => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-indigo-300"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-sans font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  </td>

                  {/* Last Trigger Response */}
                  <td className="p-3 space-y-0.5 text-[11px] font-sans">
                    {item.lastTriggeredAt ? (
                      <>
                        <div className="flex items-center gap-1 font-mono font-semibold text-emerald-400">
                          <span>HTTP {item.lastResponseStatus || 200} OK</span>
                          <span className="text-zinc-500 font-normal">({item.lastResponseTimeMs || 42}ms)</span>
                        </div>
                        <div className="text-zinc-500 text-[10px]">{item.lastTriggeredAt}</div>
                      </>
                    ) : (
                      <span className="text-zinc-500 italic">Chưa kích hoạt</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onTestPing(item.id)}
                        disabled={isTesting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans font-semibold border border-zinc-700 transition disabled:opacity-50"
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            <span>Sending Ping...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-blue-400" />
                            <span>Test Ping</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteWebhook(item.id)}
                        className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 transition"
                        title="Xóa Webhook Endpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {webhooks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-zinc-500 italic font-sans">
                  Chưa có Outgoing Webhook Endpoint nào được đăng ký.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
