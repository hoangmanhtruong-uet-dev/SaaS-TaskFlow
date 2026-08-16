import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "TaskFlow UI", template: "%s · TaskFlow" },
  description: "TaskFlow — quản lý công việc rõ ràng cho mọi đội nhóm.",
  openGraph: {
    title: "TaskFlow — Mọi việc rõ ràng",
    description: "Quản lý workspace, dự án và công việc trong một luồng tập trung.",
    images: [{ url: "/taskflow-social.png", width: 1536, height: 1024, alt: "TaskFlow Kanban workspace" }],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Per-request CSP nonces require dynamic rendering so Next.js can attach the nonce to framework scripts.
  await connection();
  return <html lang="vi"><body className={geist.variable}>{children}</body></html>;
}
