import { Brand } from "@/app/components/layout/brand";
import { ButtonLink } from "@/app/components/ui";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { ShieldCheck } from "lucide-react";
export const metadata = { title: "Đăng nhập" };
export default function LoginPage() { return <main className="auth-stage"><section className="auth-card"><Brand /><span className="auth-icon"><ShieldCheck /></span><h1>Đăng nhập TaskFlow</h1><p>Identity được xác thực an toàn bởi nền tảng. TaskFlow không nhận hoặc lưu mật khẩu của bạn.</p><ButtonLink href={chatGPTSignInPath("/auth/complete")}>Tiếp tục với ChatGPT</ButtonLink><p className="auth-foot">Chưa có hồ sơ TaskFlow? Hồ sơ sẽ được tạo ở lần đăng nhập đầu tiên.</p></section></main>; }
