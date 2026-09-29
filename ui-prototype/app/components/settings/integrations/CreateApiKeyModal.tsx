 
import React, { useState } from "react";
import { X, KeyRound, Plus, Copy, Check, ShieldAlert } from "lucide-react";

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateKey: (name: string, scope: "read" | "read_write" | "admin") => void;
  createdRawKey: string | null;
  onClearRawKey: () => void;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onCreateKey,
  createdRawKey,
  onClearRawKey,
}) => {
  const [keyName, setKeyName] = useState("");
  const [scope, setScope] = useState<"read" | "read_write" | "admin">("read_write");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (createdRawKey) {
      navigator.clipboard.writeText(createdRawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    onCreateKey(keyName.trim(), scope);
    setKeyName("");
  };

  const handleDone = () => {
    onClearRawKey();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <KeyRound className="w-5 h-5" />
            <h3 className="text-lg font-bold text-zinc-100">
              {createdRawKey ? "Mã API Key Đã Được Khởi Tạo" : "Tạo Personal API Key Mới"}
            </h3>
          </div>
          <button
            onClick={createdRawKey ? handleDone : onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-TIME DISPLAY MODAL STEP */}
        {createdRawKey ? (
          <div className="space-y-5">
            {/* Warning Banner */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <ShieldAlert className="w-4 h-4" /> LƯU Ý BẢO MẬT QUAN TRỌNG:
              </div>
              <p>
                Mã API Secret Key này <strong>CHỈ HIỂN THỊ DUY NHẤT 01 LẦN NÀY</strong>. Hãy sao chép và lưu trữ ở nơi an toàn. Bạn sẽ không thể xem lại mã đầy đủ sau khi đóng cửa sổ này.
              </p>
            </div>

            {/* Secret Key Display Box */}
            <div className="space-y-1.5">
              <div className="block text-xs font-semibold text-zinc-300">Mã API Secret Key:</div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-400 font-bold select-all break-all">
                <span>{createdRawKey}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shrink-0 ml-2 transition text-xs font-sans font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleDone}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                Đã Lưu Mã API Key & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR CREATE FORM STEP */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="api-key-name" className="block text-xs font-semibold text-zinc-300">
                Tên gợi nhớ API Key <span className="text-red-400">*</span>
              </label>
              <input
                id="api-key-name"
                type="text"
                required
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="VD: Zapier Integration Key, Mobile App Prod Key..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="api-key-scope" className="block text-xs font-semibold text-zinc-300">
                Phạm vi Quyền hạn (Scope)
              </label>
              <select
                id="api-key-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as "read" | "read_write" | "admin")}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="read_write">Read & Write (Đọc và Ghi dữ liệu Task/Project)</option>
                <option value="read">Read Only (Chỉ xem và truy vấn dữ liệu)</option>
                <option value="admin">Full Admin Access (Quyền quản trị cao nhất)</option>
              </select>
            </div>

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
                disabled={!keyName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 disabled:opacity-50 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Cấp phát API Key</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
