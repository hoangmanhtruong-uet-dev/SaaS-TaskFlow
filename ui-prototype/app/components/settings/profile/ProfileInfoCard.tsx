 
"use client";

import React from "react";
import { User, ShieldCheck, Smile, FileText, Lock } from "lucide-react";
import { UserStatus, UserProfileForm } from "./types";
import { ProfileErrors } from "./useProfileSettings";

interface ProfileInfoCardProps {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  bio: string;
  status: UserStatus;
  errors: ProfileErrors;
  onUpdateField: <K extends keyof UserProfileForm>(field: K, val: UserProfileForm[K]) => void;
  onUpdateStatus: (status: UserStatus) => void;
  onOpenEmailModal: () => void;
}

const EMOJI_OPTIONS = ["🌴", "💻", "🚫", "☕", "✈️", "🚀", "🤒", "📚"];

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  fullName,
  email,
  jobTitle,
  department,
  bio,
  status,
  errors,
  onUpdateField,
  onUpdateStatus,
  onOpenEmailModal,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Thông tin cá nhân & Trạng thái</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Quản lý tên hiển thị, địa chỉ email, chức danh và trạng thái công việc
          </p>
        </div>
      </div>

      {/* 1. Custom Status Bar (Slack style) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Smile className="w-3.5 h-3.5 text-amber-400" />
          <span>Cập nhật trạng thái hiển thị (Status)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Emoji Pick */}
          <select
            value={status.emoji}
            onChange={(e) => onUpdateStatus({ ...status, emoji: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 text-lg rounded-xl px-3 py-2 outline-none cursor-pointer text-center"
          >
            {EMOJI_OPTIONS.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>

          {/* Status text */}
          <input
            type="text"
            value={status.text}
            onChange={(e) => onUpdateStatus({ ...status, text: e.target.value })}
            placeholder="Ví dụ: Đang nghỉ phép đến 30/09, Đang WFH, Trong cuộc họp..."
            className="flex-1 w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none"
          />

          {/* Auto Clear Dropdown */}
          <select
            value={status.clearAfter}
            onChange={(e) =>
              onUpdateStatus({
                ...status,
                clearAfter: e.target.value as UserStatus["clearAfter"],
              })
            }
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="never">Không tự xóa</option>
            <option value="1hour">Xóa sau 1 giờ</option>
            <option value="today">Xóa sau hôm nay</option>
            <option value="this_week">Xóa sau tuần này</option>
          </select>
        </div>
      </div>

      {/* 2. Grid Fields: Full Name & Read-only Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="profile-full-name" className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Họ và tên</span>
            <span className="text-[11px] text-zinc-500 font-normal">Bắt buộc</span>
          </label>
          <input
            id="profile-full-name"
            type="text"
            value={fullName}
            onChange={(e) => onUpdateField("fullName", e.target.value)}
            placeholder="Nhập họ và tên đầy đủ..."
            className={`w-full bg-zinc-950 border text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
              errors.fullName
                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-zinc-800 focus:border-emerald-500"
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-400 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* Read-Only Email */}
        <div className="space-y-1.5">
          <label htmlFor="profile-email" className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Địa chỉ Email</span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Đã xác thực
            </span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="profile-email"
                type="text"
                value={email}
                readOnly
                disabled
                className="w-full bg-zinc-950/60 border border-zinc-800/80 text-xs rounded-xl px-3.5 py-2.5 text-zinc-400 cursor-not-allowed outline-none font-mono"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            </div>

            <button
              type="button"
              onClick={onOpenEmailModal}
              className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors shrink-0"
            >
              Đổi Email
            </button>
          </div>
        </div>
      </div>

      {/* 3. Job Title & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Title */}
        <div className="space-y-1.5">
          <label htmlFor="profile-job-title" className="text-xs font-semibold text-zinc-300">Chức danh công việc</label>
          <input
            id="profile-job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => onUpdateField("jobTitle", e.target.value)}
            placeholder="Ví dụ: Senior UI/UX Designer, Lead Frontend Engineer..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all"
          />
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label htmlFor="profile-department" className="text-xs font-semibold text-zinc-300">Phòng ban / Bộ phận</label>
          <input
            id="profile-department"
            type="text"
            value={department}
            onChange={(e) => onUpdateField("department", e.target.value)}
            placeholder="Ví dụ: Phòng Công nghệ & Sản phẩm..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* 4. Bio / About Me with character counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="profile-bio" className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Giới thiệu ngắn (Bio / About Me)</span>
          </label>
          <span
            className={`font-mono text-[11px] ${
              bio.length > 250 ? "text-red-400 font-bold" : "text-zinc-500"
            }`}
          >
            {bio.length}/250 ký tự
          </span>
        </div>

        <textarea
          id="profile-bio"
          rows={3}
          value={bio}
          onChange={(e) => onUpdateField("bio", e.target.value)}
          placeholder="Viết một vài dòng mô tả ngắn về chuyên môn và sở thích của bạn..."
          className={`w-full bg-zinc-950 border text-xs rounded-xl p-3.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all resize-none ${
            errors.bio
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-zinc-800 focus:border-emerald-500"
          }`}
        />

        {errors.bio ? (
          <p className="text-[11px] text-red-400 font-medium">{errors.bio}</p>
        ) : (
          <p className="text-[11px] text-zinc-500">
            Hỗ trợ hiển thị định dạng văn bản đơn giản trên hồ sơ cá nhân đồng nghiệp
          </p>
        )}
      </div>
    </div>
  );
};
