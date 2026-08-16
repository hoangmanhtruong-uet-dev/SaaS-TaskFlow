import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { logEvent } from "@/app/lib/observability";
import { isTrustedMutationRequest } from "@/app/lib/request-security";
import { updateSupabaseSession } from "@/app/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-request-id") ?? `req_${crypto.randomUUID()}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  if (request.nextUrl.pathname.startsWith("/api/v1/") && !isTrustedMutationRequest(request)) {
    logEvent("warn", "cross_site_mutation_blocked", {
      requestId,
      method: request.method,
      route: request.nextUrl.pathname,
    });
    return NextResponse.json(
      { error: { code: "CROSS_SITE_REQUEST_BLOCKED", message: "Cross-site mutation request blocked" }, meta: { requestId } },
      { status: 403, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }
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
