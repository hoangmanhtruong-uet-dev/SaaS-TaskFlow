import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { markProviderEmailVerified } from "@/db/auth";
export async function POST() { const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401); const result = await markProviderEmailVerified(auth.user.id); return ok({ verified: true, verifiedAt: result?.verifiedAt?.toISOString() ?? null, provider: "chatgpt" }); }
