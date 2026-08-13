Test Strategy

1. Mục tiêu

Ưu tiên test các rủi ro gây mất dữ liệu, rò rỉ tenant, sai quyền, conflict và tác dụng phụ trùng. Không chạy theo coverage cao bằng test vô nghĩa.

2. Test pyramid

Unit test

Permission rules.

Plan/quota calculation.

Position calculation.

Validation và normalization.

Notification routing.

Mapping domain error → API error.

Integration test

Repository với PostgreSQL thật.

Transaction invitation acceptance.

Tenant-scoped queries.

Task move optimistic concurrency.

Outbox creation cùng mutation.

Idempotency record.

Migration trên database sạch.

API test

Authenticated/unauthenticated.

Allowed/denied theo role.

Validation status và error code.

Pagination/filter.

Cross-tenant IDOR.

Rate limit ở endpoint quan trọng.

End-to-end

Đăng ký → tạo workspace → mời member → tạo project → giao task → hoàn thành.

Chấp nhận invitation bằng tài khoản mới.

Hai browser cùng mở board và nhận update.

Conflict khi hai user sửa task.

Archive và restore project.

3. Tenant isolation suite

Tạo fixture cố định:

User A là Owner workspace A.

User B là Owner workspace B.

Project/task/comment riêng cho mỗi workspace.

Guest chỉ thuộc một project giới hạn.

Chạy bảng hành động read/update/delete với ID tenant khác và yêu cầu đều thất bại mà không tiết lộ dữ liệu.

4. Concurrency test

Hai request move cùng task với cùng version: đúng một request thành công.

Hai request accept cùng invitation: chỉ một membership và một lần accepted.

Hai webhook cùng event ID: chỉ một lần áp dụng.

Worker retry email: không tạo duplicate ngoài policy.

5. Realtime test

Unauthorized subscription bị từ chối.

Event chỉ đến channel đúng.

Duplicate event không nhân đôi entity ở client.

Reconnect refetch khôi phục trạng thái.

Role bị thu hồi khiến request sau bị chặn.

6. Performance test

Trước V1, seed tối thiểu nhiều workspace, hàng nghìn task và comment. Đo:

Load board.

List task có filter.

Search.

Notification unread.

Activity timeline.

Theo dõi p50/p95/p99, error rate, connection pool và query chậm. Không load test production khi chưa được phép.

7. CI pipeline

Cài dependency bằng lockfile.

Lint và format check.

Typecheck.

Unit test.

Khởi động PostgreSQL/Redis service cho integration.

Validate/generate ORM và chạy migration.

Integration/API test.

Build production.

Security/dependency checks phù hợp.

8. Definition of Done cho feature

Acceptance criteria pass.

Test allowed, denied và invalid input.

Nếu tenant-owned: có cross-tenant test.

Nếu concurrent: có conflict/idempotency test.

Migration và rollback/recovery strategy được xem xét.

Loading/error/empty UI state có test hoặc được xác minh.

