import "server-only";

import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error";
type LogValue = string | number | boolean | null | undefined;
export type LogContext = Record<string, LogValue>;

const sensitiveKey = /authorization|cookie|password|secret|token|api[-_]?key|card|email/i;

function cleanContext(context: LogContext) {
  return Object.fromEntries(
    Object.entries(context)
      .filter(([key, value]) => value !== undefined && !sensitiveKey.test(key))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 240) : value]),
  );
}

export function requestIdFrom(request: Request) {
  return request.headers.get("x-request-id")
    ?? request.headers.get("x-vercel-id")
    ?? `req_${crypto.randomUUID()}`;
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    service: "taskflow-web",
    environment: process.env.APP_ENV ?? "unknown",
    release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    ...cleanContext(context),
  });

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.log(payload);
}

export function reportError(error: unknown, event: string, context: LogContext = {}) {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const safeContext = cleanContext(context);
  logEvent("error", event, {
    ...safeContext,
    errorName: normalized.name,
    errorMessage: normalized.message,
  });
  Sentry.captureException(normalized, {
    tags: {
      event,
      environment: process.env.APP_ENV ?? "unknown",
      ...(typeof safeContext.route === "string" ? { route: safeContext.route } : {}),
    },
    extra: safeContext,
  });
}
