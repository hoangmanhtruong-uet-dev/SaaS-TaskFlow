API Specification

1. Quy ước

Base path: /api/v1.

JSON dùng camelCase; timestamp ISO 8601 UTC.

Session từ cookie bảo mật hoặc token theo chiến lược auth; không nhận user ID từ body.

Mutation hỗ trợ Idempotency-Key ở những endpoint dễ gửi lặp.

List dùng cursor pagination.

Error có mã ổn định để client xử lý.

2. Response envelope

{
  "data": {},
  "meta": { "requestId": "req_..." }
}

{
  "error": {
    "code": "TASK_VERSION_CONFLICT",
    "message": "Task has changed",
    "details": {}
  },
  "meta": { "requestId": "req_..." }
}

3. Status code

200/201/204: thành công.

400: input sai.

401: chưa authenticated.

403: đã biết user nhưng không có quyền; dùng cẩn thận để không rò rỉ tài nguyên.

404: tài nguyên không tồn tại trong tenant context.

409: conflict, duplicate hoặc version mismatch.

422: nghiệp vụ không thể xử lý.

429: rate limit/quota.

4. Endpoints MVP

Auth

POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/verify-email
POST   /auth/password/forgot
POST   /auth/password/reset
GET    /auth/sessions
DELETE /auth/sessions/:sessionId

Workspace

GET    /workspaces
POST   /workspaces
GET    /workspaces/:workspaceId
PATCH  /workspaces/:workspaceId
POST   /workspaces/:workspaceId/archive

Member và invitation

GET    /workspaces/:workspaceId/members
PATCH  /workspaces/:workspaceId/members/:membershipId
DELETE /workspaces/:workspaceId/members/:membershipId
POST   /workspaces/:workspaceId/invitations
GET    /workspaces/:workspaceId/invitations
DELETE /workspaces/:workspaceId/invitations/:invitationId
POST   /invitations/:token/accept
POST   /invitations/:token/decline

Project và board

GET    /workspaces/:workspaceId/projects
POST   /workspaces/:workspaceId/projects
GET    /workspaces/:workspaceId/projects/:projectId
PATCH  /workspaces/:workspaceId/projects/:projectId
POST   /workspaces/:workspaceId/projects/:projectId/archive
GET    /workspaces/:workspaceId/projects/:projectId/boards
POST   /workspaces/:workspaceId/projects/:projectId/boards
PATCH  /workspaces/:workspaceId/boards/:boardId

Column và task

POST   /workspaces/:workspaceId/boards/:boardId/columns
PATCH  /workspaces/:workspaceId/columns/:columnId
POST   /workspaces/:workspaceId/columns/reorder
GET    /workspaces/:workspaceId/projects/:projectId/tasks
POST   /workspaces/:workspaceId/tasks
GET    /workspaces/:workspaceId/tasks/:taskId
PATCH  /workspaces/:workspaceId/tasks/:taskId
POST   /workspaces/:workspaceId/tasks/:taskId/move
POST   /workspaces/:workspaceId/tasks/:taskId/archive

Comment, activity, notification

GET    /workspaces/:workspaceId/tasks/:taskId/comments
POST   /workspaces/:workspaceId/tasks/:taskId/comments
PATCH  /workspaces/:workspaceId/comments/:commentId
DELETE /workspaces/:workspaceId/comments/:commentId
GET    /workspaces/:workspaceId/activity
GET    /notifications
POST   /notifications/:notificationId/read
POST   /notifications/read-all

5. Ví dụ move task

Request:

{
  "destinationColumnId": "col_123",
  "beforeTaskId": "task_456",
  "afterTaskId": null,
  "expectedVersion": 7
}

Response trả task với version: 8. Nếu version hiện tại không phải 7, trả 409 và trạng thái server mới nhất.

6. Pagination và filter

?cursor=opaque_cursor&limit=50
?assigneeId=...&status=...&due=overdue

Cursor là opaque đối với client. limit có min/max. Sort phải deterministic, thường kết hợp createdAt và id.

7. API checklist

Schema validation cho params, query và body.

Authorization tại service.

Tenant-scoped query.

DTO response allowlist, không serialize model tùy ý.

Rate limit theo IP/user/workspace tùy endpoint.

Idempotency cho invitation, task create nhạy cảm và billing webhook.

Audit cho mutation quản trị.

