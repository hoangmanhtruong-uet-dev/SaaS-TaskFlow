 
import React from "react";
import { CheckCircle2, Settings, Loader2, ArrowRight, Plug } from "lucide-react";
import { IntegrationApp } from "./types";

interface IntegrationGridCardsProps {
  apps: IntegrationApp[];
  connectingAppId: string | null;
  onConnectApp: (appId: string) => void;
  onOpenConfigModal: (appId: string) => void;
  onToggleSwitch: (appId: string, enabled: boolean) => void;
}

export const IntegrationGridCards: React.FC<IntegrationGridCardsProps> = ({
  apps,
  connectingAppId,
  onConnectApp,
  onOpenConfigModal,
  onToggleSwitch,
}) => {
  if (apps.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
        <Plug className="w-8 h-8 text-zinc-600 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-300">Không tìm thấy ứng dụng tích hợp phù hợp</h3>
        <p className="text-xs text-zinc-500">
          Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục &quot;Tất cả ứng dụng&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {apps.map((app) => {
        const isConnecting = connectingAppId === app.id;

        return (
          <div
            key={app.id}
            className={`p-5 rounded-2xl border bg-zinc-900/70 flex flex-col justify-between space-y-4 backdrop-blur-sm transition duration-200 hover:border-zinc-700 shadow-xl ${
              app.isConnected ? "border-zinc-800" : "border-zinc-800/60 opacity-90"
            }`}
          >
            <div className="space-y-3">
              {/* Header: App Logo & Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center p-2 shadow-inner ${app.iconBg}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{app.name}</h3>
                    <span className="text-[10px] text-zinc-400 capitalize">
                      {app.category.replace("_", " & ")}
                    </span>
                  </div>
                </div>

                {/* Connection Status Badge */}
                {app.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    ĐÃ KẾT NỐI
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-medium">
                    CHƯA KẾT NỐI
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                {app.description}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              {/* Toggle Switch (Only if connected) */}
              {app.isConnected ? (
                <div className="flex items-center gap-2">
                  <label aria-label={`Bật/tắt ${app.name}`} className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={app.isEnabled}
                      onChange={(e) => onToggleSwitch(app.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {app.isEnabled ? "Bật" : "Tắt"}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-zinc-500 italic">OAuth2 Ready</span>
              )}

              {/* Connect / Config Button */}
              {app.isConnected ? (
                <button
                  type="button"
                  onClick={() => onOpenConfigModal(app.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Cấu hình</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onConnectApp(app.id)}
                  disabled={isConnecting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 disabled:opacity-50 transition"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Kết nối...</span>
                    </>
                  ) : (
                    <>
                      <span>Kết nối ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
