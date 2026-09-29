 
"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- legacy Stitch atlas uses wrapped controls with visible dynamic labels */

import Link from "next/link";
import { useState } from "react";
import {
  Activity, AlertCircle, Archive, ArrowLeft, ArrowRight, Bell, BriefcaseBusiness,
  CalendarDays, Check, CheckCircle2, ChevronDown, CircleUserRound, Clock3, Columns3,
  Cookie, Ellipsis, FileClock, FolderKanban, Gauge, Globe2, GripVertical, HelpCircle,
  History, Home, Inbox, KeyRound, LayoutDashboard, ListFilter, LockKeyhole, LogIn,
  Mail, Menu, MessageCircle, MoreHorizontal, MoveRight, Plus, RefreshCw,
  RotateCcw, Search, Send, Settings, ShieldCheck, Sparkles, Trash2, UserCheck,
  UserCog, UserMinus, UserPlus, Users, WifiOff, X,
} from "lucide-react";
import type { ScreenDefinition } from "../lib/screens";
import { legacyProjects as projects, legacyTasks as tasks } from "../services/fallback-data";

type Tone = "green" | "red" | "amber" | "blue" | "gray";

function Brand() {
  return <Link href="/" className="brand" aria-label="TaskFlow — danh mục UI"><span className="brand-mark"><Check size={15} strokeWidth={3} /></span><span>TaskFlow</span></Link>;
}

function Button({ children, variant = "primary", onClick, type = "button", disabled = false }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean;
}) {
  return <button type={type} className={`button ${variant}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Avatar({ initials = "LA", small = false }: { initials?: string; small?: boolean }) {
  return <span className={`avatar ${small ? "small" : ""}`}>{initials}</span>;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="toast" role="status"><CheckCircle2 size={18} /><span>{message}</span><button onClick={onClose} aria-label="Đóng thông báo"><X size={16} /></button></div>;
}

function Field({ label, placeholder, type = "text", error, value, onChange }: {
  label: string; placeholder?: string; type?: string; error?: string; value?: string; onChange?: (value: string) => void;
}) {
  return <label className="field"><span>{label}</span><input type={type} placeholder={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</label>;
}

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span><span className="select-like">{children}<ChevronDown size={16} /></span></label>;
}

function PublicHeader({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  return <header className="public-header"><Brand /><nav className="desktop-nav" aria-label="Điều hướng marketing">
    <Link href="/screens/36d00f27de814b3c87a87c917d84a8aa">Tính năng</Link>
    <Link href="/screens/7639d87e7fac4c5eb2e1f18e705d5d7e">Giải pháp</Link>
    <Link href="/screens/17537ccb3e7e4a09bbab6d365cc1f0ca">Bảng giá</Link>
    <Link href="/screens/653dd71c587b4f3cb0922f9f080f1a2e">Tài nguyên</Link>
  </nav><div className="header-actions"><Link className="text-link" href="/screens/0e03105a18c24032bd8b7a6ef96f7b9c">Đăng nhập</Link><Link className="button primary" href="/screens/7fae3450223b4902bb645f0475f92534">Bắt đầu miễn phí</Link></div>
  <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu"><Menu /></button>
  {menuOpen && <div className="mobile-menu"><button onClick={() => setMenuOpen(false)} aria-label="Đóng menu"><X /></button><Link href="/screens/9148229d093d498cbdaf50bb14097195">Tính năng</Link><Link href="/screens/5c2dee5dd3224f9c8b0fdda5f5a770b4">Giải pháp</Link><Link href="/screens/13deb9342ee04c69bd973f9ea0075ece">Bảng giá</Link><Link href="/screens/151bb591471d42d19621f6cf8837cefb">Tài nguyên</Link><Link className="button primary" href="/screens/7fae3450223b4902bb645f0475f92534">Bắt đầu miễn phí</Link></div>}
  </header>;
}

function PublicFooter() {
  return <footer className="public-footer"><Brand /><span>© 2026 TaskFlow. Mọi quyền được bảo lưu.</span><nav><Link href="/screens/e3d7227a6833424488747fe6114c1bd9">Chính sách bảo mật</Link><Link href="/screens/ed796724510247d89d3c4be7aca7474e">Điều khoản</Link><Link href="/screens/edfdc7348ccf4fadab694c83b1a2e965">Bảo mật</Link><Link href="/screens/e58895deeb7c42c9a5df0a14a2905d64">Liên hệ</Link></nav></footer>;
}

function BottomNav() {
  const items = [
    [LayoutDashboard, "Tổng quan", "d2bc0a396d0f447eab4c38d4f3be7295"],
    [FolderKanban, "Dự án", "f469e332366447c09510967059f2dc6d"],
    [CheckCircle2, "Việc của tôi", "dc6c7024890f49d1b50c2fc885e6aee4"],
    [Bell, "Thông báo", "a2b1eea9fc854c6d939789712c138f01"],
  ] as const;
  return <nav className="bottom-nav" aria-label="Điều hướng ứng dụng">{items.map(([Icon, label, id]) => <Link href={`/screens/${id}`} key={label}><Icon size={19} /><span>{label}</span></Link>)}</nav>;
}

function AppSidebar() {
  const entries = [[LayoutDashboard, "Tổng quan"], [FolderKanban, "Dự án"], [CheckCircle2, "Việc của tôi"], [Activity, "Hoạt động"], [Users, "Thành viên"], [Settings, "Cài đặt"]] as const;
  return <aside className="app-sidebar"><Brand /><Button><Plus size={17} /> Tạo công việc</Button><nav>{entries.map(([Icon, label], index) => <Link className={index === 0 ? "active" : ""} href="/app" key={label}><Icon size={18} />{label}</Link>)}</nav><div className="sidebar-profile"><Avatar /><span><strong>Lan Anh</strong><small>Chủ sở hữu</small></span><MoreHorizontal size={18} /></div></aside>;
}

function AppFrame({ screen, children, title, back = false }: { screen: ScreenDefinition; children: React.ReactNode; title?: string; back?: boolean }) {
  const desktop = screen.device === "DESKTOP";
  return <div className={`app-stage ${desktop ? "desktop-app" : "mobile-app"}`}>
    {desktop && <AppSidebar />}
    <main className="app-main">
      <header className="app-header">{back ? <button aria-label="Quay lại" onClick={() => history.back()}><ArrowLeft /></button> : <Brand />}<strong>{title}</strong><div className="app-header-actions"><button aria-label="Tìm kiếm"><Search /></button><button aria-label="Thông báo"><Bell /></button><Avatar small /></div></header>
      <div className="app-content">{children}</div>
      {!desktop && !back && <BottomNav />}
    </main>
    <Link className="atlas-link" href="/">89 UI</Link>
  </div>;
}

function MarketingScreen({ screen }: { screen: ScreenDefinition }) {
  const [menuOpen, setMenuOpen] = useState(screen.title.includes("Mobile Menu"));
  const [cookies, setCookies] = useState(screen.title.includes("Cookie Consent"));
  const title = screen.title.toLowerCase();
  let content: React.ReactNode;

  if (title.includes("404")) {
    content = <section className="not-found"><span>404</span><h1>Không tìm thấy trang</h1><p>Trang bạn đang tìm có thể đã được di chuyển hoặc không còn tồn tại.</p><Link className="button primary" href="/">Quay về trang chủ</Link></section>;
  } else if (title.includes("bảng giá")) {
    content = <><Hero eyebrow="BẢNG GIÁ MINH BẠCH" title="Chọn gói phù hợp với đội nhóm" text="Bắt đầu miễn phí. Nâng cấp khi đội nhóm của bạn sẵn sàng." /><section className="pricing-grid"><Plan name="Miễn phí" price="0đ" features={["1 workspace", "Tối đa 5 thành viên", "3 dự án đang hoạt động", "Quản lý task cơ bản"]} /><Plan name="Chuyên nghiệp" price="79.000đ" badge="SẮP RA MẮT" features={["Dự án không giới hạn", "Nhiều workspace", "Phân quyền nâng cao", "Lịch sử hoạt động chi tiết"]} /></section></>;
  } else if (title.includes("chính sách") || title.includes("điều khoản")) {
    const privacy = title.includes("chính sách");
    content = <Legal privacy={privacy} />;
  } else if (title.includes("hỗ trợ")) {
    content = <Support />;
  } else if (title.includes("bảo mật")) {
    content = <><Hero eyebrow="BẢO MẬT TỪ NỀN TẢNG" title="Dữ liệu đúng workspace, đúng người" text="TaskFlow kiểm tra membership, vai trò và quyền truy cập dự án ở mọi luồng quan trọng." /><FeatureGrid items={securityFeatures} /></>;
  } else if (title.includes("giải pháp")) {
    content = <><Hero eyebrow="GIẢI PHÁP" title="Một nhịp làm việc cho mọi đội nhóm" text="Tổ chức dự án rõ ràng mà không tạo thêm gánh nặng vận hành." /><FeatureGrid items={solutionFeatures} /></>;
  } else if (title.includes("tài nguyên")) {
    content = <><Hero eyebrow="TÀI NGUYÊN" title="Bắt đầu nhanh, vận hành đúng" text="Hướng dẫn ngắn gọn cho workspace, dự án, board và công việc." /><FeatureGrid items={resourceFeatures} /></>;
  } else if (title.includes("tính năng")) {
    content = <><Hero eyebrow="TÍNH NĂNG MVP" title="Tất cả để công việc tiến về phía trước" text="Từ workspace đến từng task, TaskFlow giúp đội nhóm thấy rõ việc cần làm và người chịu trách nhiệm." /><FeatureGrid items={productFeatures} /></>;
  } else {
    content = <HomeMarketing />;
  }

  return <div className="marketing"><PublicHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><main>{content}</main><PublicFooter />{cookies && <CookieDialog onClose={() => setCookies(false)} />}<Link className="atlas-link" href="/">89 UI</Link></div>;
}

function Hero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="hero"><Badge>{eyebrow}</Badge><h1>{title}</h1><p>{text}</p><div className="hero-actions"><Link className="button primary" href="/screens/7fae3450223b4902bb645f0475f92534">Bắt đầu miễn phí <ArrowRight size={17} /></Link><Link className="button secondary" href="/screens/9148229d093d498cbdaf50bb14097195">Xem tính năng</Link></div></section>;
}

function HomeMarketing() {
  return <><section className="home-hero"><div><Badge>TASKFLOW MVP</Badge><h1>Mọi việc rõ ràng.<br /><em>Mọi đội nhóm đồng bộ.</em></h1><p>Nền tảng quản lý công việc giúp bạn tổ chức workspace, dự án và từng task trong một luồng tập trung.</p><div className="hero-actions"><Link className="button primary" href="/screens/7fae3450223b4902bb645f0475f92534">Bắt đầu miễn phí <ArrowRight size={17} /></Link><Link className="button secondary" href="/screens/36d00f27de814b3c87a87c917d84a8aa">Khám phá TaskFlow</Link></div><small><CheckCircle2 size={15} /> Không cần thẻ thanh toán</small></div><BoardMock /></section><section className="section-heading"><Badge>ĐƯỢC THIẾT KẾ ĐỂ TẬP TRUNG</Badge><h2>Từ ý tưởng đến hoàn thành, trong một nơi</h2></section><FeatureGrid items={productFeatures.slice(0, 4)} /><section className="cta"><h2>Bắt đầu tổ chức công việc tốt hơn.</h2><p>Tạo workspace đầu tiên trong vài phút.</p><Link className="button secondary" href="/screens/7fae3450223b4902bb645f0475f92534">Tạo tài khoản</Link></section></>;
}

const productFeatures = [
  [BriefcaseBusiness, "Nhiều workspace", "Tách biệt dữ liệu theo đội nhóm hoặc khách hàng."],
  [Columns3, "Board Kanban", "Theo dõi công việc qua Backlog, Đang làm, Review và Hoàn thành."],
  [UserCheck, "Phân quyền rõ ràng", "Chủ sở hữu, Quản trị viên, Thành viên và Khách."],
  [MessageCircle, "Trao đổi đúng ngữ cảnh", "Bình luận và nhắc tên ngay tại công việc."],
  [History, "Lịch sử hoạt động", "Biết ai đã thay đổi điều gì và vào lúc nào."],
  [Bell, "Thông báo trong ứng dụng", "Không bỏ lỡ assignment, mention và deadline."],
] as const;
const securityFeatures = [[ShieldCheck, "Cách ly workspace", "Mỗi request được kiểm tra membership trước khi truy cập dữ liệu."], [LockKeyhole, "Quyền theo vai trò", "Hành động nhạy cảm chỉ xuất hiện khi người dùng có quyền."], [FileClock, "Audit không chỉnh sửa", "Các sự kiện nghiệp vụ quan trọng được lưu lại rõ ràng."], [KeyRound, "Phiên đăng nhập", "Người dùng có thể kiểm tra và thu hồi phiên đang hoạt động."]] as const;
const solutionFeatures = [[Sparkles, "Startup", "Thiết lập quy trình nhanh mà không cần quản trị phức tạp."], [Gauge, "Product team", "Theo dõi backlog, tiến độ và người phụ trách trên một board."], [BriefcaseBusiness, "Agency", "Tách workspace và project cho từng khách hàng."], [Users, "Đội nhóm phân tán", "Comment, mention và notification giữ mọi người cùng nhịp."]] as const;
const resourceFeatures = [[Home, "Bắt đầu với TaskFlow", "Tạo tài khoản, workspace và dự án đầu tiên."], [FolderKanban, "Quản lý dự án", "Thiết lập board, column và quyền truy cập."], [CheckCircle2, "Quản lý công việc", "Tạo, giao việc, đặt hạn và theo dõi tiến độ."], [HelpCircle, "Trung tâm hỗ trợ", "Tìm câu trả lời hoặc gửi yêu cầu hỗ trợ."]] as const;

function FeatureGrid({ items }: { items: readonly (readonly [React.ComponentType<{ size?: number }>, string, string])[] }) {
  return <section className="feature-grid">{items.map(([Icon, title, text]) => <article className="feature-card" key={title}><span><Icon size={21} /></span><h3>{title}</h3><p>{text}</p><Link href="/features">Tìm hiểu thêm <ArrowRight size={15} /></Link></article>)}</section>;
}

function BoardMock() {
  return <div className="board-mock"><div className="mock-top"><span /><span /><span /><b>Website Redesign</b><Ellipsis /></div><div className="mock-columns">{["Backlog", "Đang làm", "Hoàn thành"].map((column, index) => <div key={column}><strong>{column}<Badge tone="gray">{index + 2}</Badge></strong>{tasks.slice(index === 2 ? 1 : 0, index === 0 ? 3 : 2).map((task) => <div className="mock-task" key={task.title}><Badge tone={task.tone}>{task.priority}</Badge><b>{task.title}</b><span><Clock3 size={13} /> {task.due}<Avatar small initials={index === 1 ? "MN" : "LA"} /></span></div>)}</div>)}</div></div>;
}

function Plan({ name, price, features, badge }: { name: string; price: string; features: string[]; badge?: string }) {
  return <article className={`plan ${badge ? "featured" : ""}`}>{badge && <Badge>{badge}</Badge>}<h3>{name}</h3><p>Dành cho cá nhân và đội nhóm đang phát triển.</p><strong>{price}<small>/thành viên/tháng</small></strong><ul>{features.map((feature) => <li key={feature}><CheckCircle2 size={17} />{feature}</li>)}</ul><Button variant={badge ? "primary" : "secondary"}>{badge ? "Nhận thông báo khi ra mắt" : "Bắt đầu ngay"}</Button></article>;
}

function Legal({ privacy }: { privacy: boolean }) {
  const sections = privacy ? ["Dữ liệu chúng tôi thu thập", "Cách sử dụng dữ liệu", "Chia sẻ thông tin", "Bảo mật dữ liệu", "Quyền của bạn"] : ["Tài khoản", "Sử dụng dịch vụ", "Thanh toán", "Nội dung người dùng", "Giới hạn trách nhiệm"];
  return <section className="legal"><aside><strong>Mục lục</strong>{sections.map((section, index) => <a href={`#s${index}`} key={section}>{index + 1}. {section}</a>)}</aside><article><Badge>CẬP NHẬT 13/08/2026</Badge><h1>{privacy ? "Chính sách bảo mật" : "Điều khoản dịch vụ"}</h1><p>Tài liệu này giải thích cách TaskFlow vận hành và bảo vệ quyền lợi của bạn khi sử dụng dịch vụ.</p>{sections.map((section, index) => <section id={`s${index}`} key={section}><h2>{index + 1}. {section}</h2><p>TaskFlow chỉ xử lý thông tin cần thiết để cung cấp tính năng quản lý công việc. Quyền truy cập luôn được giới hạn theo workspace, vai trò và dự án được cấp.</p><p>Yêu cầu xóa dữ liệu được xác nhận lại và áp dụng thời gian chờ nhằm tránh thao tác ngoài ý muốn.</p></section>)}</article></section>;
}

function Support() {
  const [sent, setSent] = useState(false);
  return <section className="support"><div><Badge>HỖ TRỢ</Badge><h1>Chúng tôi ở đây để giúp đỡ</h1><p>Gửi yêu cầu và đội ngũ TaskFlow sẽ phản hồi qua email.</p><article className="contact-card"><Mail /><span><strong>Email hỗ trợ</strong><a href="mailto:support@taskflow.app">support@taskflow.app</a></span></article></div>{sent ? <article className="success-card"><CheckCircle2 /><h2>Đã gửi yêu cầu</h2><p>Cảm ơn bạn. Chúng tôi sẽ phản hồi sớm nhất có thể.</p><Button onClick={() => setSent(false)}>Gửi yêu cầu khác</Button></article> : <form className="support-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><Field label="Họ và tên" placeholder="Nguyễn Văn A" /><Field label="Email" placeholder="ban@congty.vn" type="email" /><SelectField label="Chủ đề">Lỗi kỹ thuật</SelectField><label className="field"><span>Nội dung chi tiết</span><textarea placeholder="Mô tả vấn đề bạn đang gặp..." /></label><Button type="submit">Gửi yêu cầu <Send size={16} /></Button></form>}</section>;
}

function CookieDialog({ onClose }: { onClose: () => void }) {
  return <div className="cookie-overlay" role="dialog" aria-modal="true" aria-label="Tùy chọn cookie"><div className="cookie-dialog"><span><Cookie /></span><div><h2>Quyền riêng tư của bạn</h2><p>Chúng tôi sử dụng cookie cần thiết để TaskFlow hoạt động. Cookie phân tích chỉ được bật khi bạn đồng ý.</p></div><div className="cookie-actions"><Button onClick={onClose}>Chấp nhận tất cả</Button><Button variant="secondary" onClick={onClose}>Chỉ cookie cần thiết</Button><Button variant="ghost">Tùy chỉnh</Button></div></div></div>;
}

function AuthScreen({ screen }: { screen: ScreenDefinition }) {
  const title = screen.title.toLowerCase();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const action = (message = "Đã xử lý yêu cầu") => { setLoading(true); window.setTimeout(() => { setLoading(false); setDone(true); }, 650); return message; };
  if (title.includes("lời mời") && !title.includes("trạng thái")) return <InviteAccept screen={screen} />;
  if (title.includes("trạng thái lời mời")) return <InviteStates screen={screen} />;
  if (title.includes("bắt đầu")) return <StartChoice screen={screen} />;
  const isRegister = title.includes("đăng ký") || title.includes("sign up");
  const isForgot = title.includes("quên mật khẩu");
  const isReset = title.includes("đặt lại mật khẩu");
  const isVerify = title.includes("xác minh");
  const isExpired = title.includes("liên kết");
  const heading = isRegister ? "Tạo tài khoản" : isForgot ? "Quên mật khẩu?" : isReset ? "Đặt lại mật khẩu" : isVerify ? "Xác minh email" : isExpired ? "Liên kết đã hết hạn" : "Đăng nhập";
  return <div className="auth-stage"><Link className="atlas-link" href="/">89 UI</Link><div className="auth-card"><Brand /><div className="auth-icon">{isExpired ? <AlertCircle /> : isVerify ? <Mail /> : isReset ? <KeyRound /> : <LogIn />}</div><h1>{heading}</h1><p>{isForgot ? "Nhập email để nhận hướng dẫn đặt lại mật khẩu." : isVerify ? "Chúng tôi đã gửi liên kết xác minh đến email của bạn." : isExpired ? "Vui lòng yêu cầu một liên kết mới để tiếp tục." : "Quản lý công việc với một luồng rõ ràng."}</p>{done && <div className="inline-success"><CheckCircle2 /> Yêu cầu đã được xử lý thành công.</div>}{!isVerify && !isExpired && <form onSubmit={(event) => { event.preventDefault(); action(); }}>{isRegister && <Field label="Họ và tên" placeholder="Nguyễn Văn A" />}<Field label="Email công việc" placeholder="ban@congty.vn" type="email" value={email} onChange={setEmail} error={email && !email.includes("@") ? "Email chưa đúng định dạng" : undefined} />{!isForgot && <Field label={isReset ? "Mật khẩu mới" : "Mật khẩu"} placeholder="Tối thiểu 8 ký tự" type="password" />}{isReset && <Field label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" type="password" />}{isRegister && <label className="check-line"><input type="checkbox" /> Tôi đồng ý với Điều khoản và Chính sách bảo mật.</label>}<Button type="submit" disabled={loading}>{loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : isForgot ? "Gửi hướng dẫn" : isReset ? "Lưu mật khẩu" : "Đăng nhập"} <ArrowRight size={16} /></Button></form>}{(isVerify || isExpired) && <Button onClick={() => action()} disabled={loading}>{loading ? "Vui lòng chờ 30 giây" : "Gửi lại email xác minh"}</Button>}<div className="auth-foot">{isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}<Link href={`/screens/${isRegister ? "0e03105a18c24032bd8b7a6ef96f7b9c" : "7fae3450223b4902bb645f0475f92534"}`}>{isRegister ? "Đăng nhập" : "Đăng ký"}</Link></div></div></div>;
}

function InviteAccept({ screen }: { screen: ScreenDefinition }) {
  void screen;
  const [toast, setToast] = useState("");
  return <div className="auth-stage"><Link className="atlas-link" href="/">89 UI</Link><div className="invite-card"><Brand /><div className="workspace-logo">PA</div><Badge>LỜI MỜI WORKSPACE</Badge><h1>Tham gia Project Alpha</h1><p><strong>Nguyễn Văn A</strong> mời bạn cộng tác trong workspace.</p><div className="invite-detail"><span>Email được mời<strong>lan@company.vn</strong></span><span>Vai trò<strong>Thành viên</strong></span><span>Quyền truy cập<strong>Xem, tạo và chỉnh sửa công việc</strong></span></div><small><Clock3 /> Lời mời hết hạn sau 5 ngày</small><Button onClick={() => setToast("Đã chấp nhận lời mời")}>Chấp nhận lời mời</Button><Button variant="secondary" onClick={() => setToast("Đã từ chối lời mời")}>Từ chối</Button>{toast && <Toast message={toast} onClose={() => setToast("")} />}</div></div>;
}

function InviteStates({ screen }: { screen: ScreenDefinition }) {
  void screen;
  const variants = [
    [CheckCircle2, "Đã tham gia workspace", "Bạn đã có thể bắt đầu cộng tác.", "green"],
    [Clock3, "Lời mời đã hết hạn", "Yêu cầu quản trị viên gửi lời mời mới.", "amber"],
    [AlertCircle, "Lời mời đã bị thu hồi", "Liên hệ người mời nếu bạn cần quyền truy cập.", "red"],
    [CircleUserRound, "Không đúng tài khoản", "Đăng nhập bằng email lan@company.vn.", "blue"],
  ] as const;
  return <div className="auth-stage"><Link className="atlas-link" href="/">89 UI</Link><div className="state-stack"><Brand /><h1>Trạng thái lời mời</h1>{variants.map(([Icon, heading, text, tone]) => <article className="state-row" key={heading}><span className={`state-icon ${tone}`}><Icon /></span><div><h2>{heading}</h2><p>{text}</p></div><Button variant="ghost">Xử lý</Button></article>)}</div></div>;
}

function StartChoice({ screen }: { screen: ScreenDefinition }) {
  void screen;
  return <div className="auth-stage"><Link className="atlas-link" href="/">89 UI</Link><div className="start-card"><Brand /><span className="success-orb"><Check /></span><h1>Email đã được xác minh</h1><p>Bạn muốn bắt đầu thế nào?</p><article><Avatar initials="PA" /><div><Badge>LỜI MỜI ĐANG CHỜ</Badge><h2>Project Alpha</h2><p>Vai trò Thành viên · Mời bởi Nguyễn Văn A</p></div><Button variant="secondary">Xem lời mời</Button></article><button className="choice-card"><Plus /><span><strong>Tạo workspace mới</strong><small>Thiết lập không gian làm việc của riêng bạn</small></span><ArrowRight /></button></div></div>;
}

function DashboardScreen({ screen }: { screen: ScreenDefinition }) {
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Chào buổi sáng, Lan 👋</p><h1>Tổng quan hôm nay</h1></div><Button><Plus size={16} /> Tạo công việc</Button></div><div className="metric-grid">{[["Việc cần xử lý", "12", AlertCircle, "red"], ["Đúng tiến độ", "8", CheckCircle2, "green"], ["Sắp đến hạn", "5", Clock3, "amber"], ["Hoàn thành", "24", Gauge, "blue"]].map(([label, value, Icon, tone]) => <article className="metric" key={String(label)}><span className={`metric-icon ${tone}`}><Icon /></span><small>{label as string}</small><strong>{value as string}</strong></article>)}</div><section className="dashboard-grid"><div><SectionTitle title="Việc ưu tiên" action="Xem tất cả" />{tasks.slice(0, 2).map((task) => <TaskRow task={task} key={task.title} />)}<SectionTitle title="Dự án đang chạy" /> <div className="project-grid">{projects.slice(0, 2).map((project) => <ProjectCard project={project} key={project.name} />)}</div></div><aside className="activity-panel"><SectionTitle title="Hoạt động gần đây" />{["Minh đã hoàn thành Thiết kế banner", "Hải đã bình luận trong API Specs", "Bạn đã tạo dự án Mobile App MVP"].map((item, index) => <div className="timeline-item" key={item}><Avatar small initials={["MT", "HN", "LA"][index]} /><span><p>{item}</p><small>{index + 1} giờ trước</small></span></div>)}</aside></section></AppFrame>;
}

function SectionTitle({ title, action }: { title: string; action?: string }) { return <div className="section-title"><h2>{title}</h2>{action && <button>{action}</button>}</div>; }
function TaskRow({ task }: { task: typeof tasks[number] }) { return <article className="task-row"><span className={`priority-line ${task.tone}`} /><div><strong>{task.title}</strong><small><FolderKanban size={13} />{task.project}</small></div><Badge tone={task.tone}>{task.priority}</Badge><span className="due"><CalendarDays size={14} />{task.due}</span><Avatar small /></article>; }
function ProjectCard({ project }: { project: typeof projects[number] }) { return <article className="project-card"><div><span className="project-icon"><FolderKanban /></span>{project.private ? <LockKeyhole size={15} /> : <Globe2 size={15} />}</div><h3>{project.name}</h3><p>{project.meta}</p><div className="progress"><span style={{ width: `${project.progress}%` }} /></div><footer><span>{project.progress}%</span><span className="avatar-stack"><Avatar small /><Avatar small initials="MN" /></span></footer></article>; }

function ProjectsScreen({ screen }: { screen: ScreenDefinition }) {
  const archived = screen.title.toLowerCase().includes("lưu trữ");
  const [tab, setTab] = useState(archived ? "archived" : "active");
  const [toast, setToast] = useState("");
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Workspace / Dự án</p><h1>{archived ? "Dự án đã lưu trữ" : "Dự án"}</h1></div><Button><Plus size={16} /> Dự án mới</Button></div><div className="toolbar"><div className="tabs"><button className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>Đang hoạt động</button><button className={tab === "archived" ? "active" : ""} onClick={() => setTab("archived")}>Đã lưu trữ</button></div><label className="search-box"><Search size={17} /><input placeholder="Tìm dự án..." /></label></div><div className="project-list-grid">{(tab === "archived" ? projects.slice(0, 2) : projects).map((project) => <article className="project-list-card" key={project.name}><ProjectCard project={project} />{tab === "archived" && <Button variant="secondary" onClick={() => setToast(`Đã khôi phục ${project.name}`)}><RotateCcw size={15} /> Khôi phục</Button>}</article>)}</div>{toast && <Toast message={toast} onClose={() => setToast("")} />}</AppFrame>;
}

function TasksScreen({ screen }: { screen: ScreenDefinition }) {
  const archived = screen.title.toLowerCase().includes("lưu trữ");
  const [toast, setToast] = useState("");
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Workspace</p><h1>{archived ? "Công việc đã lưu trữ" : "Việc của tôi"}</h1></div>{archived && <Button variant="secondary"><ListFilter size={16} /> Bộ lọc</Button>}</div><label className="search-box full"><Search size={17} /><input placeholder="Tìm công việc..." /></label><div className="task-sections"><SectionTitle title={archived ? "Website Redesign · 3 công việc" : "Quá hạn"} />{tasks.map((task) => <div key={task.title}><TaskRow task={task} />{archived && <Button variant="secondary" onClick={() => setToast("Đã khôi phục công việc")}><RotateCcw size={15} /> Khôi phục</Button>}</div>)}</div>{toast && <Toast message={toast} onClose={() => setToast("")} />}</AppFrame>;
}

function BoardScreen({ screen }: { screen: ScreenDefinition }) {
  const managing = screen.title.toLowerCase().includes("quản lý");
  const [toast, setToast] = useState("");
  if (managing) return <BoardManagement screen={screen} />;
  return <AppFrame screen={screen}><div className="page-heading board-heading"><div><p>Workspace / Alpha Redesign</p><h1>Alpha Redesign</h1><p>Thiết kế lại trải nghiệm cốt lõi cho khách hàng.</p></div><Button><Plus size={16} /> Thêm công việc</Button></div><div className="board-toolbar"><div className="tabs"><button className="active"><Columns3 size={15} /> Board</button><button><Inbox size={15} /> Danh sách</button></div><Button variant="secondary"><ListFilter size={16} /> Lọc</Button></div><div className="kanban">{["Backlog", "Đang làm", "Review", "Hoàn thành"].map((column, columnIndex) => <section className="kanban-column" key={column}><header><strong>{column}</strong><Badge tone="gray">{columnIndex + 1}</Badge><button><Plus size={17} /></button></header>{tasks.slice(columnIndex > 1 ? 1 : 0, columnIndex > 1 ? 2 : 3).map((task) => <article className="kanban-task" draggable key={task.title} onDragEnd={() => setToast("Đã chuyển công việc")}><Badge tone={task.tone}>{task.priority}</Badge><h3>{task.title}</h3><footer><span><CalendarDays size={14} />{task.due}</span><Avatar small /></footer></article>)}<button className="add-card"><Plus size={15} /> Thêm công việc</button></section>)}</div>{toast && <Toast message={toast} onClose={() => setToast("")} />}</AppFrame>;
}

function BoardManagement({ screen }: { screen: ScreenDefinition }) {
  const [boards, setBoards] = useState(["Quy trình thiết kế", "Quy trình phát triển"]);
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Cài đặt dự án</p><h1>Quản lý Board</h1></div><Button onClick={() => setBoards([...boards, `Board mới ${boards.length + 1}`])}><Plus size={16} /> Tạo board mới</Button></div><div className="board-admin-list">{boards.map((board, index) => <article key={board}><header><div><h2>{board}</h2><p>{index ? "5 cột · 42 công việc" : "4 cột · 24 công việc"}</p></div><Button variant="ghost"><MoreHorizontal /></Button></header><div className="column-list">{["Backlog", "Đang thực hiện", "Review", "Hoàn thành"].map((column, columnIndex) => <div key={column}><GripVertical size={17} /><span>{column}</span><Badge tone="gray">{columnIndex * 3 + index + 2}</Badge><Ellipsis size={17} /></div>)}</div><Button variant="secondary"><Plus size={15} /> Thêm cột mới</Button></article>)}</div></AppFrame>;
}

function TaskFormScreen({ screen }: { screen: ScreenDefinition }) {
  const quick = screen.title.toLowerCase().includes("nhanh");
  const conflict = screen.title.toLowerCase().includes("xung đột");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  return <AppFrame screen={screen} title={quick ? "Tạo công việc nhanh" : "Tạo công việc"} back><form className={`task-form ${quick ? "quick" : ""}`} onSubmit={(event) => { event.preventDefault(); setLoading(true); window.setTimeout(() => { setLoading(false); setToast("Đã lưu công việc"); }, 700); }}>{conflict && <div className="conflict-banner"><RefreshCw /><div><strong>Dữ liệu đã thay đổi</strong><p>Một thành viên khác vừa cập nhật công việc này.</p></div><Button variant="secondary">Tải bản mới</Button></div>}<Field label="Tiêu đề công việc *" placeholder="Ví dụ: Hoàn thiện trang đăng ký" />{!quick && <label className="field"><span>Mô tả</span><textarea placeholder="Mô tả kết quả mong đợi..." /></label>}<div className="form-grid"><SelectField label="Dự án">Website Redesign</SelectField><SelectField label="Cột">Backlog</SelectField><SelectField label="Độ ưu tiên">Cao</SelectField><Field label="Hạn hoàn thành" type="date" /></div><SelectField label="Người phụ trách"><span className="person-option"><Avatar small /> Lan Anh</span></SelectField>{!quick && <Field label="Nhãn" placeholder="Nhập nhãn và nhấn Enter" />}<footer className="sticky-actions"><Button variant="secondary">Hủy</Button><Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu công việc"}</Button></footer></form>{toast && <Toast message={toast} onClose={() => setToast("")} />}</AppFrame>;
}

function TaskDetailScreen({ screen }: { screen: ScreenDefinition }) {
  const [tab, setTab] = useState("activity");
  return <AppFrame screen={screen} title="Chi tiết công việc" back><article className="task-detail"><header><Badge>ĐANG LÀM</Badge><button><MoreHorizontal /></button></header><h1>Hoàn thiện kiến trúc tìm kiếm thống nhất</h1><p>Cập nhật service để tìm kiếm công việc theo tiêu đề trong workspace hiện tại.</p><div className="detail-grid"><span><small>Người phụ trách</small><strong><Avatar small /> Lan Anh</strong></span><span><small>Hạn hoàn thành</small><strong><CalendarDays /> 24/08/2026</strong></span><span><small>Độ ưu tiên</small><Badge tone="red">Cao</Badge></span><span><small>Nhãn</small><Badge tone="blue">Backend</Badge></span></div><div className="tabs"><button className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}>Hoạt động</button><button className={tab === "comments" ? "active" : ""} onClick={() => setTab("comments")}>Bình luận (2)</button></div>{tab === "activity" ? <div className="timeline"><p><Avatar small /> Minh đã chuyển trạng thái sang <Badge>Đang làm</Badge></p><p><Avatar small initials="SY" /> Hệ thống đã giao cho Lan Anh</p></div> : <Comments compact />}<footer className="detail-actions"><Button variant="secondary"><Archive size={16} /> Lưu trữ</Button><Button>Chỉnh sửa</Button></footer></article></AppFrame>;
}

function SearchScreen({ screen }: { screen: ScreenDefinition }) {
  const [query, setQuery] = useState("thiết kế");
  return <AppFrame screen={screen} title="Tìm kiếm" back><div className="search-page"><label className="search-box full"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tiêu đề công việc..." /><button onClick={() => setQuery("")}><X size={17} /></button></label>{query ? <><p className="result-count">3 kết quả trong workspace</p>{tasks.map((task) => <TaskRow key={task.title} task={{ ...task, title: `${task.title} — ${query}` }} />)}</> : <div className="empty-state"><Search /><h2>Tìm công việc nhanh chóng</h2><p>Nhập tiêu đề công việc để bắt đầu.</p></div>}</div></AppFrame>;
}

function NotificationsScreen({ screen }: { screen: ScreenDefinition }) {
  const [unread, setUnread] = useState(true);
  const notices = [[MessageCircle, "Minh đã nhắc tên bạn", "Trong công việc Q3 Roadmap", "10 phút"], [CheckCircle2, "Bạn được giao công việc mới", "Cập nhật Client Portal", "1 giờ"], [Clock3, "Deadline đang đến gần", "Finalize Q2 Budget", "2 giờ"]] as const;
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Workspace</p><h1>Thông báo</h1></div><Button variant="ghost" onClick={() => setUnread(false)}><CheckCheckIcon /> Đánh dấu tất cả đã đọc</Button></div><div className="tabs"><button className="active">Tất cả</button><button>Chưa đọc {unread && <Badge>3</Badge>}</button></div><div className="notification-list">{notices.map(([Icon, heading, text, time]) => <article className={unread ? "unread" : ""} key={heading}><span><Icon /></span><div><h3>{heading}</h3><p>{text}</p><small>{time} trước</small></div><button aria-label="Đánh dấu đã đọc"><MoreHorizontal /></button></article>)}</div></AppFrame>;
}

function CheckCheckIcon() { return <CheckCircle2 size={16} />; }

function CommentsScreen({ screen }: { screen: ScreenDefinition }) {
  return <AppFrame screen={screen} title="Bình luận" back><Comments /></AppFrame>;
}
function Comments({ compact = false }: { compact?: boolean }) {
  const [comments, setComments] = useState(["Mình nghĩ phần @mention nên dùng màu thương hiệu.", "Đã cập nhật theo góp ý của @Linh rồi nhé."]);
  const [value, setValue] = useState("");
  return <div className={`comments ${compact ? "compact" : ""}`}>{!compact && <div className="comment-task"><Badge>TASK-1042</Badge><h1>Thiết kế màn hình bình luận mobile</h1></div>}<div className="comment-list">{comments.map((comment, index) => <article key={`${comment}-${index}`}><Avatar initials={index ? "TA" : "LN"} /><div><header><strong>{index ? "Tuấn Anh" : "Linh Nguyễn"}</strong><small>10:{index ? "45" : "30"}</small></header><p>{comment}</p>{index === 1 && <div><button>Sửa</button><button onClick={() => setComments(comments.filter((_, itemIndex) => itemIndex !== index))}>Xóa</button></div>}</div></article>)}</div><form className="comment-box" onSubmit={(event) => { event.preventDefault(); if (value.trim()) { setComments([...comments, value]); setValue(""); } }}><Plus /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Viết bình luận... Dùng @ để nhắc tên" /><button aria-label="Gửi bình luận"><Send /></button></form></div>;
}

function MembersScreen({ screen }: { screen: ScreenDefinition }) {
  const privateProject = screen.title.toLowerCase().includes("riêng tư");
  const actions = screen.title.toLowerCase().includes("hành động");
  const matrix = screen.title.toLowerCase().includes("ma trận");
  if (matrix) return <PermissionMatrix screen={screen} />;
  const members = [["Alex Rivers", "alex@taskflow.vn", "Chủ sở hữu"], ["Jamie Doe", "jamie@taskflow.vn", "Quản trị viên"], ["Taylor Smith", "taylor@taskflow.vn", "Thành viên"], ["Morgan Lee", "morgan@agency.vn", "Khách"]];
  return <AppFrame screen={screen}><div className="page-heading"><div><p>{privateProject ? "Mobile App MVP" : "Workspace"}</p><h1>{privateProject ? "Thành viên dự án riêng tư" : actions ? "Quản lý thành viên" : "Thành viên & vai trò"}</h1></div><Button><UserPlus size={16} /> Mời thành viên</Button></div><label className="search-box full"><Search /><input placeholder="Tìm theo tên hoặc email..." /></label><div className="member-list">{members.map(([name, email, role], index) => <article key={email}><Avatar initials={name.split(" ").map((part) => part[0]).join("").slice(0, 2)} /><div><strong>{name}</strong><small>{email}</small></div>{privateProject ? <select defaultValue={index === 3 ? "Không truy cập" : index === 2 ? "Chỉnh sửa" : "Chỉ xem"}><option>Chỉ xem</option><option>Chỉnh sửa</option><option>Không truy cập</option></select> : <Badge tone={role === "Chủ sở hữu" ? "green" : "gray"}>{role}</Badge>}<button aria-label="Hành động thành viên"><MoreHorizontal /></button></article>)}</div>{actions && <div className="danger-actions"><h2>Hành động quản trị</h2><Button variant="secondary"><UserCog size={16} /> Đổi vai trò</Button><Button variant="secondary"><LockKeyhole size={16} /> Tạm ngưng</Button><Button variant="danger"><UserMinus size={16} /> Xóa khỏi workspace</Button></div>}</AppFrame>;
}

function PermissionMatrix({ screen }: { screen: ScreenDefinition }) {
  const [role, setRole] = useState("Khách");
  const matrix = [
    ["Xem workspace", true, "Giới hạn theo project được cấp"],
    ["Tạo dự án", role !== "Khách", "Khách không có quyền tạo dự án"],
    ["Mời thành viên", role === "Chủ sở hữu" || role === "Quản trị viên", "Chỉ Owner/Admin"],
    ["Quản lý billing", role === "Chủ sở hữu", "Chỉ Chủ sở hữu"],
    ["Xem audit log", role === "Chủ sở hữu" || role === "Quản trị viên", "Chỉ Owner/Admin"],
  ] as const;
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Kiểm tra quyền UI</p><h1>Ma trận UI theo vai trò</h1></div><select value={role} onChange={(event) => setRole(event.target.value)}><option>Chủ sở hữu</option><option>Quản trị viên</option><option>Thành viên</option><option>Khách</option></select></div><div className="permission-card"><div className="role-summary"><Avatar initials={role.slice(0, 2).toUpperCase()} /><div><Badge>{role}</Badge><h2>Project Alpha — Redesign</h2><p>Quyền hiển thị được tính từ role và project access.</p></div></div>{matrix.map(([action, allowed, reason]) => <div className="permission-row" key={action}><span>{action}</span>{allowed ? <Badge><Check size={13} /> Được phép</Badge> : <Badge tone="gray"><LockKeyhole size={13} /> Bị giới hạn</Badge>}<small>{reason}</small></div>)}</div></AppFrame>;
}

function AuditScreen({ screen }: { screen: ScreenDefinition }) {
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Workspace</p><h1>Lịch sử hoạt động</h1></div><Button variant="secondary"><ListFilter size={16} /> Bộ lọc</Button></div><div className="audit-filters"><SelectField label="Người thực hiện">Tất cả</SelectField><SelectField label="Hành động">Tất cả hành động</SelectField><Field label="Từ ngày" type="date" /></div><div className="audit-list">{["đã tạo dự án Website Redesign", "đã chuyển công việc sang Review", "đã đổi vai trò của Taylor thành Thành viên", "đã lưu trữ công việc API v2"].map((action, index) => <article key={action}><span className="audit-line" /><Avatar initials={["LA", "MN", "JD", "LA"][index]} /><div><p><strong>{["Lan Anh", "Minh Nguyễn", "Jamie Doe", "Lan Anh"][index]}</strong> {action}</p><small>Hôm nay, {9 + index}:30 · IP 14.177.xxx.xxx</small></div><Badge tone="gray">{["Dự án", "Task", "Thành viên", "Task"][index]}</Badge></article>)}</div></AppFrame>;
}

function SettingsScreen({ screen }: { screen: ScreenDefinition }) {
  const title = screen.title.toLowerCase();
  const [toast, setToast] = useState("");
  if (title.includes("chuyển quyền")) return <Ownership screen={screen} />;
  if (title.includes("vòng đời")) return <WorkspaceLifecycle screen={screen} />;
  return <AppFrame screen={screen} title="Cài đặt" back><div className="settings-page"><nav className="settings-tabs"><button className="active">Thông tin chung</button><button>Thành viên</button><button>Thông báo</button><button>Khu vực nguy hiểm</button></nav><section className="settings-card"><h2>Thông tin workspace</h2><div className="workspace-avatar">TF</div><Field label="Tên workspace" value="TaskFlow HQ" /><Field label="URL / Slug" value="taskflow-hq" /><label className="field"><span>Mô tả</span><textarea defaultValue="Không gian làm việc chính cho đội ngũ phát triển sản phẩm." /></label><Button onClick={() => setToast("Đã lưu thay đổi")}>Lưu thay đổi</Button></section><section className="settings-card"><h2>Thông báo</h2>{["Được giao việc mới", "Nhắc tên trong bình luận", "Thay đổi deadline"].map((item, index) => <label className="toggle-row" key={item}><span><strong>{item}</strong><small>Nhận thông báo trong ứng dụng</small></span><input type="checkbox" defaultChecked={index < 2} /></label>)}</section><section className="danger-zone"><h2>Khu vực nguy hiểm</h2><div><span><strong>Lưu trữ workspace</strong><small>Workspace chuyển sang chỉ đọc và có thể khôi phục.</small></span><Button variant="danger">Lưu trữ</Button></div></section></div>{toast && <Toast message={toast} onClose={() => setToast("")} />}</AppFrame>;
}

function Ownership({ screen }: { screen: ScreenDefinition }) {
  const [confirmed, setConfirmed] = useState(false);
  return <AppFrame screen={screen} title="Chuyển quyền sở hữu" back><div className="narrow-content"><div className="warning-card"><AlertCircle /><div><strong>Hành động quan trọng</strong><p>Sau khi chuyển quyền, bạn sẽ trở thành Quản trị viên.</p></div></div><SelectField label="Chủ sở hữu mới"><span className="person-option"><Avatar small initials="MN" /> Minh Nguyễn</span></SelectField><Field label="Nhập TASKFLOW HQ để xác nhận" placeholder="TASKFLOW HQ" /><label className="check-line"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Tôi hiểu thay đổi này có hiệu lực ngay.</label><Button variant="danger" disabled={!confirmed}>Chuyển quyền sở hữu</Button><div className="blocked-card"><LockKeyhole /><div><strong>Không thể rời workspace</strong><p>Bạn là Chủ sở hữu cuối cùng. Hãy chuyển quyền trước.</p></div></div></div></AppFrame>;
}

function WorkspaceLifecycle({ screen }: { screen: ScreenDefinition }) {
  const [archived, setArchived] = useState(true);
  return <AppFrame screen={screen}><div className="page-heading"><div><p>Cài đặt</p><h1>Vòng đời workspace</h1></div></div><div className="lifecycle">{archived && <div className="archive-banner"><Archive /><div><strong>Workspace đã lưu trữ — Chỉ đọc</strong><p>Bạn không thể tạo hoặc chỉnh sửa dữ liệu khi workspace đang lưu trữ.</p></div><Button variant="secondary" onClick={() => setArchived(false)}>Khôi phục</Button></div>}<section><h2>Lưu trữ workspace</h2><p>Đóng băng mọi hoạt động. Dữ liệu được giữ nguyên và có thể khôi phục.</p><Button variant="secondary" onClick={() => setArchived(true)}>Lưu trữ</Button></section><section className="delete-section"><h2>Xóa vĩnh viễn workspace</h2><p>Workspace sẽ được xóa sau <strong>30 ngày</strong>. Bạn có thể hủy trong thời gian chờ.</p><div className="deletion-date"><CalendarDays /><span><small>Ngày xóa dự kiến</small><strong>12/09/2026</strong></span></div><Field label="Nhập Project Alpha để xác nhận" placeholder="Project Alpha" /><Field label="Mật khẩu hiện tại" type="password" placeholder="Xác thực lại" /><Button variant="danger"><Trash2 size={16} /> Lên lịch xóa workspace</Button></section></div></AppFrame>;
}

function DeleteColumnScreen({ screen }: { screen: ScreenDefinition }) {
  const [destination, setDestination] = useState("");
  return <AppFrame screen={screen} title="Xóa cột" back><div className="dialog-page"><span className="danger-orb"><Trash2 /></span><h1>Xóa cột “Review”?</h1><p>Cột này đang chứa <strong>3 công việc</strong>. Chọn cột đích trước khi tiếp tục.</p><SelectField label="Chuyển công việc sang"><select value={destination} onChange={(event) => setDestination(event.target.value)}><option value="">Chọn cột đích</option><option>Backlog</option><option>Đang làm</option><option>Hoàn thành</option></select></SelectField><div className="preview-move"><span>Review <Badge tone="red">3</Badge></span><MoveRight /><span>{destination || "Cột đích"}</span></div><div className="dialog-actions"><Button variant="secondary">Hủy</Button><Button variant="danger" disabled={!destination}>Chuyển và xóa cột</Button></div></div></AppFrame>;
}

function StateScreen({ screen }: { screen: ScreenDefinition }) {
  const title = screen.title.toLowerCase();
  const network = title.includes("lỗi");
  const access = title.includes("truy cập");
  return <AppFrame screen={screen} title="Trạng thái hệ thống" back><div className="state-gallery">{network && <StateCard icon={WifiOff} title="Không có kết nối mạng" text="Kiểm tra Wi‑Fi hoặc 4G/5G rồi thử lại." action="Thử lại" />}{access && <><StateCard icon={LockKeyhole} title="Bạn không có quyền truy cập" text="Project này chưa được cấp cho tài khoản hiện tại." action="Về danh sách dự án" /><StateCard icon={Archive} title="Tài nguyên đã lưu trữ" text="Nội dung đang ở chế độ chỉ đọc." action="Xem lịch sử" /><StateCard icon={CircleUserRound} title="Phiên đăng nhập đã bị thu hồi" text="Vui lòng đăng nhập lại để tiếp tục." action="Đăng nhập" /></>}{!network && !access && <><StateCard icon={RefreshCw} title="Đang đồng bộ dữ liệu" text="Đang tải trạng thái mới nhất từ workspace." action="Hủy" /><StateCard icon={Inbox} title="Chưa có dữ liệu" text="Tạo nội dung đầu tiên để bắt đầu." action="Tạo mới" /><StateCard icon={AlertCircle} title="Không thể tải dữ liệu" text="Đã có lỗi xảy ra. Dữ liệu của bạn vẫn an toàn." action="Thử lại" /></>}</div></AppFrame>;
}
function StateCard({ icon: Icon, title, text, action }: { icon: React.ComponentType<{ size?: number }>; title: string; text: string; action: string }) { return <article className="state-card"><span><Icon /></span><h2>{title}</h2><p>{text}</p><Button variant="secondary"><RefreshCw size={15} /> {action}</Button></article>; }

export function ScreenRenderer({ screen }: { screen: ScreenDefinition }) {
  const title = screen.title.toLowerCase();
  const isMarketing = /trang chủ|tính năng|bảo mật|giải pháp|tài nguyên|bảng giá|chính sách|điều khoản|hỗ trợ|404|mobile menu/.test(title);
  if (isMarketing) return <MarketingScreen screen={screen} />;
  if (/đăng nhập|đăng ký|login|sign up|mật khẩu|xác minh|liên kết|lời mời|bắt đầu|create workspace/.test(title)) return <AuthScreen screen={screen} />;
  if (/xóa cột/.test(title)) return <DeleteColumnScreen screen={screen} />;
  if (/trạng thái lỗi|truy cập đặc biệt/.test(title)) return <StateScreen screen={screen} />;
  if (/dashboard|tổng quan/.test(title)) return <DashboardScreen screen={screen} />;
  if (/quản lý board|project board|bảng công việc/.test(title)) return <BoardScreen screen={screen} />;
  if (/công việc đã lưu trữ|my tasks/.test(title)) return <TasksScreen screen={screen} />;
  if (/dự án đã lưu trữ|projects|dự án -/.test(title)) return <ProjectsScreen screen={screen} />;
  if (/tạo công việc|chỉnh sửa & xung đột/.test(title)) return <TaskFormScreen screen={screen} />;
  if (/task details/.test(title)) return <TaskDetailScreen screen={screen} />;
  if (/tìm kiếm/.test(title)) return <SearchScreen screen={screen} />;
  if (/notification/.test(title)) return <NotificationsScreen screen={screen} />;
  if (/bình luận/.test(title)) return <CommentsScreen screen={screen} />;
  if (/member|thành viên|ma trận|hành động thành viên/.test(title)) return <MembersScreen screen={screen} />;
  if (/lịch sử hoạt động/.test(title)) return <AuditScreen screen={screen} />;
  if (/cài đặt|chuyển quyền|vòng đời/.test(title)) return <SettingsScreen screen={screen} />;
  if (/giới hạn|thanh toán/.test(title)) return <MarketingScreen screen={{ ...screen, title: "Bảng giá - TaskFlow (Mobile)" }} />;
  return <StateScreen screen={screen} />;
}
