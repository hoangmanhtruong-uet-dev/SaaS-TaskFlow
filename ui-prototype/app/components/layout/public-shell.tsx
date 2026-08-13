import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";
import { ButtonLink } from "../ui";

export function PublicShell({ children }: { children: ReactNode }) {
  return <div className="marketing production-site"><header className="public-header"><Brand /><nav className="desktop-nav" aria-label="Điều hướng marketing"><Link href="/features">Tính năng</Link><Link href="/solutions">Giải pháp</Link><Link href="/pricing">Bảng giá</Link><Link href="/resources">Tài nguyên</Link></nav><div className="header-actions"><Link className="text-link" href="/login">Đăng nhập</Link><ButtonLink href="/register">Bắt đầu miễn phí</ButtonLink></div></header><main>{children}</main><footer className="public-footer"><Brand /><span>© 2026 TaskFlow.</span><nav><Link href="/privacy">Quyền riêng tư</Link><Link href="/terms">Điều khoản</Link><Link href="/security">Bảo mật</Link><Link href="/support">Hỗ trợ</Link><Link href="/ui">UI Atlas</Link></nav></footer></div>;
}
