import { logEvent, reportError, requestIdFrom } from "@/app/lib/observability";
import { checkDatabaseHealth } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  const startedAt = Date.now();
  try {
    const database = await checkDatabaseHealth();
    logEvent("info", "health_ready", { requestId, status: 200, durationMs: Date.now() - startedAt, databaseMs: database.latencyMs });
    return Response.json({
      status: "ready",
      checks: { database: { status: "up", latencyMs: database.latencyMs } },
      requestId,
    }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
  } catch (error) {
    reportError(error, "health_ready_failed", { requestId, route: "/api/health/ready", durationMs: Date.now() - startedAt });
    return Response.json({ status: "not_ready", checks: { database: { status: "down" } }, requestId }, {
      status: 503,
      headers: { "cache-control": "no-store", "retry-after": "10", "x-request-id": requestId },
    });
  }
}
