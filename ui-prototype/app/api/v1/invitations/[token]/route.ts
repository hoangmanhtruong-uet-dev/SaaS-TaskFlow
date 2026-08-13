import { fail, ok } from "@/app/lib/api-response"; import { getInvitationByToken } from "@/db/collaboration";
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) { const { token } = await params; const data = await getInvitationByToken(token); return data ? ok(data) : fail("INVITATION_NOT_FOUND", "Lời mời không tồn tại", 404); }
