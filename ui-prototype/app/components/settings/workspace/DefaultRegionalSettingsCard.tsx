 
import React, { useState } from "react";
import { Clock, Mail, Coins, Languages, Plus, X, Tag } from "lucide-react";
import type { WorkspaceSettingsForm } from "./types";

interface DefaultRegionalSettingsCardProps {
  timezone: string;
  allowedEmailDomains: string[];
  currency: string;
  language: string;
  dateFormat: string;
  onUpdateField: <K extends keyof WorkspaceSettingsForm>(field: K, val: WorkspaceSettingsForm[K]) => void;
  onAddEmailDomain: (domain: string) => void;
  onRemoveEmailDomain: (domain: string) => void;
}

const timezones = [
  { label: "(GMT+07:00) Hà Nội, Bangkok, Jakarta", value: "Asia/Ho_Chi_Minh" },
  { label: "(GMT+09:00) Tokyo, Seoul, Osaka", value: "Asia/Tokyo" },
  { label: "(GMT+08:00) Singapore, Hong Kong, Beijing", value: "Asia/Singapore" },
  { label: "(GMT+00:00) London, UTC, Dublin", value: "UTC" },
  { label: "(GMT-05:00) New York, Washington (EST)", value: "America/New_York" },
  { label: "(GMT-08:00) San Francisco, Los Angeles (PST)", value: "America/Los_Angeles" },
];

const currencies = [
  { label: "VND (₫) - Đồng Việt Nam", value: "VND" },
  { label: "USD ($) - US Dollar", value: "USD" },
  { label: "EUR (€) - Euro", value: "EUR" },
  { label: "JPY (¥) - Japanese Yen", value: "JPY" },
  { label: "SGD ($) - Singapore Dollar", value: "SGD" },
];

const languages = [
  { label: "Tiếng Việt (Vietnamese)", value: "vi" },
  { label: "English (US)", value: "en" },
  { label: "日本語 (Japanese)", value: "ja" },
];

const dateFormats = [
  { label: "DD/MM/YYYY (26/09/2026)", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD (2026-09-26)", value: "YYYY-MM-DD" },
  { label: "MM/DD/YYYY (09/26/2026)", value: "MM/DD/YYYY" },
];

export const DefaultRegionalSettingsCard: React.FC<DefaultRegionalSettingsCardProps> = ({
  timezone,
  allowedEmailDomains,
  currency,
  language,
  dateFormat,
  onUpdateField,
  onAddEmailDomain,
  onRemoveEmailDomain,
}) => {
  const [domainInput, setDomainInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (domainInput.trim()) {
        onAddEmailDomain(domainInput);
        setDomainInput("");
      }
    }
  };

  const handleAddClick = () => {
    if (domainInput.trim()) {
      onAddEmailDomain(domainInput);
      setDomainInput("");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">
            Khối 3: Thiết lập Mặc định & Vùng miền (Regional & Defaults)
          </h2>
          <p className="text-xs text-zinc-400">
            Cấu hình Múi giờ báo cáo, Email domain tự động tham gia, Tiền tệ và Ngôn ngữ cho toàn bộ Workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timezone Selection */}
        <div className="space-y-1.5">
          <label htmlFor="workspace-timezone" className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Múi giờ chuẩn Workspace (Default Timezone)
          </label>
          <select
            id="workspace-timezone"
            value={timezone}
            onChange={(e) => onUpdateField("timezone", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-500">
            * Áp dụng cho các mốc deadline, nhật ký hoạt động (Audit log) và báo cáo tiến độ tự động.
          </p>
        </div>

        {/* Allowed Email Domains (Auto-join) Tag Input */}
        <div className="space-y-2">
          <div className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Tên miền Email Tự động Tham gia (Allowed Email Domains)
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            {/* Tag List */}
            <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
              {allowedEmailDomains.map((dom) => (
                <span
                  key={dom}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium shadow-sm"
                >
                  <Tag className="w-3 h-3 text-indigo-400" />
                  @{dom}
                  <button
                    type="button"
                    onClick={() => onRemoveEmailDomain(dom)}
                    className="p-0.5 rounded-full hover:bg-indigo-500/30 text-indigo-400 hover:text-white transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {allowedEmailDomains.length === 0 && (
                <span className="text-xs text-zinc-500 italic">Chưa khai báo domain tự động nào</span>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
              <input
                id="allowed-email-domain"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập domain email (VD: acme.com) rồi bấm Enter hoặc phẩy"
                className="w-full px-3 py-1.5 bg-zinc-900 rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddClick}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            * Khi nhân viên đăng ký tài khoản bằng email chứa các đuôi trên, hệ thống sẽ tự động đề xuất tham gia Workspace này.
          </p>
        </div>

        {/* Currency & Language */}
        <div className="space-y-1.5">
          <label htmlFor="workspace-currency" className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Định dạng Tiền tệ Mặc định (Currency)
          </label>
          <select
            id="workspace-currency"
            value={currency}
            onChange={(e) => onUpdateField("currency", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="workspace-language" className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-purple-400" />
            Ngôn ngữ Mặc định (Default Language)
          </label>
          <select
            id="workspace-language"
            value={language}
            onChange={(e) => onUpdateField("language", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="block text-xs font-semibold text-zinc-300">
            Định dạng Ngày tháng Mặc định (Date Format)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dateFormats.map((df) => (
              <button
                key={df.value}
                type="button"
                onClick={() => onUpdateField("dateFormat", df.value)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono text-left transition ${
                  dateFormat === df.value
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
