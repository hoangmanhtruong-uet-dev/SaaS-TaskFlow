import { Brand } from "@/app/components/layout/brand";
import { AuthForm } from "@/app/components/auth-form";
import { ShieldCheck } from "lucide-react";
export const metadata = { title: "Đăng nhập" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const { next } = await searchParams; return <main className="auth-stage"><section className="auth-card"><Brand /><span className="auth-icon"><ShieldCheck /></span><h1>Đăng nhập TaskFlow</h1><p>Dùng email và mật khẩu hoặc tài khoản Google của bạn.</p><AuthForm mode="login" next={next} /></section></main>; }
