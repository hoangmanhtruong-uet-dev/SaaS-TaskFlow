import type { NextRequest } from "next/server";
import { logEvent } from "@/app/lib/observability";
import { updateSupabaseSession } from "@/app/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-request-id") ?? `req_${crypto.randomUUID()}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  const response = await updateSupabaseSession(request, requestHeaders);
  response.headers.set("x-request-id", requestId);
  logEvent("info", "request_received", {
    requestId,
    method: request.method,
    route: request.nextUrl.pathname,
    middlewareMs: Date.now() - startedAt,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
