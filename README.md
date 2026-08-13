TaskFlow SaaS — Bộ tài liệu định hướng

TaskFlow là SaaS quản lý công việc đa tổ chức, lấy cảm hứng từ Trello và Linear. Sản phẩm cho phép một người tham gia nhiều workspace, cộng tác trên project, board và task theo thời gian thực, đồng thời hỗ trợ phân quyền, thông báo, tệp đính kèm, audit log và gói thuê bao.

Mục tiêu học tập

Xây dựng SaaS multi-tenant đúng cách, không để rò rỉ dữ liệu giữa các workspace.

Thiết kế RBAC theo vai trò và quyền trên tài nguyên.

Xử lý realtime, notification, background jobs và file upload.

Luyện transaction, idempotency, cache, rate limit và audit log.

Hoàn thiện test, CI, observability và quy trình triển khai production.

Phạm vi phiên bản

Phiên bản

Nội dung

MVP

Auth, workspace, thành viên, project, board, task, comment, activity log cơ bản

V1

Realtime, notification, attachment, search, invitation hoàn chỉnh

V2

Gói thuê bao, usage limits, analytics, automation

V3

AI copilot, template marketplace, public API, webhook

Thứ tự đọc

01-PRODUCT_VISION.md

02-PRD.md

03-USER_FLOW.md

04-ROLE_PERMISSION.md

05-BUSINESS_RULES.md

06-SYSTEM_ARCHITECTURE.md

07-DATABASE_DESIGN.md

08-API_SPEC.md

09-REALTIME_AND_JOBS.md

10-SECURITY.md

11-TEST_STRATEGY.md

12-ROADMAP.md

13-AGENT_IMPLEMENTATION_GUIDE.md

14-AI_FEATURES.md

Stack mặc định

Web và API: Next.js, TypeScript.

UI: Tailwind CSS và một thư viện component có accessibility tốt.

Database: PostgreSQL, Prisma ORM.

Cache, rate limit, queue nhẹ: Redis.

Realtime: WebSocket hoặc dịch vụ realtime tương đương.

Object storage: dịch vụ tương thích S3.

Email: nhà cung cấp transactional email.

Test: unit, integration, API và end-to-end.

CI/CD: GitHub Actions; triển khai web và worker độc lập.

Không khóa cứng phiên bản thư viện trong tài liệu. Agent phải kiểm tra tài liệu chính thức trước khi cài đặt.

Nguyên tắc kiến trúc

PostgreSQL là source of truth.

Mọi dữ liệu nghiệp vụ đều phải gắn với workspaceId trực tiếp hoặc gián tiếp.

Backend không tin workspaceId, role, userId do client tự khai báo.

Authorization được kiểm tra tại service layer cho từng hành động.

Realtime chỉ báo thay đổi; client phải có khả năng tải lại trạng thái từ API.

Tác vụ chậm hoặc cần retry chạy trong worker.

Không thêm microservice khi modular monolith vẫn đáp ứng được.

Definition of Done toàn dự án

Lint, typecheck, unit test, integration test và build đều pass.

Migration có thể chạy trên database sạch.

API quan trọng có authorization test và tenant-isolation test.

Không commit secret hoặc dữ liệu thật.

Có empty, loading, error và unauthorized state trên UI.

Có log có cấu trúc và request ID cho lỗi backend.

README gốc của repository có hướng dẫn chạy local và tài khoản seed.

