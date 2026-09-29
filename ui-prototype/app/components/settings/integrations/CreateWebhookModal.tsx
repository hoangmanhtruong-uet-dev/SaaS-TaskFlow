 
import React, { useState } from "react";
import { X, Webhook, Plus, Check } from "lucide-react";
import { availableWebhookEvents } from "./constants";

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWebhook: (name: string, targetUrl: string, events: string[]) => void;
}

export const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({
  isOpen,
  onClose,
  onCreateWebhook,
}) => {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "task.created",
    "task.status_changed",
  ]);

  if (!isOpen) return null;

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetUrl.trim() || selectedEvents.length === 0) return;
    onCreateWebhook(name.trim(), targetUrl.trim(), selectedEvents);
    setName("");
    setTargetUrl("https://");
  };

  const samplePayloadJson = `{
  "event": "${selectedEvents[0] || "task.created"}",
  "timestamp": "${new Date().toISOString()}",
  "workspace_id": "ws_acmecorp_9021",
  "data": {
    "task_id": "TASK-881",
    "title": "Nâng cấp giao diện Workspace Settings",
    "status": "IN_PROGRESS",
    "assignee": "truong.hm@acme.com"
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Webhook className="w-5 h-5" />
            <h3 className="text-lg font-bold text-zinc-100">
              Đăng ký Outgoing Webhook Endpoint Mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Endpoint Name & Target URL */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="webhook-name" className="block text-xs font-semibold text-zinc-300">
                Tên mô tả Endpoint <span className="text-red-400">*</span>
              </label>
              <input
                id="webhook-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Production Event Dispatcher, Internal CI Listener..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="webhook-target-url" className="block text-xs font-semibold text-zinc-300">
                Target Payload URL (HTTP / HTTPS POST) <span className="text-red-400">*</span>
              </label>
              <input
                id="webhook-target-url"
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://api.yourcompany.com/webhooks/taskflow"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Event Subscriptions Checklist */}
          <div className="space-y-2">
            <div className="block text-xs font-semibold text-zinc-300">
              Đăng ký Các Sự kiện Kích hoạt (Event Subscriptions):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
              {availableWebhookEvents.map((ev) => {
                const isChecked = selectedEvents.includes(ev.id);
                return (
                  <button
                    type="button"
                    key={ev.id}
                    onClick={() => toggleEvent(ev.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                      isChecked
                        ? "bg-blue-500/10 border-blue-500/40 text-blue-200 font-medium"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span>{ev.label}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isChecked
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "border-zinc-700 bg-zinc-900"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample JSON Payload Preview */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-xs font-semibold text-zinc-400 font-mono">
              Mẫu JSON Payload (Sample Payload Preview):
            </span>
            <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {samplePayloadJson}
            </pre>
          </div>

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
              type="submit"
              disabled={!name.trim() || !targetUrl.trim() || selectedEvents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 disabled:opacity-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Webhook Endpoint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
