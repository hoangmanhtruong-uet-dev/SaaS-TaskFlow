import { InvitationView } from "@/app/components/collaboration-views";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <InvitationView token={token} />; }
