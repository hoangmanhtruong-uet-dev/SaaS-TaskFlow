import { ArchivedItem } from "./types";

const today = new Date(2026, 8, 25); // Sept 25, 2026

const calcExpiryDate = (daysAgo: number) => {
  const archivedDate = new Date(today);
  archivedDate.setDate(archivedDate.getDate() - daysAgo);

  const expiresDate = new Date(archivedDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const remainingDays = Math.max(0, Math.ceil((expiresDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    archivedAt: archivedDate.toISOString(),
    expiresAt: expiresDate.toISOString(),
    remainingDays,
  };
};

export const MOCK_ARCHIVED_ITEMS: ArchivedItem[] = [
  {
    id: "arch-1",
    code: "PROJ-LEGACY",
    title: "Dự án TaskFlow REST API v1.0",
    type: "project",
    originalPath: "Thuộc Workspace TaskFlow Core / Nhóm Legacy Projects",
    archivedByName: "Hoàng Mạnh Trường",
    archivedByAvatar: "H",
    ...calcExpiryDate(25), // 25 days ago -> 5 days remaining (Highlighted Red!)
  },
  {
    id: "arch-2",
    code: "PROJ-OLD-UI",
    title: "Hệ thống UI Component v0.9 (Cũ)",
    type: "project",
    originalPath: "Thuộc Workspace TaskFlow Core / Nhóm Design System",
    archivedByName: "Nguyễn Văn A",
    archivedByAvatar: "A",
    ...calcExpiryDate(18), // 18 days ago -> 12 days remaining
  },
  {
    id: "arch-3",
    code: "TASK-088",
    title: "Cấu hình Server Nginx Load Balancer cũ",
    type: "task",
    originalPath: "Dự án Database & Security / Cột Completed",
    archivedByName: "Trần Thị B",
    archivedByAvatar: "B",
    ...calcExpiryDate(2), // 2 days ago -> 28 days remaining
  },
  {
    id: "arch-4",
    code: "TASK-045",
    title: "Sửa lỗi Memory Leak trên React v17 Engine",
    type: "task",
    originalPath: "Dự án SaaS TaskFlow Core / Cột Review",
    archivedByName: "Hoàng Mạnh Trường",
    archivedByAvatar: "H",
    ...calcExpiryDate(10), // 10 days ago -> 20 days remaining
  },
  {
    id: "arch-5",
    code: "FILE-202",
    title: "Bản vẽ thiết kế Wireframe v1.2.pdf",
    type: "file",
    originalPath: "Dự án UI/UX Design System / Tệp đính kèm Task #104",
    archivedByName: "Phạm Văn C",
    archivedByAvatar: "C",
    ...calcExpiryDate(26), // 26 days ago -> 4 days remaining (Red!)
  },
  {
    id: "arch-6",
    code: "TASK-012",
    title: "Khảo sát ý kiến người dùng về Dark Mode Theme cũ",
    type: "task",
    originalPath: "Dự án TaskFlow Mobile App / Cột Done",
    archivedByName: "Lê Thị D",
    archivedByAvatar: "D",
    ...calcExpiryDate(15), // 15 days ago -> 15 days remaining
  },
  {
    id: "arch-7",
    code: "TASK-009",
    title: "Viết Script Import dữ liệu từ CSV cũ",
    type: "task",
    originalPath: "Dự án SaaS TaskFlow Core / Cột Backlog",
    archivedByName: "Hoàng Mạnh Trường",
    archivedByAvatar: "H",
    ...calcExpiryDate(5), // 5 days ago -> 25 days remaining
  },
];
