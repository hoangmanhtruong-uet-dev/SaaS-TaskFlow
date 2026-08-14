import { KeyRound } from "lucide-react";
import { AuthForm } from "@/app/components/auth-form";
import { Brand } from "@/app/components/layout/brand";
export const metadata = { title: "Mật khẩu mới" };
export default function Page() { return <main className="auth-stage"><section className="auth-card"><Brand /><span className="auth-icon"><KeyRound /></span><h1>Tạo mật khẩu mới</h1><p>Chọn mật khẩu có ít nhất 8 ký tự.</p><AuthForm mode="reset" /></section></main>; }
