/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Sparkles,
  Camera,
  X,
  ZoomIn,
  RotateCw,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { PRESET_AVATARS } from "./constants";

interface AvatarManagerCardProps {
  avatarUrl: string | null;
  fullName: string;
  onSelectFile: (file: File) => void;
  onSelectPreset: (url: string) => void;
  onRemoveAvatar: () => void;
  // Crop Modal Props
  cropImage: string | null;
  onCloseCropModal: () => void;
  cropZoom: number;
  onZoomChange: (zoom: number) => void;
  cropRotation: number;
  onRotationChange: (rot: number) => void;
  onApplyCrop: () => void;
}

export const AvatarManagerCard: React.FC<AvatarManagerCardProps> = ({
  avatarUrl,
  fullName,
  onSelectFile,
  onSelectPreset,
  onRemoveAvatar,
  cropImage,
  onCloseCropModal,
  cropZoom,
  onZoomChange,
  cropRotation,
  onRotationChange,
  onApplyCrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span>Ảnh đại diện (Avatar)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tải ảnh cá nhân hoặc chọn ảnh Preset để nhận diện trong Workspace
          </p>
        </div>
      </div>

      {/* Main Avatar Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Large 96x96 Avatar Display */}
        <div className="relative group shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800 shadow-xl group-hover:border-emerald-500/60 transition-colors"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold text-3xl flex items-center justify-center border-4 border-zinc-800 shadow-xl select-none">
              {initials || "TF"}
            </div>
          )}

          {/* Active Status Badge Indicator */}
          <span
            className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-zinc-950 shadow-md"
            title="Đang hoạt động (Online)"
          />
        </div>

        {/* Drag and Drop Zone & Action Buttons */}
        <div className="flex-1 w-full space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-emerald-500 bg-emerald-950/30 text-emerald-300"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 text-zinc-400"
            }`}
          >
            <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-zinc-200">
              Kéo & dán tệp ảnh vào đây, hoặc <span className="text-emerald-400 hover:underline">duyệt tệp</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Hỗ trợ định dạng JPG, PNG, WEBP (Dung lượng tối đa 5MB)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tải ảnh mới</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Xóa ảnh (Về Initials)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Avatars Gallery */}
      <div className="pt-3 border-t border-zinc-800/80 space-y-2">
        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Hoặc chọn nhanh từ Bộ sưu tập Avatar có sẵn (Presets)</span>
        </span>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {PRESET_AVATARS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.url)}
              className={`relative rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                avatarUrl === preset.url
                  ? "border-emerald-500 ring-2 ring-emerald-500/40 scale-110"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
              title={preset.label}
            >
              <img
                src={preset.url}
                alt={preset.label}
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Crop Image Modal */}
      {cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Cắt & chỉnh sửa ảnh đại diện</span>
              </h3>
              <button
                onClick={onCloseCropModal}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Preview Container */}
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-emerald-500/60 shadow-2xl bg-zinc-950 flex items-center justify-center">
              <img
                src={cropImage}
                alt="Crop preview"
                style={{
                  transform: `scale(${cropZoom}) rotate(${cropRotation}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
                className="max-w-none w-full h-full object-cover"
              />
            </div>

            {/* Sliders & Controls */}
            <div className="space-y-3 pt-2">
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Thu phóng (Zoom)</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-300">
                    {Math.round(cropZoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={cropZoom}
                  onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Rotate Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onRotationChange((cropRotation + 90) % 360)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Xoay ảnh 90°</span>
                </button>
                <span className="text-xs text-zinc-500 font-mono">
                  Góc xoay: {cropRotation}°
                </span>
              </div>
            </div>

            {/* Submit Crop */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseCropModal}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onApplyCrop}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Áp dụng ảnh đại diện</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
