Roadmap triển khai

Phase 0 — Foundation

Khởi tạo repository, code style và CI tối thiểu.

Thiết lập PostgreSQL, ORM, migration và seed.

Thiết lập error model, validation, request ID và structured logging.

Tạo design system cơ bản và layout responsive.

Exit: build, migration và test mẫu chạy trong CI.

Phase 1 — Authentication

User, session, register/login/logout.

Email verification và password reset.

Session management và rate limit.

Exit: auth flow E2E pass; token không lưu plaintext.

Phase 2 — Multi-tenant core

Workspace CRUD/archiving.

Membership, role, permission map.

Workspace switcher.

Tenant isolation test suite.

Exit: không có route tenant-owned thiếu authorization test.

Phase 3 — Invitation

Invitation one-time token.

Email job/outbox.

Accept/decline/revoke.

Seat limit cơ bản.

Exit: concurrent accept và retry email không tạo duplicate.

Phase 4 — Project, board, column

Project visibility và project member.

Board mặc định.

Column create/update/reorder.

Archive/restore.

Exit: Guest/private project rules pass.

Phase 5 — Task management

Task CRUD, assignee, label, due date, priority.

Drag/drop và optimistic UI.

Version conflict và activity timeline.

Exit: hai browser thao tác không làm mất dữ liệu.

Phase 6 — Collaboration

Comment và mention.

In-app notification.

Realtime events.

Reconnect/refetch strategy.

Exit: unauthorized channel bị chặn; notification có dedup.

Phase 7 — Files và search

Presigned upload/download.

File policy/quota/cleanup.

Search và filter.

Exit: private files không thể truy cập bằng URL đoán được.

Phase 8 — Billing và plan

Free/Pro feature limits.

Checkout/customer portal sandbox.

Signed idempotent webhook.

Downgrade behavior.

Exit: webhook replay không thay state hai lần.

Phase 9 — Production hardening

Observability, alert, backup/restore drill.

Performance/query tuning.

CSP, security regression suite.

Accessibility và Core Web Vitals.

Runbook sự cố.

Exit: release checklist hoàn tất và staging ổn định.

Backlog sau V1

Checklist/subtask/dependency.

Recurring task.

Calendar và timeline view.

Automation rule.

Public API và webhook.

Template.

Import/export.

AI copilot theo 14-AI_FEATURES.md.

