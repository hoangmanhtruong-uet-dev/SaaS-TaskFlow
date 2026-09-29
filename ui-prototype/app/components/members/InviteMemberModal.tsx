 
"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Shield,
  FolderPlus,
  Link,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { UserRole } from "./types";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (emails: string[], role: UserRole, projects: string[]) => void;
  onCopyLink: (expiration: string) => void;
}

const AVAILABLE_PROJECTS = [
  "Website E-Commerce V2",
  "Mobile Banking App",
  "Hệ thống CRM Doanh nghiệp",
  "UI/UX Design System",
  "Chiến dịch Marketing Q4",
];

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSendInvite,
  onCopyLink,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([
    "Website E-Commerce V2",
  ]);
  const [expiration, setExpiration] = useState("7days");
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const handleAddEmail = (raw: string) => {
    setErrorMsg("");
    const parsed = raw
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const validList: string[] = [];
    let hasInvalid = false;

    parsed.forEach((e) => {
      if (validateEmail(e)) {
        if (!emails.includes(e)) {
          validList.push(e);
        }
      } else {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      setErrorMsg("Phát hiện một số email không đúng định dạng. Vui lòng kiểm tra lại.");
    }

    if (validList.length > 0) {
      setEmails((prev) => [...prev, ...validList]);
      setEmailInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (emailInput.trim()) {
        handleAddEmail(emailInput);
      }
    }
  };

  const removeEmail = (target: string) => {
    setEmails((prev) => prev.filter((item) => item !== target));
  };

  const toggleProject = (projectName: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectName)
        ? prev.filter((p) => p !== projectName)
        : [...prev, projectName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && validateEmail(emailInput.trim())) {
      const finalEmails = Array.from(new Set([...emails, emailInput.trim()]));
      onSendInvite(finalEmails, selectedRole, selectedProjects);
    } else if (emails.length > 0) {
      onSendInvite(emails, selectedRole, selectedProjects);
    } else {
      setErrorMsg("Vui lòng nhập ít nhất một địa chỉ email hợp lệ.");
    }
  };

  const handleCopyLinkClick = () => {
    onCopyLink(expiration);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Mời thành viên mới vào Workspace
              </h2>
              <p className="text-xs text-zinc-400">
                Cấp quyền truy cập và phân công dự án cho thành viên team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* 1. Bulk Email Input */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Địa chỉ Email (Nhập nhiều email phân tách bằng phím Enter hoặc phẩy)</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-normal">
                {emails.length} email đã chọn
              </span>
            </div>

            {/* Email tags container */}
            <div className="min-h-[70px] p-2.5 bg-zinc-950 border border-zinc-800 focus-within:border-emerald-500 rounded-xl flex flex-wrap items-center gap-1.5 transition-all">
              {emails.map((e) => (
                <span
                  key={e}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-medium"
                >
                  {e}
                  <button
                    type="button"
                    onClick={() => removeEmail(e)}
                    className="hover:text-red-400 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (emailInput.trim() && validateEmail(emailInput.trim())) {
                    handleAddEmail(emailInput);
                  }
                }}
                placeholder={
                  emails.length === 0
                    ? "Nhập email (ví dụ: alex@company.com, sarah@company.com)..."
                    : "Thêm email khác..."
                }
                className="flex-1 min-w-[200px] bg-transparent text-sm text-zinc-100 placeholder-zinc-500 border-none outline-none py-1"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* 2. Role Selector */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chọn vai trò (Role) trong Workspace</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Admin */}
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "admin"
                    ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-xs text-zinc-200">Admin</div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  Toàn quyền quản lý project & thành viên (trừ Billing)
                </p>
              </button>

              {/* Member */}
              <button
                type="button"
                onClick={() => setSelectedRole("member")}
                className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "member"
                    ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-xs text-zinc-200">Member</div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  Tạo, chỉnh sửa task & cập nhật tiến độ công việc
                </p>
              </button>

              {/* Guest */}
              <button
                type="button"
                onClick={() => setSelectedRole("guest")}
                className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "guest"
                    ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-xs text-zinc-200">Guest / Khách</div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  Chỉ có quyền xem & thao tác trên dự án cụ thể được giao
                </p>
              </button>
            </div>
          </div>

          {/* 3. Default Projects Selector */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gán tham gia dự án ban đầu</span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2 max-h-36 overflow-y-auto">
              {AVAILABLE_PROJECTS.map((proj) => {
                const isSelected = selectedProjects.includes(proj);
                return (
                  <label
                    key={proj}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer text-xs text-zinc-300"
                  >
                    <span>{proj}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProject(proj)}
                      className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Direct Invite Link Section */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hoặc chia sẻ Liên kết mời trực tiếp</span>
              </div>

              <select
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1 outline-none"
              >
                <option value="7days">Hết hạn: 7 ngày</option>
                <option value="30days">Hết hạn: 30 ngày</option>
                <option value="never">Không bao giờ hết hạn</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://taskflow.io/invite/ws-dev-8849?exp=${expiration}`}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 font-mono select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLinkClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors shrink-0"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gửi lời mời ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
