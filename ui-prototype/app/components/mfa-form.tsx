/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Button, Field } from "@/app/components/ui";

type Status = { currentLevel: string | null; nextLevel: string | null; factors: Array<{ id: string; friendlyName?: string; status: string }> };
type Enrollment = { factorId: string; qrCode: string; secret: string };

async function api<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const payload = await response.json() as { data?: T; error?: { message?: string } };
  if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Không thể xử lý MFA.");
  return payload.data;
}

export function MfaForm({ next }: { next: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  useEffect(() => { void api<Status>("/api/v1/auth/mfa").then(setStatus).catch((value) => setError(value.message)); }, []);
  const verified = status?.factors.find((factor) => factor.status === "verified");
  const factorId = enrollment?.factorId ?? verified?.id;

  async function enroll() {
    setBusy(true); setError("");
    try { setEnrollment(await api<Enrollment>("/api/v1/auth/mfa", { method: "POST", body: "{}" })); }
    catch (value) { setError(value instanceof Error ? value.message : "Không thể tạo authenticator."); }
    finally { setBusy(false); }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!factorId) return;
    setBusy(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      const result = await api<{ recoveryCodes: string[] | null }>("/api/v1/auth/mfa/verify", { method: "POST", body: JSON.stringify({ factorId, code: form.get("code") }) });
      if (result.recoveryCodes?.length) setRecoveryCodes(result.recoveryCodes);
      else window.location.assign(next);
    } catch (value) { setError(value instanceof Error ? value.message : "Mã không hợp lệ."); }
    finally { setBusy(false); }
  }

  async function recover(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      await api("/api/v1/auth/mfa/recover", { method: "POST", body: JSON.stringify({ code: form.get("recoveryCode") }) });
      window.location.reload();
    } catch (value) { setError(value instanceof Error ? value.message : "Recovery code không hợp lệ."); }
    finally { setBusy(false); }
  }

  if (!status) return <p>{error || "Đang tải trạng thái MFA..."}</p>;
  if (recoveryCodes) return <div><p className="inline-success">MFA đã được bật. Lưu các recovery code này ngay; chúng chỉ hiển thị một lần.</p><ul>{recoveryCodes.map((code) => <li key={code}><code>{code}</code></li>)}</ul><Button type="button" onClick={() => window.location.assign(next)}>Tôi đã lưu recovery codes</Button></div>;
  if (status.currentLevel === "aal2") return <><p className="inline-success">Phiên hiện tại đã xác minh MFA.</p><Button type="button" onClick={() => window.location.assign(next)}>Tiếp tục</Button></>;
  return <div className="mfa-flow">{error && <p className="form-error" role="alert">{error}</p>}{!verified && !enrollment && <Button type="button" disabled={busy} onClick={enroll}>Thiết lập ứng dụng authenticator</Button>}{enrollment && <div><p>Quét QR bằng ứng dụng authenticator hoặc nhập khóa thủ công.</p><img src={enrollment.qrCode} alt="Mã QR thiết lập MFA" width={220} height={220} /><code>{enrollment.secret}</code></div>}{factorId && <form onSubmit={verify}><Field name="code" label="Mã xác minh 6 chữ số" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required /><Button type="submit" disabled={busy}>{busy ? "Đang xác minh..." : "Xác minh MFA"}</Button></form>}{verified && <details><summary>Mất ứng dụng authenticator?</summary><form onSubmit={recover}><Field name="recoveryCode" label="Recovery code" autoComplete="one-time-code" required /><Button type="submit" variant="danger" disabled={busy}>Đặt lại MFA bằng recovery code</Button></form></details>}</div>;
}
