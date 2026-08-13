import { fail, ok } from "@/app/lib/api-response";
import { clientAddress } from "@/app/lib/request-security";
import { consumeRateLimit } from "@/db/auth";
export async function POST(request: Request) { const rate = await consumeRateLimit(`auth:forgot:${clientAddress(request)}`, 5, 15 * 60 * 1000); if (!rate.allowed) return fail("RATE_LIMITED", "Too many recovery attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds }); return ok({ accepted: true, provider: "chatgpt", passwordManagedByProvider: true }, 202); }
