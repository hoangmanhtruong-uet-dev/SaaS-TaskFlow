"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <html lang="vi"><body><main className="auth-stage"><section className="auth-card"><h1>Không thể tải TaskFlow</h1><p>Lỗi đã được ghi nhận. Bạn có thể thử tải lại trang.</p><button className="button" onClick={reset}>Thử lại</button></section></main></body></html>;
}
