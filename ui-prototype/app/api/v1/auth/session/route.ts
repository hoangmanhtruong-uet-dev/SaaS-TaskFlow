import { getChatGPTUser } from "@/app/chatgpt-auth";
import { fail, ok } from "@/app/lib/api-response";
import { clientAddress } from "@/app/lib/request-security";
import { consumeRateLimit, establishProviderSession } from "@/db/auth";
import { ensureCurrentUser } from "@/db/users";

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const rate = await consumeRateLimit(`auth:session:${identity.userId}:${clientAddress(request)}`, 10, 15 * 60 * 1000);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many authentication attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  const user = await ensureCurrentUser(identity);
  if (!user) return fail("USER_PROVISION_FAILED", "Could not provision user", 500);
  const session = await establishProviderSession(user.id);
  return ok({ id: session?.id, provider: "chatgpt", expiresAt: session?.expiresAt.toISOString() });
}
