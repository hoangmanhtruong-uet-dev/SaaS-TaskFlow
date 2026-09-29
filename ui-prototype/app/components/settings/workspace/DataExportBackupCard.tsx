 
import React from "react";
import { Download, FileArchive, History, Loader2, CheckCircle2, Clock, Calendar, User } from "lucide-react";
import { DataExportHistoryItem } from "./types";

interface DataExportBackupCardProps {
  exportHistory: DataExportHistoryItem[];
  isExporting: boolean;
  onTriggerExport: () => void;
}

export const DataExportBackupCard: React.FC<DataExportBackupCardProps> = ({
  exportHistory,
  isExporting,
  onTriggerExport,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
          <FileArchive className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">
            Khối 5: Xuất dữ liệu & Sao lưu (Data Export & Backup)
          </h2>
          <p className="text-xs text-zinc-400">
            Tạo gói sao lưu toàn bộ Công việc, Dự án, Bình luận và Lịch sử hệ thống dưới dạng tập tin nén `.ZIP`.
          </p>
        </div>
      </div>

      {/* Main Export Action Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-100">Khởi tạo bản Sao lưu Toàn bộ Workspace</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
              ZIP / JSON & CSV
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Bao gồm danh sách Task, Kanban board, nhãn (labels), bình luận, danh sách thành viên và siêu dữ liệu file đính kèm.
          </p>
        </div>

        <button
          type="button"
          onClick={onTriggerExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 disabled:opacity-50 transition shrink-0"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Đang đóng gói dữ liệu (.ZIP)...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Xuất toàn bộ dữ liệu Workspace</span>
            </>
          )}
        </button>
      </div>

      {/* Export History Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Lịch sử các lần xuất dữ liệu gần nhất:</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Thời gian tạo</th>
                <th className="p-3">Người yêu cầu</th>
                <th className="p-3">Dung lượng</th>
                <th className="p-3">Thời hạn tải</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Tải xuống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
              {exportHistory.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/50 transition">
                  <td className="p-3 font-mono font-medium text-zinc-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {item.requestedAt}
                  </td>
                  <td className="p-3 text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      {item.requestedBy}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-cyan-400 font-semibold">{item.fileSize}</td>
                  <td className="p-3 text-zinc-400 font-mono text-[11px]">{item.expiryDate}</td>
                  <td className="p-3">
                    {item.status === "ready" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[11px] font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Đang tạo...
                      </span>
                    )}
                    {item.status === "expired" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 text-[11px] font-medium">
                        <Clock className="w-3 h-3" /> Đã hết hạn
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {item.status === "ready" ? (
                      <a
                        href={item.downloadUrl || "#"}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Đang tải tập tin sao lưu Workspace ${item.id}.zip (${item.fileSize})`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-cyan-600 hover:text-white text-zinc-200 transition text-xs font-semibold shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải file .ZIP</span>
                      </a>
                    ) : (
                      <span className="text-zinc-600 text-xs italic">Không thể tải</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
