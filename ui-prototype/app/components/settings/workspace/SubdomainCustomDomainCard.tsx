 
import React, { useState } from "react";
import {
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { CustomDomainConfig, SubdomainStatus } from "./types";

interface SubdomainCustomDomainCardProps {
  subdomain: string;
  subdomainStatus: SubdomainStatus;
  customDomain: CustomDomainConfig;
  isCheckingDns: boolean;
  onUpdateSubdomain: (sub: string) => void;
  onUpdateCustomDomainName: (domain: string) => void;
  onVerifyDns: () => void;
}

export const SubdomainCustomDomainCard: React.FC<SubdomainCustomDomainCardProps> = ({
  subdomain,
  subdomainStatus,
  customDomain,
  isCheckingDns,
  onUpdateSubdomain,
  onUpdateCustomDomainName,
  onVerifyDns,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">Khối 2: Tên miền & Truy cập (Domains & Access)</h2>
          <p className="text-xs text-zinc-400">
            Cấu hình Subdomain TaskFlow mặc định và kết nối Tên miền tùy chỉnh riêng cho doanh nghiệp.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Subdomain TaskFlow */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="block text-xs font-semibold text-zinc-200">
              Tên miền truy cập TaskFlow (Subdomain) <span className="text-red-400">*</span>
            </div>
            {/* Real-time Availability Badge */}
            <div className="flex items-center gap-1.5 text-xs">
              {subdomainStatus === "checking" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                  Đang kiểm tra khả dụng...
                </span>
              )}
              {subdomainStatus === "available" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tên miền khả dụng
                </span>
              )}
              {subdomainStatus === "taken" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  Đã bị chiếm dụng!
                </span>
              )}
              {subdomainStatus === "invalid" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Không hợp lệ (3-30 ký tự)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-700/80 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => onUpdateSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="acme"
              className="w-full px-4 py-2.5 bg-transparent text-zinc-100 text-sm focus:outline-none font-mono"
            />
            <div className="px-4 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-semibold font-mono border-l border-zinc-700/80 shrink-0">
              .taskflow.app
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5">
              Đường dẫn Workspace:{" "}
              <a
                href={`https://${subdomain || "acme"}.taskflow.app`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline font-mono inline-flex items-center gap-1"
              >
                https://{subdomain || "acme"}.taskflow.app
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
          </div>
        </div>

        {/* Custom Domain (Pro / Enterprise Feature) */}
        <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-100">Tên miền tùy chỉnh (Custom Domain)</span>
                <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                  PRO / ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cho phép thành viên truy cập Workspace thông qua tên miền riêng của công ty bạn.
              </p>
            </div>

            {/* Verification Badge & Re-check Button */}
            <div className="flex items-center gap-2">
              {customDomain.isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Đã xác thực DNS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Chờ xác thực DNS
                </span>
              )}

              <button
                type="button"
                onClick={onVerifyDns}
                disabled={isCheckingDns || !customDomain.domain}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDns ? "animate-spin text-indigo-400" : ""}`} />
                <span>{isCheckingDns ? "Đang kiểm tra..." : "Kiểm tra lại DNS"}</span>
              </button>
            </div>
          </div>

          {/* Custom Domain Input */}
          <div className="space-y-1.5">
            <div className="block text-xs font-semibold text-zinc-300">
              Nhập Custom Domain
            </div>
            <input
              type="text"
              value={customDomain.domain}
              onChange={(e) => onUpdateCustomDomainName(e.target.value)}
              placeholder="VD: tasks.acmecorp.com hoặc work.mycompany.vn"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* DNS CNAME Configuration Table */}
          {customDomain.domain && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">
                  Hướng dẫn cấu hình bản ghi DNS (CNAME Record):
                </span>
                {customDomain.lastCheckedAt && (
                  <span className="text-zinc-500">Kiểm tra lần cuối: {customDomain.lastCheckedAt}</span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Host / Name</th>
                      <th className="p-3">Target Value</th>
                      <th className="p-3">TTL</th>
                      <th className="p-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-200">
                    <tr>
                      <td className="p-3 font-bold text-indigo-400">CNAME</td>
                      <td className="p-3 font-bold text-zinc-100">
                        {customDomain.domain.split(".")[0] || "tasks"}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">cname.taskflow.app</td>
                      <td className="p-3 text-zinc-400">3600</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => copyToClipboard("cname.taskflow.app", "cname_target")}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-[11px]"
                        >
                          {copiedField === "cname_target" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-zinc-500 italic">
                * Lưu ý: Sau khi thêm bản ghi CNAME trên nhà cung cấp tên miền (Cloudflare, GoDaddy, Pavietnam,...), có thể mất từ 5 - 15 phút để DNS lan truyền hoàn tất.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
