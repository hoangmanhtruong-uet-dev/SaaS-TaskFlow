 
"use client";

import React, { useEffect, useRef } from "react";
import { Search, X, Loader2, Command } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  isLoading = false,
  placeholder = "Tìm kiếm công việc, dự án, tài liệu, thành viên...",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className="relative flex items-center group">
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none text-zinc-400 group-focus-within:text-emerald-400 transition-colors">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Từ khóa tìm kiếm"
          className="w-full pl-12 pr-36 py-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 text-base shadow-lg transition-all duration-200"
        />

        {/* Action Controls Right (Clear + Badge + Submit Button) */}
        <div className="absolute right-2.5 flex items-center gap-2">
          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Xóa từ khóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Shortcut Badge */}
          <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 text-xs font-mono select-none">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-emerald-900/40 transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>
    </form>
  );
}
