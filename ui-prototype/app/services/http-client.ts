import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser";
import type { ApiResponse } from "@/app/types/api";

export class ApiClientError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}

let sessionRefresh: Promise<boolean> | undefined;

function isSafeRequest(init?: RequestInit) {
  return !init?.method || ["GET", "HEAD"].includes(init.method.toUpperCase());
}

async function refreshSessionOnce() {
  if (!sessionRefresh) {
    sessionRefresh = createSupabaseBrowserClient().auth.refreshSession()
      .then(({ data, error }) => !error && Boolean(data.session))
      .catch(() => false)
      .finally(() => { sessionRefresh = undefined; });
  }
  return sessionRefresh;
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
  try {
    return await requestOnce<T>(path, init);
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401 || !isSafeRequest(init)) throw error;
    if (!(await refreshSessionOnce())) throw error;
    return requestOnce<T>(path, init);
  }
}
