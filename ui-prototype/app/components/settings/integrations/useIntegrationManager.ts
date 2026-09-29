import { useState, useCallback, useMemo } from "react";
import {
  IntegrationApp,
  WebhookEndpoint,
  ApiKeyItem,
  AppCategory,
  ToastNotice,
  SlackConfig,
  GithubConfig,
} from "./types";
import {
  initialAppsList,
  initialWebhooks,
  initialApiKeys,
} from "./constants";

export function useIntegrationManager() {
  const [apps, setApps] = useState<IntegrationApp[]>(initialAppsList);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(initialWebhooks);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(initialApiKeys);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("all");

  // Modals & Connecting States
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null);
  const [activeConfigAppId, setActiveConfigAppId] = useState<string | null>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [newCreatedRawKey, setNewCreatedRawKey] = useState<string | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  // Toast Helper
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now().toString();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 3500);
    },
    []
  );

  // Filtered Apps List
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [apps, searchQuery, selectedCategory]);

  // 1. OAuth Flow Simulation
  const connectApp = (appId: string) => {
    setConnectingAppId(appId);
    showToast(`Đang khởi tạo xác thực OAuth2 cho ${appId.toUpperCase()}...`, "info");

    setTimeout(() => {
      setApps((prev) =>
        prev.map((app) => {
          if (app.id === appId) {
            return {
              ...app,
              isConnected: true,
              isEnabled: true,
              installedAt: new Date().toLocaleDateString("vi-VN"),
            };
          }
          return app;
        })
      );
      setConnectingAppId(null);
      setActiveConfigAppId(appId);
      showToast(`Kết nối thành công ứng dụng ${appId.toUpperCase()}!`, "success");
    }, 1800);
  };

  const disconnectApp = (appId: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            isConnected: false,
            isEnabled: false,
          };
        }
        return app;
      })
    );
    if (activeConfigAppId === appId) {
      setActiveConfigAppId(null);
    }
    showToast(`Đã ngắt kết nối tích hợp ${appId.toUpperCase()}`, "info");
  };

  const toggleAppSwitch = (appId: string, enabled: boolean) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return { ...app, isEnabled: enabled };
        }
        return app;
      })
    );
    showToast(
      enabled
        ? `Đã bật tích hợp ${appId.toUpperCase()}`
        : `Đã tạm dừng tích hợp ${appId.toUpperCase()}`,
      "info"
    );
  };

  // 2. Config Updaters
  const updateSlackConfig = (newConfig: SlackConfig) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === "slack") {
          return {
            ...app,
            config: {
              ...app.config,
              slack: newConfig,
            },
          };
        }
        return app;
      })
    );
    showToast("Đã lưu cấu hình Kênh thông báo Slack!", "success");
  };

  const updateGithubConfig = (newConfig: GithubConfig) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === "github") {
          return {
            ...app,
            config: {
              ...app.config,
              github: newConfig,
            },
          };
        }
        return app;
      })
    );
    showToast("Đã lưu cấu hình đồng bộ GitHub Repository!", "success");
  };

  // 3. Webhook Handlers
  const createWebhook = (name: string, targetUrl: string, selectedEvents: string[]) => {
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      showToast("Target URL phải bắt đầu bằng http:// hoặc https://", "error");
      return;
    }

    const randomSecret = `whsec_${Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    const newEndpoint: WebhookEndpoint = {
      id: `wh-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      targetUrl,
      secret: randomSecret,
      events: selectedEvents,
      status: "active",
      createdDate: new Date().toLocaleDateString("vi-VN"),
      lastResponseStatus: 200,
      lastResponseTimeMs: 38,
    };

    setWebhooks((prev) => [newEndpoint, ...prev]);
    setIsWebhookModalOpen(false);
    showToast(`Đã tạo Webhook "${name}" thành công!`, "success");
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    showToast("Đã xóa Webhook Endpoint", "info");
  };

  const testWebhookPing = (id: string) => {
    setTestingWebhookId(id);
    showToast("Đang phát sự kiện ping thử nghiệm đến Webhook URL...", "info");

    setTimeout(() => {
      const isSuccess = Math.random() > 0.15; // 85% success chance
      setWebhooks((prev) =>
        prev.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              lastTriggeredAt: new Date().toLocaleString("vi-VN"),
              lastResponseStatus: isSuccess ? 200 : 500,
              lastResponseTimeMs: Math.floor(30 + Math.random() * 70),
            };
          }
          return w;
        })
      );
      setTestingWebhookId(null);
      if (isSuccess) {
        showToast("Webhook Ping thành công! HTTP Response: 200 OK (38ms)", "success");
      } else {
        showToast("Webhook Ping thất bại! Server trả về HTTP 500 Error", "error");
      }
    }, 1500);
  };

  // 4. API Key Handlers
  const createApiKey = (name: string, scope: "read" | "read_write" | "admin") => {
    const rawSecret = `tf_live_${Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;
    const masked = `tf_live_••••••••${rawSecret.slice(-4)}`;

    const newKeyItem: ApiKeyItem = {
      id: `key-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      keyMasked: masked,
      rawKey: rawSecret,
      scope,
      createdDate: new Date().toLocaleDateString("vi-VN"),
      lastUsedAt: "Vừa khởi tạo",
    };

    setApiKeys((prev) => [newKeyItem, ...prev]);
    setNewCreatedRawKey(rawSecret);
    showToast(`Đã cấp phát API Key "${name}"!`, "success");
  };

  const revokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    showToast("Đã thu hồi (Revoke) API Key", "info");
  };

  return {
    apps,
    filteredApps,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    connectingAppId,
    activeConfigAppId,
    setActiveConfigAppId,
    webhooks,
    apiKeys,
    isWebhookModalOpen,
    setIsWebhookModalOpen,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    newCreatedRawKey,
    setNewCreatedRawKey,
    testingWebhookId,
    toast,
    // Actions & Updaters
    connectApp,
    disconnectApp,
    toggleAppSwitch,
    updateSlackConfig,
    updateGithubConfig,
    createWebhook,
    deleteWebhook,
    testWebhookPing,
    createApiKey,
    revokeApiKey,
    showToast,
  };
}
