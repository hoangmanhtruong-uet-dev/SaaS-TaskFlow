import { NotificationMatrixRow, NotificationFormState } from "./types";

export const MOCK_MATRIX_ROWS: NotificationMatrixRow[] = [
  // Task Events
  {
    id: "mat-1",
    category: "Task",
    eventName: "Được gán công việc mới",
    description: "Khi đồng nghiệp hoặc Quản lý dự án phân công task mới cho bạn",
    email: true,
    inApp: true,
    push: true,
    slack: true,
  },
  {
    id: "mat-2",
    category: "Task",
    eventName: "Được nhắc tên (@mention) trong bình luận",
    description: "Khi có ai đó nhắc tên bạn trong bình luận công việc hoặc dự án",
    email: true,
    inApp: true,
    push: true,
    slack: true,
  },
  {
    id: "mat-3",
    category: "Task",
    eventName: "Có bình luận/cập nhật trong task đang theo dõi",
    description: "Cập nhật mô tả, đính kèm tệp hoặc bình luận mới trong task bạn theo dõi",
    email: false,
    inApp: true,
    push: true,
    slack: false,
  },
  {
    id: "mat-4",
    category: "Task",
    eventName: "Cảnh báo hạn công việc (Sắp đến hạn / Quá hạn)",
    description: "Nhắc nhở tự động 24h/1h trước hạn chót hoàn thành task",
    email: true,
    inApp: true,
    push: true,
    slack: true,
  },
  {
    id: "mat-5",
    category: "Task",
    eventName: "Thay đổi trạng thái công việc (Chuyển cột Kanban)",
    description: "Khi task chuyển từ TODO sang IN_PROGRESS hoặc DONE",
    email: false,
    inApp: true,
    push: false,
    slack: false,
  },

  // Project Events
  {
    id: "mat-6",
    category: "Project",
    eventName: "Lời mời tham gia Dự án / Workspace mới",
    description: "Nhận thông báo cấp quyền truy cập dự án mới trong hệ thống",
    email: true,
    inApp: true,
    push: true,
    slack: true,
  },
  {
    id: "mat-7",
    category: "Project",
    eventName: "Cập nhật tiến độ / Milestone dự án",
    description: "Báo cáo tổng kết mốc tiến độ tuần hoặc hoàn thành Sprint",
    email: true,
    inApp: true,
    push: false,
    slack: true,
  },
  {
    id: "mat-8",
    category: "Project",
    eventName: "Thay đổi vai trò & phân quyền Workspace",
    description: "Khi vai trò (Role) của bạn được nâng cấp hoặc thay đổi",
    email: true,
    inApp: true,
    push: true,
    slack: false,
  },
];

export const INITIAL_NOTIFICATION_STATE: NotificationFormState = {
  pushChannels: {
    browserEnabled: true,
    permission: "granted",
    soundEnabled: true,
    soundChime: "default",
  },
  emailDigest: {
    frequency: "realtime",
    dailyTime: "08:00",
  },
  quietHours: {
    enabled: true,
    startTime: "22:00",
    endTime: "07:00",
    disableWeekends: true,
  },
  matrix: MOCK_MATRIX_ROWS,
  slack: {
    channel: "#taskflow-notifications",
    webhookConfigured: true,
  },
};
