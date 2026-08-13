import { Brand } from "@/app/components/layout/brand";
import { AuthForm } from "@/app/components/auth-form";
import { UserCheck } from "lucide-react";
export const metadata = { title: "Bắt đầu" };
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const { next } = await searchParams; return <main className="auth-stage"><section className="auth-card"><Brand /><span className="auth-icon"><UserCheck /></span><h1>Bắt đầu với TaskFlow</h1><p>Tạo tài khoản bằng email hoặc Google. Bạn cần xác minh email trước khi vào workspace.</p><AuthForm mode="register" next={next} /></section></main>; }
