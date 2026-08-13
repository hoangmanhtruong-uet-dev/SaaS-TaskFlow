import { fail } from "./api-response";
import { ValidationError } from "./validation";
export function routeError(error: unknown) {
  if (error instanceof ValidationError) return fail("VALIDATION_ERROR", error.message, 400, error.details);
  console.error(error);
  return fail("INTERNAL_ERROR", "Đã có lỗi xảy ra", 500);
}
