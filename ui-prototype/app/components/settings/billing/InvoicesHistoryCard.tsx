 
import React from "react";
import { Download, FileText, CheckCircle2, Calendar } from "lucide-react";
import { InvoiceItem } from "./types";

interface InvoicesHistoryCardProps {
  invoices: InvoiceItem[];
  onDownloadPdf: (invoiceId: string) => void;
}

export const InvoicesHistoryCard: React.FC<InvoicesHistoryCardProps> = ({
  invoices,
  onDownloadPdf,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">Lịch sử Hóa đơn (Invoices History)</h2>
          <p className="text-xs text-zinc-400">
            Truy xuất danh sách các giao dịch đã thanh toán và tải xuống hóa đơn VAT dạng tệp PDF.
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-3.5">Mã Hóa đơn</th>
              <th className="p-3.5">Ngày xuất</th>
              <th className="p-3.5">Nội dung / Chu kỳ</th>
              <th className="p-3.5">Số tiền</th>
              <th className="p-3.5">Trạng thái</th>
              <th className="p-3.5 text-right">Tải về</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-900/50 transition">
                {/* Invoice ID Link */}
                <td className="p-3.5 font-bold text-indigo-400 font-mono hover:underline cursor-pointer">
                  {inv.id}
                </td>

                {/* Date */}
                <td className="p-3.5 text-zinc-400 font-sans flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {inv.date}
                </td>

                {/* Cycle / Seats */}
                <td className="p-3.5 font-sans text-zinc-300">
                  {inv.cycle} ({inv.seatsCount} Seats)
                </td>

                {/* Amount */}
                <td className="p-3.5 font-bold text-emerald-400 font-mono text-sm">
                  {inv.amount}
                </td>

                {/* Status Badge */}
                <td className="p-3.5 font-sans">
                  {inv.status === "paid" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
                    </span>
                  )}
                  {inv.status === "pending" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
                      Chờ xử lý
                    </span>
                  )}
                </td>

                {/* PDF Download Button */}
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onDownloadPdf(inv.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans font-semibold border border-zinc-700 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tải PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
