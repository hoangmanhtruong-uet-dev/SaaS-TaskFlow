import type { ReactNode } from "react";
import type { Tone } from "@/app/types/domain";

export function Badge({ children, tone = "green" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
