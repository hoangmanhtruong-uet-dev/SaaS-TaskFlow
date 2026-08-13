import { Resend } from "resend";
import { parseServerEnv } from "@/app/lib/env";

export async function sendTransactionalEmail(input: { to: string; subject: string; html: string; idempotencyKey?: string }) {
  const env = parseServerEnv(); const resend = new Resend(env.RESEND_API_KEY);
  return resend.emails.send({ from: env.EMAIL_FROM, replyTo: env.EMAIL_REPLY_TO, to: input.to, subject: input.subject, html: input.html }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);
}
