 
import React, { useState } from "react";
import { X, Sparkles, Shield, Check, Plus } from "lucide-react";
import { permissionGroups } from "./constants";

interface CustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRole: (
    name: string,
    description: string,
    color: string,
    selectedPermIds: string[]
  ) => void;
}

const colorOptions = [
  { label: "Rose", value: "rose" },
  { label: "Purple", value: "purple" },
  { label: "Indigo", value: "indigo text-indigo-400" },
  { label: "Cyan", value: "cyan" },
  { label: "Emerald", value: "emerald" },
  { label: "Amber", value: "amber" },
];

export const CustomRoleModal: React.FC<CustomRoleModalProps> = ({
  isOpen,
  onClose,
  onCreateRole,
}) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("rose");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([
    "project_create_edit",
    "task_create_edit",
    "task_comment_attachment",
  ]);

  if (!isOpen) return null;

  const togglePerm = (permId: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    onCreateRole(roleName.trim(), description.trim(), selectedColor, selectedPerms);
    setRoleName("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold text-zinc-100">
              Khởi tạo Vai trò Tùy chỉnh mới (Custom Role Builder)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="custom-role-name" className="block text-xs font-semibold text-zinc-300">
              Tên Vai trò Tùy chỉnh <span className="text-red-400">*</span>
            </label>
            <input
              id="custom-role-name"
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="VD: Project Lead, External Auditor, Quality Inspector..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Description & Color Choice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Swatch */}
            <div className="space-y-1.5">
              <label htmlFor="custom-role-color" className="block text-xs font-semibold text-zinc-300">
                Màu sắc Huy hiệu (Badge Color)
              </label>
              <select
                id="custom-role-color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs capitalize focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {colorOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} Accent
                  </option>
                ))}
              </select>
            </div>

            {/* Role Preview */}
            <div className="space-y-1.5">
              <div className="block text-xs font-semibold text-zinc-300">Xem trước Badge</div>
              <div className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center px-4">
                <span className="px-3 py-1 rounded-md text-xs font-extrabold uppercase bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {roleName || "CUSTOM ROLE"}
                </span>
              </div>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="custom-role-description" className="block text-xs font-semibold text-zinc-300">
              Mô tả ngắn trách nhiệm vai trò
            </label>
            <textarea
              id="custom-role-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phạm vi quyền hạn và nghĩa vụ của vai trò này trong công ty..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Permission Checklist Selection */}
          <div className="space-y-3 pt-2">
            <div className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              Chọn bộ Quyền truy cập ban đầu cho vai trò này:
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 pr-2">
              {permissionGroups.map((g) => (
                <div key={g.id} className="space-y-2">
                  <div className="text-[11px] font-bold text-indigo-300 border-b border-zinc-800 pb-1">
                    {g.title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {g.permissions.map((p) => {
                      const isChecked = selectedPerms.includes(p.id);
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => togglePerm(p.id)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                            isChecked
                              ? "bg-indigo-500/10 border-indigo-500/40 text-zinc-100 font-semibold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-500 text-white"
                                : "border-zinc-700 bg-zinc-900"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!roleName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Vai trò & Thêm vào Ma trận</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
