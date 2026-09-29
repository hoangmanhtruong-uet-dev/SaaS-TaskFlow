export type AppCategory = "all" | "communication" | "developer" | "automation" | "cloud_design";

export interface SlackConfig {
  workspaceName: string;
  connectedAccountEmail: string;
  selectedChannel: string;
  notifyOnTaskAssign: boolean;
  notifyOnTaskOverdue: boolean;
  notifyOnMention: boolean;
}

export interface GithubConfig {
  connectedUser: string;
  repoName: string;
  autoCloseOnPRMerge: boolean;
  prKeywords: string[];
  syncIssueComments: boolean;
}

export interface IntegrationApp {
  id: string;
  name: string;
  category: AppCategory;
  description: string;
  iconUrl: string;
  iconBg: string;
  isConnected: boolean;
  isEnabled: boolean;
  installedAt?: string;
  config?: {
    slack?: SlackConfig;
    github?: GithubConfig;
    [key: string]: unknown;
  };
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  targetUrl: string;
  secret: string;
  events: string[];
  status: "active" | "inactive";
  createdDate: string;
  lastTriggeredAt?: string;
  lastResponseStatus?: number;
  lastResponseTimeMs?: number;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string; // e.g. "tf_live_••••••••38a9"
  rawKey?: string; // Only present right after creation
  scope: "read" | "read_write" | "admin";
  createdDate: string;
  lastUsedAt?: string;
}

export interface ToastNotice {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
