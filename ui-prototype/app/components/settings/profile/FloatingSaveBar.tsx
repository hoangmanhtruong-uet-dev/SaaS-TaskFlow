 
"use client";

import React from "react";
import { AlertCircle, RotateCcw, Save, Loader2 } from "lucide-react";

interface FloatingSaveBarProps {
  isDirty: boolean;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
}

export const FloatingSaveBar: React.FC<FloatingSaveBarProps> = ({
  isDirty,
  saving,
  onReset,
  onSave,
}) => {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-zinc-900/95 backdrop-blur-lg border border-amber-500/50 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0">
          <AlertCircle className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-zinc-100">
            Bạn có thay đổi chưa được lưu!
          </h4>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            Vui lòng nhấn &ldquo;Lưu thay đổi&rdquo; để áp dụng các thiết lập mới trên hồ sơ của bạn.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hủy bỏ</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi ngay</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
