import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Common = { children: ReactNode; variant?: Variant; className?: string };

export function Button({ variant = "primary", className = "", ...props }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${variant} ${className}`.trim()} {...props} />;
}

export function ButtonLink({ href, variant = "primary", className = "", children }: Common & { href: string }) {
  return <Link href={href} className={`button ${variant} ${className}`.trim()}>{children}</Link>;
}
