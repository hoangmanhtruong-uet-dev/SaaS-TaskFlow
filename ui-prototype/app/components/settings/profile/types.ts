export interface UserStatus {
  emoji: string;
  text: string;
  clearAfter: "never" | "1hour" | "today" | "this_week";
}

export interface WorkingSchedule {
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "17:30"
  workingDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
}

export interface LocalPreferences {
  language: "vi" | "en" | "ja";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  firstDayOfWeek: "mon" | "sun";
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface UserProfileForm {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  bio: string;
  timezone: string;
  avatarUrl: string | null;
  status: UserStatus;
  workingSchedule: WorkingSchedule;
  preferences: LocalPreferences;
  socialLinks: SocialLinks;
}

export interface PresetAvatar {
  id: string;
  url: string;
  label: string;
}
