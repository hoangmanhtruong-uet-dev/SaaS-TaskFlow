import {
  RoleInfo,
  PermissionGroup,
  MatrixState,
  ProjectPermissionOverride,
} from "./types";

export const defaultSystemRoles: RoleInfo[] = [
  {
    key: "owner",
    label: "OWNER",
    description: "Chủ sở hữu toàn quyền quản trị tối cao, thanh toán và xóa Workspace.",
    memberCount: 1,
    isSystem: true,
    color: "amber",
    badgeBg: "bg-amber-500/10 border-amber-500/30",
    badgeText: "text-amber-400",
  },
  {
    key: "admin",
    label: "ADMIN",
    description: "Quản trị viên có đầy đủ quyền điều hành dự án, quản lý thành viên & cài đặt.",
    memberCount: 3,
    isSystem: true,
    color: "indigo",
    badgeBg: "bg-indigo-500/10 border-indigo-500/30",
    badgeText: "text-indigo-400",
  },
  {
    key: "member",
    label: "MEMBER",
    description: "Thành viên chính thức, tạo dự án, thực hiện công việc và trao đổi nội bộ.",
    memberCount: 38,
    isSystem: true,
    color: "emerald",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30",
    badgeText: "text-emerald-400",
  },
  {
    key: "guest",
    label: "GUEST",
    description: "Khách / Đối tác bên ngoài chỉ xem và tương tác trong các dự án được chia sẻ.",
    memberCount: 6,
    isSystem: true,
    color: "purple",
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    badgeText: "text-purple-400",
  },
  {
    key: "project_lead",
    label: "PROJECT LEAD",
    description: "Vai trò tùy chỉnh dành cho Trưởng nhóm quản lý tiến độ và phân công công việc.",
    memberCount: 4,
    isSystem: false,
    color: "rose",
    badgeBg: "bg-rose-500/10 border-rose-500/30",
    badgeText: "text-rose-400",
  },
];

export const permissionGroups: PermissionGroup[] = [
  {
    id: "group_workspace",
    title: "Nhóm 1: Quản trị Workspace & Billing",
    description: "Các quyền liên quan đến thiết lập không gian làm việc, cổng thanh toán và chìa khóa API.",
    permissions: [
      {
        id: "workspace_config",
        name: "Cấu hình Workspace & Subdomain",
        description: "Chỉnh sửa tên, logo, subdomain và tên miền riêng (Custom Domain).",
      },
      {
        id: "workspace_billing",
        name: "Quản lý Gói cước & Phương thức thanh toán",
        description: "Nâng cấp gói Enterprise, xem hóa đơn VAT và đổi thẻ thanh toán.",
      },
      {
        id: "workspace_integrations",
        name: "Cấu hình Tích hợp & API Keys",
        description: "Kết nối Slack, GitHub, Jira và phát hành API Tokens.",
      },
      {
        id: "workspace_audit_log",
        name: "Xem nhật ký hoạt động (Audit Log)",
        description: "Truy xuất lịch sử truy cập và nhật ký thao tác bảo mật.",
      },
    ],
  },
  {
    id: "group_members",
    title: "Nhóm 2: Quản lý Thành viên",
    description: "Các quyền phân bổ nhân sự, duyệt lời mời và phân quyền vai trò.",
    permissions: [
      {
        id: "member_invite",
        name: "Mời thành viên mới & Quản lý lời mời",
        description: "Gửi email kích hoạt và tạo liên kết tham gia Workspace.",
      },
      {
        id: "member_role_change",
        name: "Thay đổi vai trò thành viên",
        description: "Thăng cấp hoặc hạ cấp vai trò từ Member lên Admin hoặc Custom Roles.",
      },
      {
        id: "member_remove",
        name: "Xóa / Vô hiệu hóa tài khoản thành viên",
        description: "Đóng băng quyền truy cập và thu hồi tài khoản thành viên.",
      },
    ],
  },
  {
    id: "group_projects",
    title: "Nhóm 3: Dự án & Quy trình (Project Management)",
    description: "Quyền khởi tạo, cấu hình quy trình làm việc và xóa dự án.",
    permissions: [
      {
        id: "project_create_edit",
        name: "Tạo & Chỉnh sửa Dự án mới",
        description: "Tạo dự án mới, cài đặt Kanban view, Gantt chart.",
      },
      {
        id: "project_delete",
        name: "Xóa Dự án",
        description: "Xóa vĩnh viễn dự án cùng toàn bộ công việc liên quan.",
      },
      {
        id: "project_template_custom_fields",
        name: "Quản lý Mẫu dự án (Templates) & Custom Fields",
        description: "Khởi tạo quy trình mẫu và trường dữ liệu tùy biến cho công ty.",
      },
    ],
  },
  {
    id: "group_tasks",
    title: "Nhóm 4: Công việc & Bình luận (Task & Activity)",
    description: "Các thao tác tác nghiệp hàng ngày trên thẻ công việc (Tasks).",
    permissions: [
      {
        id: "task_create_edit",
        name: "Tạo và chỉnh sửa Công việc (Task)",
        description: "Tạo thẻ task, giao người thực hiện (assignee) và gia hạn deadline.",
      },
      {
        id: "task_delete",
        name: "Xóa Công việc",
        description: "Xóa thẻ task khỏi danh sách công việc của dự án.",
      },
      {
        id: "task_comment_attachment",
        name: "Bình luận & Đính kèm tệp",
        description: "Viết bình luận, tag tên đồng nghiệp và tải lên tệp tài liệu.",
      },
      {
        id: "task_manage_tags",
        name: "Gán tag / Label / Milestone",
        description: "Tạo nhãn phân loại công việc và thiết lập cột mốc quan trọng.",
      },
    ],
  },
];

export const initialMatrixState: MatrixState = {
  // Owner has ALL permissions true
  owner: {
    workspace_config: true,
    workspace_billing: true,
    workspace_integrations: true,
    workspace_audit_log: true,
    member_invite: true,
    member_role_change: true,
    member_remove: true,
    project_create_edit: true,
    project_delete: true,
    project_template_custom_fields: true,
    task_create_edit: true,
    task_delete: true,
    task_comment_attachment: true,
    task_manage_tags: true,
  },
  // Admin permissions
  admin: {
    workspace_config: true,
    workspace_billing: false,
    workspace_integrations: true,
    workspace_audit_log: true,
    member_invite: true,
    member_role_change: true,
    member_remove: true,
    project_create_edit: true,
    project_delete: true,
    project_template_custom_fields: true,
    task_create_edit: true,
    task_delete: true,
    task_comment_attachment: true,
    task_manage_tags: true,
  },
  // Member permissions
  member: {
    workspace_config: false,
    workspace_billing: false,
    workspace_integrations: false,
    workspace_audit_log: false,
    member_invite: false,
    member_role_change: false,
    member_remove: false,
    project_create_edit: true,
    project_delete: false,
    project_template_custom_fields: false,
    task_create_edit: true,
    task_delete: false,
    task_comment_attachment: true,
    task_manage_tags: true,
  },
  // Guest permissions
  guest: {
    workspace_config: false,
    workspace_billing: false,
    workspace_integrations: false,
    workspace_audit_log: false,
    member_invite: false,
    member_role_change: false,
    member_remove: false,
    project_create_edit: false,
    project_delete: false,
    project_template_custom_fields: false,
    task_create_edit: false,
    task_delete: false,
    task_comment_attachment: true,
    task_manage_tags: false,
  },
  // Project Lead (Custom Role)
  project_lead: {
    workspace_config: false,
    workspace_billing: false,
    workspace_integrations: false,
    workspace_audit_log: true,
    member_invite: true,
    member_role_change: false,
    member_remove: false,
    project_create_edit: true,
    project_delete: false,
    project_template_custom_fields: true,
    task_create_edit: true,
    task_delete: true,
    task_comment_attachment: true,
    task_manage_tags: true,
  },
};

export const mockProjectOverrides: ProjectPermissionOverride[] = [
  {
    id: "override-1",
    projectId: "proj-core-engine",
    projectName: "Dự án Core Engine V2 (Bảo mật)",
    roleKey: "member",
    permissionId: "project_delete",
    permissionName: "Xóa Dự án",
    accessState: "deny",
  },
  {
    id: "override-2",
    projectId: "proj-financial-report",
    projectName: "Báo cáo Tài chính Q3/2026",
    roleKey: "guest",
    permissionId: "task_comment_attachment",
    permissionName: "Bình luận & Đính kèm tệp",
    accessState: "deny",
  },
];

export const mockWorkspaceProjectsList = [
  { id: "proj-core-engine", name: "Dự án Core Engine V2 (Bảo mật)" },
  { id: "proj-financial-report", name: "Báo cáo Tài chính Q3/2026" },
  { id: "proj-marketing-launch", name: "Chiến dịch Launch Product Q4" },
  { id: "proj-mobile-app", name: "Ứng dụng TaskFlow Mobile React Native" },
];
