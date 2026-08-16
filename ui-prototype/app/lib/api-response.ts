import { NextResponse } from "next/server";
import { logEvent } from "./observability";

export function requestId() { return `req_${crypto.randomUUID()}`; }

export function ok<T>(data: T, status = 200) {
  const id = requestId();
  logEvent("info", "api_response", { requestId: id, status });
  return NextResponse.json({ data, meta: { requestId: id } }, { status, headers: { "cache-control": "no-store", "x-request-id": id } });
}

export function fail(code: string, message: string, status: number, details?: Record<string, unknown>) {
  const id = requestId();
  logEvent(status >= 500 ? "error" : "warn", "api_response", { requestId: id, status, errorCode: code });
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) }, meta: { requestId: id } },
    {
      status,
      headers: {
        "cache-control": "no-store",
        ...(status === 429 && typeof details?.retryAfterSeconds === "number" ? { "retry-after": String(details.retryAfterSeconds) } : {}),
        "x-request-id": id,
      },
    },
  );
}
