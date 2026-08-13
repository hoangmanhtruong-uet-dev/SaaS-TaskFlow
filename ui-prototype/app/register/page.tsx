import { Brand } from "@/app/components/layout/brand";
import { ButtonLink } from "@/app/components/ui";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { UserCheck } from "lucide-react";
export const metadata = { title: "Bắt đầu" };
export default function RegisterPage() { return <main className="auth-stage"><section className="auth-card"><Brand /><span className="auth-icon"><UserCheck /></span><h1>Bắt đầu với TaskFlow</h1><p>Xác thực danh tính để tạo hồ sơ và workspace đầu tiên. Không cần tạo thêm một mật khẩu.</p><ButtonLink href={chatGPTSignInPath("/auth/complete")}>Xác thực và tiếp tục</ButtonLink><p className="auth-foot">Bằng việc tiếp tục, bạn đồng ý với điều khoản và chính sách quyền riêng tư.</p></section></main>; }
