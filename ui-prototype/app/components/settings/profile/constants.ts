import { UserProfileForm, PresetAvatar } from "./types";

export const INITIAL_USER_PROFILE: UserProfileForm = {
  fullName: "Hoàng Mạnh Trường",
  email: "hoangmanhtruong@taskflow.io",
  jobTitle: "Lead Product Engineer & UI/UX Architect",
  department: "Phòng Công nghệ & Sản phẩm",
  bio: "Chuyên trách thiết kế trải nghiệm người dùng SaaS, tối ưu hóa giao diện Kanban và xây dựng kiến trúc hệ thống Frontend với Next.js.",
  timezone: "Asia/Ho_Chi_Minh",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  status: {
    emoji: "🌴",
    text: "Đang làm việc tại nhà (WFH)",
    clearAfter: "today",
  },
  workingSchedule: {
    startTime: "08:30",
    endTime: "17:30",
    workingDays: [1, 2, 3, 4, 5], // Mon -> Fri
  },
  preferences: {
    language: "vi",
    dateFormat: "DD/MM/YYYY",
    firstDayOfWeek: "mon",
  },
  socialLinks: {
    linkedin: "https://linkedin.com/in/hoangmanhtruong-dev",
    github: "https://github.com/hoangmanhtruong-uet-dev",
    portfolio: "https://truonghm.design",
  },
};

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: "av-1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    label: "Modern Professional",
  },
  {
    id: "av-2",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    label: "Minimal Tech",
  },
  {
    id: "av-3",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    label: "Creative Lead",
  },
  {
    id: "av-4",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    label: "Dev Ops Specialist",
  },
  {
    id: "av-5",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    label: "QA Engineer",
  },
  {
    id: "av-6",
    url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    label: "System Architect",
  },
  {
    id: "av-7",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    label: "Product Owner",
  },
];

export const WORLDWIDE_TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "(GMT+07:00) Hà Nội, TP. Hồ Chí Minh, Việt Nam" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok, Thái Lan" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore, Kuala Lumpur" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo, Osaka, Nhật Bản" },
  { value: "Asia/Seoul", label: "(GMT+09:00) Seoul, Hàn Quốc" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Sydney, Melbourne, Úc" },
  { value: "UTC", label: "(GMT+00:00) UTC Universal Coordinated Time" },
  { value: "Europe/London", label: "(GMT+01:00) London, Vương Quốc Anh" },
  { value: "Europe/Paris", label: "(GMT+02:00) Paris, Berlin, Rome, Madrid" },
  { value: "America/New_York", label: "(GMT-05:00) New York, Boston (Eastern Time)" },
  { value: "America/Chicago", label: "(GMT-06:00) Chicago, Dallas (Central Time)" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Los Angeles, San Francisco (Pacific Time)" },
];
