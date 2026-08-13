import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { consumeRateLimit } from "@/db/auth";
import { searchWorkspace } from "@/db/search";

export async function GET(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params; const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) return ok({ items: [], nextCursor: null });
  const rate = await consumeRateLimit(`search:${workspaceId}:${auth.user.id}`, 60, 60 * 1000);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many search requests", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  const data = await searchWorkspace(workspaceId, auth.user.id, query);
  return data ? ok({ items: data, nextCursor: null }) : fail("NOT_FOUND", "Workspace not found", 404);
}
