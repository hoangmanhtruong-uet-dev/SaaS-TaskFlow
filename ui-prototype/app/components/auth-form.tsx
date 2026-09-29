 
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CircleUserRound } from "lucide-react";
import { Button, Field } from "@/app/components/ui";
import { safeReturnPath } from "@/app/lib/auth-redirect";

type Mode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode, next = "/app" }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const destination = safeReturnPath(next);

  async function authRequest<T>(path: string, body: Record<string, unknown>) {
    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json() as { data?: T; error?: { message?: string } };
    if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Không thể xử lý yêu cầu.");
    return payload.data;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    try {
      if (mode === "login") {
        const data = await authRequest<{ mfaRequired: boolean }>("/api/v1/auth/login", { email, password });
        router.push(data.mfaRequired ? `/auth/mfa?next=${encodeURIComponent(destination)}` : destination); router.refresh();
      } else if (mode === "register") {
        const data = await authRequest<{ authenticated: boolean }>("/api/v1/auth/register", { email, password, fullName });
        if (data.authenticated) { router.push(destination); router.refresh(); }
        else setMessage("Đã gửi email xác minh. Hãy mở liên kết để tiếp tục.");
      } else if (mode === "forgot") {
        await authRequest("/api/v1/auth/password/forgot", { email });
        setMessage("Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.");
      } else {
        const confirmation = String(form.get("confirmation") ?? "");
        if (password !== confirmation) throw new Error("Mật khẩu xác nhận không khớp.");
        await authRequest("/api/v1/auth/password/reset", { password });
        router.push("/app"); router.refresh();
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : "Không thể xử lý yêu cầu.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true); setError("");
    try {
      const data = await authRequest<{ url: string }>("/api/v1/auth/provider", { provider: "google", next: destination });
      window.location.assign(data.url);
    } catch (value) { setError(value instanceof Error ? value.message : "Không thể bắt đầu đăng nhập Google."); setBusy(false); }
  }

  return <>
    {message && <div className="inline-success">{message}</div>}
    <form onSubmit={submit}>
      {mode === "register" && <Field name="fullName" label="Họ và tên" autoComplete="name" required />}
      {mode !== "reset" && <Field name="email" label="Email" type="email" autoComplete="email" required />}
      {mode !== "forgot" && <Field name="password" label={mode === "reset" ? "Mật khẩu mới" : "Mật khẩu"} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? 8 : 12} required />}
      {mode === "reset" && <Field name="confirmation" label="Xác nhận mật khẩu" type="password" autoComplete="new-password" minLength={12} required />}
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : mode === "register" ? "Tạo tài khoản" : mode === "forgot" ? "Gửi hướng dẫn" : "Lưu mật khẩu"} <ArrowRight size={16} /></Button>
    </form>
    {(mode === "login" || mode === "register") && <Button type="button" variant="secondary" disabled={busy} onClick={google}><CircleUserRound size={17} /> Tiếp tục với Google</Button>}
    <p className="auth-foot">{mode === "login" ? <><Link href={`/forgot-password?next=${encodeURIComponent(destination)}`}>Quên mật khẩu?</Link> · <Link href={`/register?next=${encodeURIComponent(destination)}`}>Tạo tài khoản</Link></> : mode === "register" ? <Link href={`/login?next=${encodeURIComponent(destination)}`}>Đã có tài khoản? Đăng nhập</Link> : <Link href="/login">Quay lại đăng nhập</Link>}</p>
  </>;
}
