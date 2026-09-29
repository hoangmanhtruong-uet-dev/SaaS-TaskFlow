 
/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Upload, Trash2, Palette, Image as ImageIcon, Check, Building } from "lucide-react";
import { mockPresetLogos } from "./constants";
import { LogoCropModal } from "./LogoCropModal";
import type { WorkspaceSettingsForm } from "./types";

interface BrandingIdentityCardProps {
  name: string;
  description: string;
  industry: string;
  brandColor: string;
  logoUrl: string | null;
  onUpdateField: <K extends keyof WorkspaceSettingsForm>(field: K, val: WorkspaceSettingsForm[K]) => void;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  onSelectPresetLogo: (url: string) => void;
  // Crop Modal Props
  cropModalImage: string | null;
  onCloseCropModal: () => void;
  cropZoom: number;
  onZoomChange: (z: number) => void;
  cropRotation: number;
  onRotationChange: (r: number) => void;
  onApplyCrop: () => void;
}

const colorPresets = [
  { label: "Indigo", value: "#6366F1" },
  { label: "Emerald", value: "#10B981" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Slate", value: "#64748B" },
];

const industries = [
  { label: "Công nghệ thông tin & Phần mềm", value: "Technology" },
  { label: "Marketing & Truyền thông / Agency", value: "Marketing" },
  { label: "Thiết kế & Sáng tạo", value: "Design" },
  { label: "Tài chính & Ngân hàng / Bảo hiểm", value: "Finance" },
  { label: "Bất động sản & Xây dựng", value: "RealEstate" },
  { label: "Thương mại điện tử & Bán lẻ", value: "ECommerce" },
  { label: "Y tế & Chăm sóc sức khỏe", value: "Healthcare" },
  { label: "Giáo dục & Đào tạo", value: "Education" },
  { label: "Khác", value: "Other" },
];

export const BrandingIdentityCard: React.FC<BrandingIdentityCardProps> = ({
  name,
  description,
  industry,
  brandColor,
  logoUrl,
  onUpdateField,
  onSelectFile,
  onRemoveLogo,
  onSelectPresetLogo,
  cropModalImage,
  onCloseCropModal,
  cropZoom,
  onZoomChange,
  cropRotation,
  onRotationChange,
  onApplyCrop,
}) => {
  // Generate initials for logo fallback
  const getInitials = (text: string) => {
    if (!text) return "WS";
    const parts = text.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-6 backdrop-blur-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div
          className="p-2.5 rounded-xl border border-zinc-700/60 shadow-inner flex items-center justify-center"
          style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
        >
          <Building className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">Khối 1: Nhận diện Thương hiệu Workspace</h2>
          <p className="text-xs text-zinc-400">
            Quản lý Logo, Tên Workspace, Mô tả, Ngành nghề và Tông màu chủ đạo hiển thị trong toàn ứng dụng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Logo Manager (4 cols) */}
        <div className="md:col-span-4 space-y-4 border-r-0 md:border-r border-zinc-800 pr-0 md:pr-6">
          <div className="block text-xs font-semibold text-zinc-300">
            Logo Workspace (128x128px)
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-3">
            {/* Logo Preview Circle / Square */}
            <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-zinc-700/80 bg-zinc-900 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:border-indigo-500">
              {logoUrl ? (
                 
                <img
                  src={logoUrl}
                  alt="Workspace Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl font-black text-white tracking-widest"
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}, #3B82F6)`,
                  }}
                >
                  {getInitials(name)}
                </div>
              )}

              {/* Hover overlay for quick upload */}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 text-white text-xs font-medium gap-1">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Tải ảnh mới</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </label>
            </div>

            <span className="text-[11px] text-zinc-500 text-center">
              Khuyến nghị: Ảnh PNG, JPG hoặc SVG vuông (1:1), tối đa 5MB.
            </span>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full pt-1">
              <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold cursor-pointer transition shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Tải lên</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </label>

              {logoUrl && (
                <button
                  type="button"
                  onClick={onRemoveLogo}
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition"
                  title="Xóa Logo hiện tại"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Preset Logo Selection */}
            <div className="w-full pt-2 border-t border-zinc-800/80 space-y-2">
              <span className="block text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Mẫu có sẵn:
              </span>
              <div className="flex items-center gap-2 justify-between">
                {mockPresetLogos.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPresetLogo(preset)}
                    className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 hover:border-indigo-500 transition hover:scale-105"
                  >
                    { }
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Name, Description, Industry, Color (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-name" className="block text-xs font-semibold text-zinc-300">
              Tên Không gian làm việc (Workspace Name) <span className="text-red-400">*</span>
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => onUpdateField("name", e.target.value)}
              placeholder="VD: ACME Corporation, Tập đoàn Sunshine..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* Description & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="workspace-industry" className="block text-xs font-semibold text-zinc-300">
                Ngành nghề hoạt động
              </label>
              <select
                id="workspace-industry"
                value={industry}
                onChange={(e) => onUpdateField("industry", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Color Accent */}
            <div className="space-y-1.5">
              <div className="block text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Màu chủ đạo (Brand Color Accent)</span>
                <span className="text-[11px] font-mono text-zinc-400">{brandColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => onUpdateField("brandColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => onUpdateField("brandColor", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Color Preset Swatches */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-xs font-semibold text-zinc-400 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> Bảng màu gợi ý:
            </span>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onUpdateField("brandColor", c.value)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    brandColor.toLowerCase() === c.value.toLowerCase()
                      ? "border-white bg-zinc-800 text-white shadow"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-inner"
                    style={{ backgroundColor: c.value }}
                  />
                  <span>{c.label}</span>
                  {brandColor.toLowerCase() === c.value.toLowerCase() && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="workspace-description" className="block text-xs font-semibold text-zinc-300">
              Mô tả ngắn về Workspace
            </label>
            <textarea
              id="workspace-description"
              rows={3}
              value={description}
              onChange={(e) => onUpdateField("description", e.target.value)}
              placeholder="Giới thiệu mục tiêu, phòng ban hoặc định hướng hoạt động của không gian làm việc này..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Logo Crop Modal Trigger */}
      <LogoCropModal
        isOpen={!!cropModalImage}
        onClose={onCloseCropModal}
        imageSrc={cropModalImage || ""}
        zoom={cropZoom}
        onZoomChange={onZoomChange}
        rotation={cropRotation}
        onRotationChange={onRotationChange}
        onApply={onApplyCrop}
      />
    </div>
  );
};
