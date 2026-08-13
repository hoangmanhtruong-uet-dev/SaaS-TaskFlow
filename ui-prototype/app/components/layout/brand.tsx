import Link from "next/link";
import { Check } from "lucide-react";
export function Brand({ href = "/" }: { href?: string }) {
  return <Link href={href} className="brand" aria-label="TaskFlow"><span className="brand-mark"><Check size={15} strokeWidth={3} /></span><span>TaskFlow</span></Link>;
}
