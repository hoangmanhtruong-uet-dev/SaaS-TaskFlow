import { fail } from "./api-response";
import { reportError, type LogContext } from "./observability";
import { ValidationError } from "./validation";
import { isTrustedMutationRequest } from "./request-security";

export function routeError(error: unknown, context: LogContext = {}) {
  if (error instanceof ValidationError) return fail("VALIDATION_ERROR", error.message, 400, error.details);
  reportError(error, "api_request_failed", context);
  return fail("INTERNAL_ERROR", "Đã có lỗi xảy ra", 500);
}

/**
 * Wraps a mutation handler with CSRF origin validation.
 * Allows requests from the same origin; rejects cross-site mutations.
 */
export function withCsrfCheck(
  handler: (request: Request, ctx: unknown) => Promise<Response>
): (request: Request, ctx: unknown) => Promise<Response> {
  return async (request, ctx) => {
    if (!isTrustedMutationRequest(request)) {
      return fail("CSRF_REJECTED", "Cross-site request rejected", 403);
    }
    return handler(request, ctx);
  };
}
