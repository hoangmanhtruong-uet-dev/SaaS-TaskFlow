import { fail } from "./api-response";
import { reportError, type LogContext } from "./observability";
import { ValidationError } from "./validation";

export function routeError(error: unknown, context: LogContext = {}) {
  if (error instanceof ValidationError) return fail("VALIDATION_ERROR", error.message, 400, error.details);
  reportError(error, "api_request_failed", context);
  return fail("INTERNAL_ERROR", "Đã có lỗi xảy ra", 500);
}
