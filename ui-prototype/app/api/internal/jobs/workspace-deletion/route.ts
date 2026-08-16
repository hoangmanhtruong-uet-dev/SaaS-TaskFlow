import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { purgeDueWorkspaces } from "@/db/deletion-worker";
import { createTaskDeadlineReminders } from "@/db/task-reminders";

export async function GET(request: Request) {
  try {
    const expected = process.env.CRON_SECRET;
    if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const [purgedWorkspaces, deadlineNotifications] = await Promise.all([purgeDueWorkspaces(), createTaskDeadlineReminders()]);
    return ok({ purgedWorkspaces, deadlineNotifications });
  } catch (error) { return routeError(error, { route: "workspace-deletion-job" }); }
}
