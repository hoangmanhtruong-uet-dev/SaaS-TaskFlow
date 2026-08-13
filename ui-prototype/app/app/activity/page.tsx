import { ActivityView } from "@/app/components/collaboration-views";
import { PageHeading } from "@/app/components/product-views";
export const dynamic = "force-dynamic";
export default function Page() { return <><PageHeading eyebrow="Workspace" title="Lịch sử hoạt động" /><ActivityView /></>; }
