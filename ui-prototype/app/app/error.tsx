"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry captures this automatically via instrumentation
    console.error("[AppError boundary]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center space-y-5">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-950/50 border border-red-900/40">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-100 mb-1">Đã xảy ra lỗi</h1>
          <p className="text-sm text-zinc-400">
            Có lỗi không mong muốn. Đội ngũ kỹ thuật đã được thông báo tự động.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-600 mt-2 font-mono">ID: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    </div>
  );
}
