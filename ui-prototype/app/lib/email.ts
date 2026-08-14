import { Resend } from "resend";
import { emailEnv } from "@/app/lib/env";

export async function sendTransactionalEmail(input: { to: string; subject: string; html: string; idempotencyKey?: string }) {
  const env = emailEnv();
  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(
    { from: env.EMAIL_FROM, replyTo: env.EMAIL_REPLY_TO, to: input.to, subject: input.subject, html: input.html },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
  if (error) throw new Error(`EMAIL_DELIVERY_FAILED:${error.name}`);
  return { id: data?.id ?? null };
}
