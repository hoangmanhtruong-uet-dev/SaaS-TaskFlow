import { fail } from "@/app/lib/api-response";
export async function POST() { return fail("AUTH_PROVIDER_MANAGED", "Password recovery is managed by the ChatGPT identity provider", 409, { provider: "chatgpt" }); }
