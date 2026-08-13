import { listTasks } from "./tasks";
export async function searchWorkspace(workspaceId: string, userId: string, query: string) {
  const value = query.trim().toLocaleLowerCase("vi"); if (!value) return [];
  const tasks = await listTasks(workspaceId, userId); if (!tasks) return null;
  return tasks.filter((task) => task.title.toLocaleLowerCase("vi").includes(value)).slice(0, 50);
}
