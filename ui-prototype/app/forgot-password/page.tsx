import { KeyRound } from "lucide-react";
import { AuthForm } from "@/app/components/auth-form";
import { Brand } from "@/app/components/layout/brand";
export const metadata = { title: "Quên mật khẩu" };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const { next } = await searchParams; return <main className="auth-stage"><section className="auth-card"><Brand /><span className="auth-icon"><KeyRound /></span><h1>Đặt lại mật khẩu</h1><p>Nhập email để nhận liên kết khôi phục bảo mật.</p><AuthForm mode="forgot" next={next} /></section></main>; }
