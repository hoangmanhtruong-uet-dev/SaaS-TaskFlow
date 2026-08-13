import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "./index";
import { notifications } from "./schema";
export async function listNotifications(userId: string, unreadOnly = false) { const rows = await getDb().select().from(notifications).where(and(eq(notifications.recipientUserId, userId), unreadOnly ? isNull(notifications.readAt) : undefined)).orderBy(desc(notifications.createdAt)).limit(100).all(); return rows.map((row) => ({ ...row, readAt: row.readAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString() })); }
export async function markNotificationRead(userId: string, notificationId: string) { return getDb().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.recipientUserId, userId))).returning().get(); }
export async function markAllNotificationsRead(userId: string) { await getDb().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.recipientUserId, userId), isNull(notifications.readAt))).run(); }
