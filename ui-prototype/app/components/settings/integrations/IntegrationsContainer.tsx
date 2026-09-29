"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useIntegrationManager } from "./useIntegrationManager";
import { IntegrationsHeaderNav } from "./IntegrationsHeaderNav";
import { SearchFilterBar } from "./SearchFilterBar";
import { IntegrationGridCards } from "./IntegrationGridCards";
import { IntegrationConfigModal } from "./IntegrationConfigModal";
import { OutgoingWebhooksCard } from "./OutgoingWebhooksCard";
import { CreateWebhookModal } from "./CreateWebhookModal";
import { DeveloperApiKeysCard } from "./DeveloperApiKeysCard";
import { CreateApiKeyModal } from "./CreateApiKeyModal";

export const IntegrationsContainer: React.FC = () => {
  const {
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
    // Actions
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
  } = useIntegrationManager();

  const activeAppObj = apps.find((a) => a.id === activeConfigAppId) || null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 relative pb-28">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : toast.type === "error"
              ? "bg-red-950 border-red-700 text-red-200"
              : "bg-indigo-950 border-indigo-700 text-indigo-200"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Navigation & Segmented Tabs */}
        <IntegrationsHeaderNav />

        {/* Khối 1: Lọc & Tìm kiếm Ứng dụng */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalAppsCount={filteredApps.length}
        />

        {/* Khối 2: Danh mục Thẻ Ứng dụng Tích hợp */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold text-zinc-300">
              Danh mục Ứng dụng Tích hợp ({filteredApps.length}):
            </span>
            <span>Hiển thị theo bộ lọc danh mục</span>
          </div>

          <IntegrationGridCards
            apps={filteredApps}
            connectingAppId={connectingAppId}
            onConnectApp={connectApp}
            onOpenConfigModal={(appId) => setActiveConfigAppId(appId)}
            onToggleSwitch={toggleAppSwitch}
          />
        </div>

        {/* Khối 4: Quản lý Outgoing Webhooks */}
        <OutgoingWebhooksCard
          webhooks={webhooks}
          testingWebhookId={testingWebhookId}
          onOpenCreateModal={() => setIsWebhookModalOpen(true)}
          onDeleteWebhook={deleteWebhook}
          onTestPing={testWebhookPing}
        />

        {/* Khối 5: Quản lý Developer API Keys */}
        <DeveloperApiKeysCard
          apiKeys={apiKeys}
          onOpenCreateModal={() => setIsApiKeyModalOpen(true)}
          onRevokeKey={revokeApiKey}
        />
      </div>

      {/* Khối 3: Modal Cấu hình Tích hợp Chi tiết */}
      <IntegrationConfigModal
        app={activeAppObj}
        onClose={() => setActiveConfigAppId(null)}
        onDisconnect={disconnectApp}
        onUpdateSlackConfig={updateSlackConfig}
        onUpdateGithubConfig={updateGithubConfig}
      />

      {/* Modal Tạo Outgoing Webhook Endpoint */}
      <CreateWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onCreateWebhook={createWebhook}
      />

      {/* Modal Cấp phát API Key Mới */}
      <CreateApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onCreateKey={createApiKey}
        createdRawKey={newCreatedRawKey}
        onClearRawKey={() => setNewCreatedRawKey(null)}
      />
    </div>
  );
};
