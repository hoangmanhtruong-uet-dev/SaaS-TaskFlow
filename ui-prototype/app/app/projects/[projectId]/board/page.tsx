import { LiveBoard } from "@/app/components/live-product-views";
export const dynamic = "force-dynamic";
export default async function BoardPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <LiveBoard projectId={projectId} />; }
