 
"use client";

import React from "react";
import { Link2, Check } from "lucide-react";
import { ConnectedAccount } from "./types";

interface ConnectedAccountsCardProps {
  accounts: ConnectedAccount[];
  onToggleConnect: (accountId: string) => void;
}

// Brand SVGs
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5 fill-current text-zinc-100" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#7FBA00" d="M13 1h10v10H13z" />
    <path fill="#00A4EF" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

export const ConnectedAccountsCard: React.FC<ConnectedAccountsCardProps> = ({
  accounts,
  onToggleConnect,
}) => {
  const renderProviderIcon = (provider: string) => {
    if (provider === "google") return <GoogleIcon />;
    if (provider === "github") return <GitHubIcon />;
    return <MicrosoftIcon />;
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <span>Tài khoản đã liên kết (SSO Login)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cho phép đăng nhập nhanh 1-Click bằng tài khoản Google, GitHub hoặc Microsoft
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                {renderProviderIcon(acc.provider)}
              </div>

              <div>
                <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
                  <span>{acc.providerName}</span>
                  {acc.connected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.2 rounded-full">
                      <Check className="w-3 h-3" />
                      Đã kết nối
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  {acc.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleConnect(acc.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                acc.connected
                  ? "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
              }`}
            >
              {acc.connected ? "Hủy kết nối" : "Liên kết ngay"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
