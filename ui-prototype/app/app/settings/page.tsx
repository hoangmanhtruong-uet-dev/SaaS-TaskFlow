import { WorkspaceSettingsView } from "@/app/components/operations-views";
import { PageHeading } from "@/app/components/product-views";
export const dynamic = "force-dynamic";
export default function Page() { return <><PageHeading eyebrow="Workspace" title="Cài đặt" /><WorkspaceSettingsView /></>; }
