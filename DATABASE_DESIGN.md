Database Design

1. Thực thể chính

Entity

Trường quan trọng

User

id, email, name, emailVerifiedAt, timezone

Session

id, userId, tokenHash, expiresAt, revokedAt

Workspace

id, name, slug, plan, archivedAt, createdAt

Membership

id, workspaceId, userId, role, status

Invitation

id, workspaceId, email, role, tokenHash, expiresAt, acceptedAt

Project

id, workspaceId, name, visibility, leadMembershipId, archivedAt

ProjectMember

projectId, membershipId, accessLevel

Board

id, workspaceId, projectId, name, version

Column

id, workspaceId, boardId, name, position

Task

id, workspaceId, projectId, boardId, columnId, title, position, version

TaskAssignee

taskId, membershipId

Label

id, workspaceId, name, color

TaskLabel

taskId, labelId

Comment

id, workspaceId, taskId, authorMembershipId, body, deletedAt

Attachment

id, workspaceId, taskId, storageKey, mimeType, size

Notification

id, workspaceId, recipientUserId, type, readAt

ActivityEvent

id, workspaceId, actorUserId, action, targetType, targetId, metadata

OutboxEvent

id, workspaceId, type, payload, attempts, processedAt

Subscription

id, workspaceId, providerCustomerId, status, currentPeriodEnd

IdempotencyRecord

workspaceId, key, operation, responseHash, expiresAt

2. Quan hệ

User 1—N Membership N—1 Workspace.

Workspace 1—N Project 1—N Board 1—N Column.

Project 1—N Task; Task tham chiếu board và column để tối ưu nhưng các quan hệ phải nhất quán.

Membership N—N Project qua ProjectMember.

Task N—N Membership qua TaskAssignee.

Task N—N Label qua TaskLabel.

3. Constraints bắt buộc

Unique User.emailNormalized.

Unique Workspace.slug.

Unique (workspaceId, userId) trên Membership.

Unique invitation active theo (workspaceId, emailNormalized) theo chiến lược triển khai.

Unique (workspaceId, id) hoặc composite foreign key khi cần đảm bảo tenant consistency.

Check position >= 0 nếu dùng số dương.

Check thời gian hết hạn lớn hơn thời gian tạo ở application và database khi phù hợp.

Foreign key với delete behavior được quyết định rõ; tránh cascade xóa audit ngoài ý muốn.

4. Index gợi ý

Membership(workspaceId, userId, status)
Project(workspaceId, archivedAt, updatedAt)
Task(workspaceId, projectId, columnId, archivedAt, position)
Task(workspaceId, assignee/query join, dueAt)
Comment(workspaceId, taskId, createdAt)
Notification(recipientUserId, readAt, createdAt)
ActivityEvent(workspaceId, createdAt)
OutboxEvent(processedAt, createdAt)

Chỉ thêm index sau khi có query cụ thể. Kiểm tra query plan với dữ liệu seed đủ lớn.

5. Positioning

Không cập nhật toàn bộ task khi kéo thả. Có thể dùng fractional indexing hoặc khoảng số lớn. Khi không còn khoảng giữa hai vị trí, job/service rebalance các task trong column trong transaction.

6. Optimistic concurrency

Task.version tăng mỗi mutation cạnh tranh. Update dạng:

UPDATE task
SET column_id = :columnId, position = :position, version = version + 1
WHERE id = :id AND workspace_id = :workspaceId AND version = :expectedVersion;

Nếu affected rows bằng 0, trả conflict thay vì ghi đè im lặng.

7. Soft delete và archive

Dùng archivedAt cho workspace/project/task có thể khôi phục.

Dùng deletedAt cho nội dung đã xóa nhưng cần giữ dấu vết.

Query mặc định phải lọc record đã archive/delete.

Hard delete workspace là job quản trị có thời gian chờ, phạm vi rõ và audit.

8. Migration rules

Migration chỉ tiến, có tên mô tả.

Thay đổi phá vỡ dùng expand → migrate data → contract.

Không sửa migration đã chạy trên môi trường dùng chung.

CI chạy migrate trên database sạch và chạy integration test.

Seed tách development/demo khỏi production.

