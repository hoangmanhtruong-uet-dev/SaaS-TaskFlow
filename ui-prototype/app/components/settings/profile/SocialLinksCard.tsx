"use client";

import React from "react";
import { Link2, Globe } from "lucide-react";
import { SocialLinks } from "./types";
import { ProfileErrors } from "./useProfileSettings";

// Safe Brand SVGs
const LinkedInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const GitHubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface SocialLinksCardProps {
  socialLinks: SocialLinks;
  errors: ProfileErrors;
  onUpdateSocialLinks: (social: SocialLinks) => void;
}

export const SocialLinksCard: React.FC<SocialLinksCardProps> = ({
  socialLinks,
  errors,
  onUpdateSocialLinks,
}) => {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <span>Liên kết mạng xã hội & Hồ sơ cá nhân</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gắn liên kết LinkedIn, GitHub hoặc website cá nhân để đồng nghiệp dễ tham khảo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* LinkedIn */}
        <div className="space-y-1.5">
          <label htmlFor="socialLinkedIn" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <LinkedInIcon className="w-4 h-4 text-blue-400" />
            <span>Hồ sơ LinkedIn</span>
          </label>
          <input
            id="socialLinkedIn"
            type="url"
            value={socialLinks.linkedin}
            onChange={(e) =>
              onUpdateSocialLinks({ ...socialLinks, linkedin: e.target.value })
            }
            placeholder="https://linkedin.com/in/username"
            className={`w-full bg-zinc-950 border text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
              errors["socialLinks.linkedin"]
                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-zinc-800 focus:border-emerald-500"
            }`}
          />
          {errors["socialLinks.linkedin"] && (
            <p className="text-[11px] text-red-400 font-medium">
              {errors["socialLinks.linkedin"]}
            </p>
          )}
        </div>

        {/* GitHub */}
        <div className="space-y-1.5">
          <label htmlFor="socialGitHub" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <GitHubIcon className="w-4 h-4 text-zinc-200" />
            <span>Tài khoản GitHub</span>
          </label>
          <input
            id="socialGitHub"
            type="url"
            value={socialLinks.github}
            onChange={(e) =>
              onUpdateSocialLinks({ ...socialLinks, github: e.target.value })
            }
            placeholder="https://github.com/username"
            className={`w-full bg-zinc-950 border text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
              errors["socialLinks.github"]
                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-zinc-800 focus:border-emerald-500"
            }`}
          />
          {errors["socialLinks.github"] && (
            <p className="text-[11px] text-red-400 font-medium">
              {errors["socialLinks.github"]}
            </p>
          )}
        </div>

        {/* Portfolio */}
        <div className="space-y-1.5">
          <label htmlFor="socialPortfolio" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>Website Portfolio cá nhân</span>
          </label>
          <input
            id="socialPortfolio"
            type="url"
            value={socialLinks.portfolio}
            onChange={(e) =>
              onUpdateSocialLinks({ ...socialLinks, portfolio: e.target.value })
            }
            placeholder="https://mywebsite.design"
            className={`w-full bg-zinc-950 border text-xs rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none transition-all ${
              errors["socialLinks.portfolio"]
                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-zinc-800 focus:border-emerald-500"
            }`}
          />
          {errors["socialLinks.portfolio"] && (
            <p className="text-[11px] text-red-400 font-medium">
              {errors["socialLinks.portfolio"]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
