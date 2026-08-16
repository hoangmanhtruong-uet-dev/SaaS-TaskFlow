export function taskDueState(value: string | null, now = new Date()) {
  if (!value) return { label: "Chưa đặt", tone: "none" as const };
  const date = new Date(value); const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const days = Math.round((dueDay.getTime() - start.getTime()) / 86400000);
  if (days < 0) return { label: `Quá hạn ${Math.abs(days)} ngày`, tone: "overdue" as const };
  if (days === 0) return { label: "Hôm nay", tone: "today" as const };
  if (days === 1) return { label: "Ngày mai", tone: "soon" as const };
  return { label: date.toLocaleDateString("vi-VN"), tone: days <= 7 ? "soon" as const : "none" as const };
}
