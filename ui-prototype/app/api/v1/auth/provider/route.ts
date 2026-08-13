import { ok } from "@/app/lib/api-response";
export async function GET() { return ok({ mode: "PASSWORD_AND_OAUTH", providers: ["email", "google"], passwordRecovery: true, emailVerification: true }); }
