export function safeReturnPath(value: string | null | undefined, fallback = "/app") {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://taskflow.local");
    if (url.origin !== "https://taskflow.local") return fallback;
    if (url.pathname.startsWith("/auth/callback") || url.pathname.startsWith("/auth/signout")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
