import type { ApiResponse } from "@/app/types/api";

export class ApiClientError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const payload = await response.json() as ApiResponse<T>;
  if (!("data" in payload)) throw new ApiClientError(payload.error.code, payload.error.message, response.status);
  return payload.data;
}
