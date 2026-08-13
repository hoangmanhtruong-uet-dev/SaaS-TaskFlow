import { ok } from "@/app/lib/api-response";
export async function GET() { return ok({ mode: "OAUTH", provider: "chatgpt", passwordManagedByProvider: true, emailVerificationManagedByProvider: true }); }
