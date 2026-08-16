import { listTasks } from "./tasks";
export async function searchWorkspace(workspaceId: string, userId: string, query: string) {
  const value = query.trim().toLocaleLowerCase("vi"); if (!value) return [];
  const page = await listTasks(workspaceId, userId, undefined, false, null, 50, value); if (!page) return null;
  return page.items;
}
