 
import React from "react";
import { Save, RotateCcw, Loader2, AlertCircle } from "lucide-react";

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl animate-in slide-in-from-bottom-6 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/95 border border-indigo-500/50 shadow-2xl shadow-indigo-950/80 backdrop-blur-md">
        {/* Left Notice */}
        <div className="flex items-center gap-3 text-zinc-200">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <AlertCircle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="block text-xs font-bold text-zinc-100">
              Bạn đã thay đổi Ma trận Phân quyền!
            </span>
            <span className="block text-[11px] text-zinc-400">
              Hãy bấm &ldquo;Lưu ma trận phân quyền&rdquo; để áp dụng quy tắc truy cập mới cho nhân sự.
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/80 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hủy bỏ</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang cập nhật ma trận...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu ma trận phân quyền</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
