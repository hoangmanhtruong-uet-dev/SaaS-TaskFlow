import { PublicShell } from "@/app/components/layout/public-shell";
import { Badge, ButtonLink } from "@/app/components/ui";
export default function Page() { return <PublicShell><section className="hero"><Badge>HỖ TRỢ</Badge><h1>Chúng tôi có thể giúp gì?</h1><p>Tìm câu trả lời về workspace, quyền truy cập và quản lý công việc.</p><ButtonLink href="mailto:support@taskflow.example">Gửi yêu cầu hỗ trợ</ButtonLink></section></PublicShell>; }
