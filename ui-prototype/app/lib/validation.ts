export class ValidationError extends Error {
  constructor(public details: Record<string, string>) { super("Validation failed"); }
}
export function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError({ body: "Body must be a JSON object" });
  return value as Record<string, unknown>;
}
export function requiredString(body: Record<string, unknown>, key: string, max = 200) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) throw new ValidationError({ [key]: "Trường này là bắt buộc" });
  if (value.trim().length > max) throw new ValidationError({ [key]: `Tối đa ${max} ký tự` });
  return value.trim();
}
export function optionalString(body: Record<string, unknown>, key: string, max = 5000) {
  const value = body[key];
  if (value == null) return undefined;
  if (typeof value !== "string" || value.length > max) throw new ValidationError({ [key]: `Giá trị không hợp lệ hoặc dài hơn ${max} ký tự` });
  return value.trim();
}
export function enumValue<T extends string>(body: Record<string, unknown>, key: string, allowed: readonly T[], fallback?: T) {
  const value = body[key];
  if (value == null && fallback) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as T)) throw new ValidationError({ [key]: `Giá trị phải là ${allowed.join(", ")}` });
  return value as T;
}
export async function parseJson(request: Request) { try { return objectBody(await request.json()); } catch (error) { if (error instanceof ValidationError) throw error; throw new ValidationError({ body: "JSON không hợp lệ" }); } }
