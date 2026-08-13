import { getApiUser } from "@/app/lib/api-auth"; import { fail, ok } from "@/app/lib/api-response"; import { markAllNotificationsRead } from "@/db/notifications";
export async function POST() { const auth = await getApiUser(); if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401); await markAllNotificationsRead(auth.user.id); return ok({ read: true }); }
