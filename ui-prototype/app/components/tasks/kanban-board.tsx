"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CalendarDays, CheckSquare, GripVertical, Wifi, WifiOff } from "lucide-react";
import type { BoardColumn, TaskSummary } from "@/app/types/domain";
import { taskService } from "@/app/services/task-service";
import { ApiClientError } from "@/app/services/http-client";
import { useConnectionSync } from "@/app/hooks/use-connection-sync";
import { Badge } from "@/app/components/ui";

export function ConnectionStatus({ state }: { state: "connected" | "disconnected" | "reconnecting" }) {
  return (
    <span className={`connection-status ${state}`}>
      {state === "disconnected" ? <WifiOff size={14} /> : <Wifi size={14} />}
      {state === "connected" ? "Đã đồng bộ" : state === "reconnecting" ? "Đang kết nối lại..." : "Mất kết nối — thay đổi sẽ chưa được gửi"}
    </span>
  );
}

export function InteractiveBoard({
  workspaceId,
  columns,
  initialTasks,
  refetch,
}: {
  workspaceId: string;
  columns: BoardColumn[];
  initialTasks: TaskSummary[];
  refetch: () => void;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [movingId, setMovingId] = useState("");
  const [error, setError] = useState("");
  const connection = useConnectionSync(refetch);

  async function move(taskId: string, destinationColumnId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.columnId === destinationColumnId || movingId) return;

    if (!navigator.onLine) {
      setError("Đang offline. Kết nối lại trước khi di chuyển công việc.");
      return;
    }

    const snapshot = tasks;
    setMovingId(taskId);
    setError("");
    setTasks((items) =>
      items.map((item) => (item.id === taskId ? { ...item, columnId: destinationColumnId, version: item.version + 1 } : item))
    );

    try {
      const updated = await taskService.move(workspaceId, taskId, {
        destinationColumnId,
        beforeTaskId: null,
        afterTaskId: null,
        expectedVersion: task.version,
      });
      setTasks((items) => items.map((item) => (item.id === taskId ? updated : item)));
    } catch (value) {
      setTasks(snapshot);
      setError(
        value instanceof ApiClientError && value.code === "TASK_VERSION_CONFLICT"
          ? "Board đã thay đổi ở nơi khác. Đã rollback và tải dữ liệu mới."
          : "Không thể di chuyển công việc. Đã rollback thay đổi."
      );
      refetch();
    } finally {
      setMovingId("");
    }
  }

  return (
    <>
      <div className="board-sync">
        <ConnectionStatus state={connection} />
        {error && (
          <span className="inline-error">
            <AlertTriangle size={14} />
            {error}
          </span>
        )}
      </div>

      <div className="production-kanban">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.columnId === column.id);
          return (
            <section
              className="kanban-column drop-zone"
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void move(event.dataTransfer.getData("text/task-id"), column.id);
              }}
            >
              <header>
                <strong>{column.name}</strong>
                <span className="badge gray">{columnTasks.length}</span>
              </header>

              {columnTasks.length ? (
                columnTasks.map((task) => (
                  <article
                    className={`live-task-card ${movingId === task.id ? "moving" : ""}`}
                    draggable={!movingId}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/task-id", task.id);
                    }}
                    key={task.id}
                  >
                    <GripVertical size={16} />
                    <Link href={`/app/tasks/${task.id}`}>
                      <Badge tone={task.tone}>{task.priority}</Badge>
                      <strong>{task.title}</strong>
                      <small>
                        <CalendarDays size={12} />
                        {task.dueAt ? new Date(task.dueAt).toLocaleDateString("vi-VN") : "Chưa có hạn"}
                      </small>
                      {task.checklistTotal > 0 && (
                        <small>
                          <CheckSquare size={12} />
                          {task.checklistCompleted}/{task.checklistTotal} checklist
                        </small>
                      )}
                    </Link>
                  </article>
                ))
              ) : (
                <p className="column-empty">Thả công việc vào đây</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
