export type BrowserPermissionState = "default" | "granted" | "denied";

export type SoundChimeOption = "default" | "subtle" | "chime";

export interface PushChannelState {
  browserEnabled: boolean;
  permission: BrowserPermissionState;
  soundEnabled: boolean;
  soundChime: SoundChimeOption;
}

export type EmailDigestFrequency = "realtime" | "hourly" | "daily" | "off";

export interface EmailDigestSettings {
  frequency: EmailDigestFrequency;
  dailyTime: string; // e.g. "08:00"
}

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string; // e.g. "22:00"
  endTime: string; // e.g. "07:00"
  disableWeekends: boolean;
}

export type NotificationChannel = "email" | "inApp" | "push" | "slack";

export interface NotificationMatrixRow {
  id: string;
  category: "Task" | "Project";
  eventName: string;
  description: string;
  email: boolean;
  inApp: boolean;
  push: boolean;
  slack: boolean;
}

export interface SlackIntegrationSettings {
  channel: string;
  webhookConfigured: boolean;
}

export interface NotificationFormState {
  pushChannels: PushChannelState;
  emailDigest: EmailDigestSettings;
  quietHours: QuietHoursSettings;
  matrix: NotificationMatrixRow[];
  slack: SlackIntegrationSettings;
}
