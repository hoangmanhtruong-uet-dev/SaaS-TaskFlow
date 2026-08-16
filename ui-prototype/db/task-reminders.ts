import { and, eq, isNotNull, isNull, lte } from "drizzle-orm";
import { getDb } from "./index";
import { memberships, notifications, taskAssignees, taskReminderDeliveries, tasks } from "./schema";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function createTaskDeadlineReminders(now = new Date()) {
  const dueSoonLimit = new Date(now.getTime() + DAY_MS);
  const candidates = await getDb().select().from(tasks).where(and(isNull(tasks.archivedAt), isNotNull(tasks.dueAt), lte(tasks.dueAt, dueSoonLimit))).limit(500).all();
  let created = 0;
  for (const task of candidates as Array<typeof tasks.$inferSelect>) {
    if (!task.dueAt) continue;
    const kind = task.dueAt.getTime() <= now.getTime() ? "OVERDUE" as const : "DUE_SOON" as const;
    const assigned = await getDb().select({ userId: memberships.userId }).from(taskAssignees).innerJoin(memberships, eq(taskAssignees.membershipId, memberships.id)).where(and(eq(taskAssignees.workspaceId, task.workspaceId), eq(taskAssignees.taskId, task.id), eq(memberships.status, "ACTIVE"))).all();
    const creator = await getDb().select({ userId: memberships.userId }).from(memberships).where(and(eq(memberships.workspaceId, task.workspaceId), eq(memberships.id, task.creatorMembershipId), eq(memberships.status, "ACTIVE"))).get();
    const recipients = new Set<string>((assigned.length ? assigned : creator ? [creator] : []).map((item: { userId: string }) => item.userId));
    for (const recipientUserId of recipients) {
      const delivery = await getDb().insert(taskReminderDeliveries).values({ id: crypto.randomUUID(), workspaceId: task.workspaceId, taskId: task.id, recipientUserId, kind, dueAt: task.dueAt }).onConflictDoNothing().returning({ id: taskReminderDeliveries.id }).get();
      if (!delivery) continue;
      await getDb().insert(notifications).values({ id: crypto.randomUUID(), workspaceId: task.workspaceId, recipientUserId, type: "DEADLINE", title: kind === "OVERDUE" ? "Công việc đã quá hạn" : "Công việc sắp đến hạn", body: task.title });
      created += 1;
    }
  }
  return created;
}
