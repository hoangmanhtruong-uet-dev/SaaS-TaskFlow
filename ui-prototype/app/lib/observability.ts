import "server-only";

import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error";
export type LogContext = Record<string, unknown>;

const sensitiveKey = /authorization|cookie|password|secret|token|api[-_]?key|card|email/i;
const credentialValue = /(?:Bearer\s+\S+|(?:sk|pk)_(?:live|test)_\S+|whsec_\S+|re_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

export function sanitizeLogValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[TRUNCATED]";
  if (typeof value === "string") return value.replace(credentialValue, "[REDACTED]").slice(0, 240);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeLogValue(item, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key, item]) => item !== undefined && !sensitiveKey.test(key)).map(([key, item]) => [key, sanitizeLogValue(item, depth + 1)]));
  return undefined;
}

function cleanContext(context: LogContext) {
  return sanitizeLogValue(context) as Record<string, unknown>;
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
  const safeMessage = String(sanitizeLogValue(normalized.message));
  logEvent("error", event, {
    ...safeContext,
    errorName: normalized.name,
    errorMessage: safeMessage,
  });
  const safeError = new Error(safeMessage);
  safeError.name = normalized.name;
  Sentry.captureException(safeError, {
    tags: {
      event,
      environment: process.env.APP_ENV ?? "unknown",
      ...(typeof safeContext.route === "string" ? { route: safeContext.route } : {}),
    },
    extra: safeContext,
  });
}
