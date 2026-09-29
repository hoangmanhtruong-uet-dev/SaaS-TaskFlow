 
"use client";

import React from "react";
import { Lock, Eye, EyeOff, Check, X, KeyRound, Loader2 } from "lucide-react";
import { ChangePasswordForm, PasswordStrength } from "./types";

interface ChangePasswordCardProps {
  form: ChangePasswordForm;
  onChangeForm: (form: ChangePasswordForm) => void;
  showPassword: { current: boolean; new: boolean; confirm: boolean };
  onToggleShow: (field: "current" | "new" | "confirm") => void;
  strength: PasswordStrength;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChangePasswordCard: React.FC<ChangePasswordCardProps> = ({
  form,
  onChangeForm,
  showPassword,
  onToggleShow,
  strength,
  error,
  loading,
  onSubmit,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <span>Đổi mật khẩu tài khoản</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cập nhật mật khẩu mạnh định kỳ để bảo vệ quyền truy cập tài khoản TaskFlow
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 1. Current Password */}
        <div className="space-y-1.5">
          <label htmlFor="current-password" className="text-xs font-semibold text-zinc-300">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showPassword.current ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) =>
                onChangeForm({ ...form, currentPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu hiện tại của bạn..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl pl-3.5 pr-10 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => onToggleShow("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
            >
              {showPassword.current ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2. New Password */}
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-xs font-semibold text-zinc-300">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword.new ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) =>
                onChangeForm({ ...form, newPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu mới mạnh..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl pl-3.5 pr-10 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => onToggleShow("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
            >
              {showPassword.new ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Realtime Password Strength Bar Meter */}
          {form.newPassword.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Độ mạnh mật khẩu:</span>
                <span className={`font-bold ${strength.color.split(" ")[1]}`}>
                  {strength.label}
                </span>
              </div>

              {/* Progress segments */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color.split(" ")[0] : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

              {/* Password Rules Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <span
                  className={`flex items-center gap-1 ${
                    strength.checks.hasMinLength ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {strength.checks.hasMinLength ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-zinc-600" />
                  )}
                  <span>Tối thiểu 8+ ký tự</span>
                </span>

                <span
                  className={`flex items-center gap-1 ${
                    strength.checks.hasUpper ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {strength.checks.hasUpper ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-zinc-600" />
                  )}
                  <span>Chữ cái in hoa (A-Z)</span>
                </span>

                <span
                  className={`flex items-center gap-1 ${
                    strength.checks.hasLower ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {strength.checks.hasLower ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-zinc-600" />
                  )}
                  <span>Chữ cái in thường (a-z)</span>
                </span>

                <span
                  className={`flex items-center gap-1 ${
                    strength.checks.hasDigit ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {strength.checks.hasDigit ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-zinc-600" />
                  )}
                  <span>Chữ số (0-9)</span>
                </span>

                <span
                  className={`flex items-center gap-1 ${
                    strength.checks.hasSpecial ? "text-emerald-400 font-medium" : "text-zinc-500"
                  }`}
                >
                  {strength.checks.hasSpecial ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <X className="w-3 h-3 text-zinc-600" />
                  )}
                  <span>Ký tự đặc biệt (!@#$)</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Confirm New Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-xs font-semibold text-zinc-300">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showPassword.confirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) =>
                onChangeForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Nhập lại mật khẩu mới..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-xs rounded-xl pl-3.5 pr-10 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => onToggleShow("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
            >
              {showPassword.confirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang cập nhật...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Cập nhật mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
