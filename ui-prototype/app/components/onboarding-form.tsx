"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field } from "@/app/components/ui";

export function OnboardingForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/workspaces", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), slug: form.get("slug") }) });
    const payload = await response.json();
    if (!response.ok) { setError(payload.error?.message ?? "Không thể tạo workspace."); setBusy(false); return; }
    router.push("/app"); router.refresh();
  }
  return <form onSubmit={submit}><Field name="name" label="Tên workspace" required maxLength={100} /><Field name="slug" label="Đường dẫn" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="cong-ty-cua-ban" required maxLength={80} />{error && <p className="form-error" role="alert">{error}</p>}<Button type="submit" disabled={busy}>{busy ? "Đang tạo..." : "Tạo workspace"}</Button></form>;
}
