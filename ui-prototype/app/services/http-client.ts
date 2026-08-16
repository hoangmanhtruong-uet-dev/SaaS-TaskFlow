import type { ApiResponse } from "@/app/types/api";

export class ApiClientError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}

async function requestOnce<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;

  if (!payload || !("data" in payload)) {
    const error = payload && "error" in payload
      ? payload.error
      : { code: "INVALID_API_RESPONSE", message: "Máy chủ trả về phản hồi không hợp lệ." };
    throw new ApiClientError(error.code, error.message, response.status);
  }
  return payload.data;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  return requestOnce<T>(path, init);
}
