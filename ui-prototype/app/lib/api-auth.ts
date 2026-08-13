import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureCurrentUser } from "@/db/users";
import { resolveProviderSession } from "@/db/auth";

export async function getApiUser() {
  const identity = await getChatGPTUser();
  if (!identity) return null;
  const user = await ensureCurrentUser(identity);
  if (!user) return null;
  const session = await resolveProviderSession(user.id);
  return session.kind === "ok" ? { identity, user, session: session.session } : null;
}
