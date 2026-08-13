# ADR-0004: Resend transactional email

- Status: Accepted
- Date: 2026-08-14

## Decision

- Resend gửi verification/reset qua Supabase custom SMTP và email nghiệp vụ qua Resend API.
- Staging dùng `onboarding@resend.dev` và chỉ gửi đến email được phép trong tài khoản.
- Production cần domain sở hữu riêng trước commercial go-live; dùng subdomain `mail.<domain>` để cô lập reputation.
- Template MVP: verify email, reset password, invitation, membership suspended và workspace deletion scheduled.
- Mỗi lần gửi nghiệp vụ có idempotency key; retry qua outbox, không retry đồng bộ vô hạn.
- Không ghi token, nội dung email đầy đủ hoặc API key vào log.

## Consequences

Vercel domain miễn phí không thể dùng để xác minh sender domain. Production email thực tế bị chặn cho tới khi mua/được cấp một domain có quyền chỉnh DNS và cấu hình SPF/DKIM; DMARC được thêm trước go-live.
