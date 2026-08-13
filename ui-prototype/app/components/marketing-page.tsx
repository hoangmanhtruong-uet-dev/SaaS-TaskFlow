import { ArrowRight, Bell, Columns3, History, LockKeyhole, MessageCircle, ShieldCheck, UserCheck } from "lucide-react";
import { Badge, ButtonLink, Card } from "./ui";
import { PublicShell } from "./layout/public-shell";

const features = [
  [Columns3, "Board Kanban", "Theo dõi công việc qua một quy trình trực quan."],
  [UserCheck, "Phân quyền rõ ràng", "Owner, Admin, Member và Guest theo đúng phạm vi."],
  [MessageCircle, "Trao đổi đúng ngữ cảnh", "Bình luận và nhắc tên ngay tại công việc."],
  [History, "Lịch sử hoạt động", "Theo dõi thay đổi quan trọng trong workspace."],
  [Bell, "Thông báo tập trung", "Không bỏ lỡ assignment, mention và deadline."],
  [ShieldCheck, "Cách ly workspace", "Mọi truy vấn đều được giới hạn theo tenant."],
] as const;

const content = {
  features: ["TÍNH NĂNG MVP", "Một nơi để đội nhóm đưa công việc tới hoàn thành", "Workspace, dự án, board, task và quyền truy cập trong cùng một luồng."],
  solutions: ["GIẢI PHÁP", "Một nhịp làm việc cho mọi đội nhóm", "Giữ quy trình rõ ràng từ kế hoạch đến bàn giao."],
  resources: ["TÀI NGUYÊN", "Bắt đầu nhanh, vận hành đúng", "Hướng dẫn thực hành cho workspace, dự án, board và công việc."],
  security: ["BẢO MẬT", "Dữ liệu đúng workspace, đúng người", "Kiểm tra identity, membership, role và project access trên mỗi luồng quan trọng."],
} as const;

export function MarketingHome() {
  return <PublicShell><section className="home-hero production-hero"><div><Badge>TASKFLOW MVP</Badge><h1>Mọi việc rõ ràng.<br /><em>Mọi đội nhóm đồng bộ.</em></h1><p>Quản lý workspace, dự án và từng công việc trong một luồng tập trung, an toàn và dễ vận hành.</p><div className="hero-actions"><ButtonLink href="/register">Bắt đầu miễn phí <ArrowRight size={17} /></ButtonLink><ButtonLink href="/features" variant="secondary">Khám phá TaskFlow</ButtonLink></div></div><div className="production-board" aria-label="Minh họa board"><strong>Website Redesign</strong>{["Backlog", "Đang làm", "Hoàn thành"].map((name, index) => <Card key={name}><small>{name}</small><h3>{["Viết nội dung", "Review component", "Thiết lập routes"][index]}</h3><Badge tone={index === 2 ? "green" : "gray"}>{index === 2 ? "Xong" : "Đang mở"}</Badge></Card>)}</div></section><section className="section-heading"><Badge>THIẾT KẾ ĐỂ TẬP TRUNG</Badge><h2>Từ ý tưởng đến hoàn thành, trong một nơi</h2></section><FeatureCards /><section className="cta"><h2>Bắt đầu tổ chức công việc tốt hơn.</h2><p>Tạo workspace đầu tiên trong vài phút.</p><ButtonLink href="/register" variant="secondary">Tạo tài khoản</ButtonLink></section></PublicShell>;
}

export function MarketingDetail({ kind }: { kind: keyof typeof content }) {
  const [eyebrow, title, body] = content[kind];
  return <PublicShell><section className="hero"><Badge>{eyebrow}</Badge><h1>{title}</h1><p>{body}</p><div className="hero-actions"><ButtonLink href="/register">Bắt đầu miễn phí</ButtonLink><ButtonLink href="/pricing" variant="secondary">Xem bảng giá</ButtonLink></div></section><FeatureCards security={kind === "security"} /></PublicShell>;
}

function FeatureCards({ security = false }: { security?: boolean }) {
  const items = security ? [[ShieldCheck, "Tenant isolation", "Mọi tài nguyên được truy vấn trong workspace context."], [LockKeyhole, "Role & project access", "Quyền được kiểm tra ở backend, không dựa vào trạng thái hiển thị."], [History, "Audit trail", "Hành động quản trị quan trọng có lịch sử truy vết."]] as const : features;
  return <section className="feature-grid">{items.map(([Icon, title, body]) => <Card className="feature-card" key={title}><span><Icon /></span><h3>{title}</h3><p>{body}</p></Card>)}</section>;
}

export function PricingPage() {
  return <PublicShell><section className="hero"><Badge>BẢNG GIÁ MINH BẠCH</Badge><h1>Bắt đầu miễn phí, nâng cấp khi cần</h1><p>Một mức giá nhất quán trên website và ứng dụng.</p></section><section className="pricing-grid"><Card className="plan"><h3>Miễn phí</h3><strong>0đ</strong><ul><li>1 workspace</li><li>5 thành viên</li><li>3 dự án đang hoạt động</li></ul><ButtonLink href="/register">Bắt đầu</ButtonLink></Card><Card className="plan featured"><Badge>PRO</Badge><h3>Chuyên nghiệp</h3><strong>79.000đ<small>/thành viên/tháng</small></strong><ul><li>Dự án không giới hạn</li><li>Phân quyền nâng cao</li><li>Lịch sử hoạt động</li></ul><ButtonLink href="/register">Dùng thử</ButtonLink></Card></section></PublicShell>;
}

export function LegalPage({ title }: { title: string }) {
  return <PublicShell><section className="legal production-legal"><article><Badge>PHÁP LÝ</Badge><h1>{title}</h1><p>Cập nhật ngày 13/08/2026</p><h2>Phạm vi</h2><p>Tài liệu này áp dụng cho website marketing và ứng dụng TaskFlow. Nội dung chính thức sẽ được pháp chế rà soát trước khi thương mại hóa.</p><h2>Dữ liệu và quyền</h2><p>TaskFlow xử lý dữ liệu theo workspace và chỉ cấp quyền dựa trên identity, membership cùng phạm vi dự án.</p></article></section></PublicShell>;
}
