 
import React from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";

interface LogoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  zoom: number;
  onZoomChange: (z: number) => void;
  rotation: number;
  onRotationChange: (r: number) => void;
  onApply: () => void;
}

export const LogoCropModal: React.FC<LogoCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  zoom,
  onZoomChange,
  rotation,
  onRotationChange,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="text-lg font-bold text-zinc-100">Chỉnh sửa & Cắt Logo Workspace (128x128)</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="relative flex items-center justify-center h-64 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/80">
          <div
            className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl flex items-center justify-center relative bg-zinc-900"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Logo Preview"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Overlay grid / border guideline */}
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-indigo-500/30 rounded-xl m-4" />
        </div>

        {/* Controls */}
        <div className="space-y-4 text-xs text-zinc-300">
          {/* Zoom Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="flex items-center gap-1 text-zinc-400">
                <ZoomIn className="w-3.5 h-3.5" /> Phóng to / Thu nhỏ
              </span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-zinc-500" />
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <ZoomIn className="w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Rotate Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="flex items-center gap-1 text-zinc-400">
                <RotateCw className="w-3.5 h-3.5" /> Xoay góc
              </span>
              <span>{rotation}°</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onRotationChange((rotation - 90) % 360)}
                className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium"
              >
                -90°
              </button>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={rotation}
                onChange={(e) => onRotationChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => onRotationChange((rotation + 90) % 360)}
                className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium"
              >
                +90°
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onApply}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Check className="w-4 h-4" />
            Áp dụng Logo
          </button>
        </div>
      </div>
    </div>
  );
};
