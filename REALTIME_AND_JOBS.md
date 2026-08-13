Realtime và Background Jobs

1. Mục tiêu realtime

Board cập nhật khi người khác tạo, sửa hoặc di chuyển task.

Comment xuất hiện mà không reload.

Notification badge cập nhật nhanh.

Quyền bị thu hồi có hiệu lực ngay ở server và sớm phản ánh trên client.

Realtime không phải source of truth. Khi reconnect hoặc phát hiện version gap, client gọi API tải lại.

2. Channel

workspace:{workspaceId}
project:{projectId}
board:{boardId}
user:{userId}:notifications

Server phải authorize từng subscription. Client không được tự tham gia channel chỉ vì biết ID.

3. Event envelope

{
  "eventId": "evt_...",
  "type": "task.moved",
  "occurredAt": "2026-08-11T10:00:00Z",
  "workspaceId": "ws_...",
  "entity": { "type": "task", "id": "task_...", "version": 8 },
  "actor": { "id": "user_..." },
  "data": { "columnId": "col_...", "position": "..." }
}

Payload chỉ chứa dữ liệu cần thiết và không thay thế API authorization.

4. Ordering và duplicate

Client deduplicate bằng eventId trong cửa sổ ngắn.

Với cùng entity, bỏ event có version nhỏ hơn hoặc bằng version đã áp dụng.

Không cam kết total order toàn workspace nếu hạ tầng không bảo đảm.

Event đến sai thứ tự dẫn đến refetch entity/board.

5. Outbox flow

API mở database transaction.

Cập nhật task/comment/invitation.

Ghi OutboxEvent trong cùng transaction.

Commit.

Worker claim event bằng cơ chế chống hai worker xử lý đồng thời.

Phát realtime, tạo notification hoặc email job.

Đánh dấu processed.

Consumer vẫn phải idempotent vì delivery có thể at-least-once.

6. Danh sách job

Job

Trigger

Retry

Dedup key

Send invitation email

invitation.created

5

invitation ID + template version

Create mention notification

comment.created

5

comment ID + recipient

Send due reminder

scheduler

3

task ID + reminder time

Rebalance positions

position exhausted

3

column ID + generation

Remove orphan upload

scheduler

3

storage key

Sync billing event

webhook

10

provider event ID

7. Retry policy

Exponential backoff có jitter.

Phân biệt lỗi retryable và permanent.

Không retry validation/permission error.

Sau max attempts chuyển dead-letter và cảnh báo.

Dashboard nội bộ hiển thị job thất bại, không để người dùng tự chạy tùy ý.

8. Presence và typing

Presence/typing là dữ liệu tạm, không ghi PostgreSQL liên tục. Có TTL và giới hạn tần suất. Đây là V1/V2, không chặn MVP.

