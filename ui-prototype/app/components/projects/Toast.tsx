"use client";

import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface ToastProps {
  toast: { message: string; type: "success" | "info" | "error" } | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    error: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  };

  const borders = {
    success: "border-emerald-500/40 bg-zinc-950/95 text-emerald-300",
    info: "border-blue-500/40 bg-zinc-950/95 text-blue-300",
    error: "border-rose-500/40 bg-zinc-950/95 text-rose-300",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold backdrop-blur-md ${
          borders[toast.type]
        }`}
      >
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
