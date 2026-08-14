import { logEvent, requestIdFrom } from "@/app/lib/observability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  logEvent("info", "health_live", { requestId, status: 200 });
  return Response.json({
    status: "ok",
    service: "taskflow-web",
    environment: process.env.APP_ENV ?? "unknown",
    release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    requestId,
  }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
}
