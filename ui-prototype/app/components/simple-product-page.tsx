import type { ReactNode } from "react";
import { PageHeading } from "./product-views";
import { Card } from "./ui";
export function SimpleProductPage({ eyebrow = "Alpha Studio", title, children }: { eyebrow?: string; title: string; children: ReactNode }) { return <><PageHeading eyebrow={eyebrow} title={title} /><Card className="production-panel">{children}</Card></>; }
