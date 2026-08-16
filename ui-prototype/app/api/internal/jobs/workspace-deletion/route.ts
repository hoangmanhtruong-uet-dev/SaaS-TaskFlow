import { fail, ok } from "@/app/lib/api-response";
import { secureTokenMatches } from "@/app/lib/request-security";
import { routeError } from "@/app/lib/route-handler";
import { purgeDueWorkspaces } from "@/db/deletion-worker";
import { createTaskDeadlineReminders } from "@/db/task-reminders";
import { processOutbox } from "@/db/outbox";

export async function GET(request: Request) {
  try {
    const expected = process.env.CRON_SECRET;
    const authorization = request.headers.get("authorization");
    const actual = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!await secureTokenMatches(actual, expected)) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const [purgedWorkspaces, deadlineNotifications, outbox] = await Promise.all([purgeDueWorkspaces(), createTaskDeadlineReminders(), processOutbox(100)]);
    return ok({ purgedWorkspaces, deadlineNotifications, outbox });
  } catch (error) { return routeError(error, { route: "workspace-deletion-job" }); }
}
