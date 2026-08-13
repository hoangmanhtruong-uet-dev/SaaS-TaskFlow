import { LiveTaskDetail } from "@/app/components/live-product-views";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ taskId: string }> }) { const { taskId } = await params; return <LiveTaskDetail taskId={taskId} />; }
