# ADR-0001: Vercel runtime và môi trường

- Status: Accepted
- Date: 2026-08-14

## Context

Ứng dụng hiện chạy Vinext/Cloudflare Sites. Sản phẩm thương mại cần public authentication, preview deployments và một đường vận hành phổ biến cho Next.js.

## Decision

- Runtime đích: Next.js trên Vercel.
- Production project: `taskflow-mvp`; domain đề xuất `https://taskflow-mvp.vercel.app`.
- Staging project riêng: `taskflow-mvp-staging`; domain đề xuất `https://taskflow-mvp-staging.vercel.app`.
- API dùng same-origin `/api/v1`; không tạo API domain riêng để tránh CORS và chi phí domain.
- `main` triển khai production; branch `staging` triển khai staging; pull request tạo preview deployment.
- Local và test dùng Supabase CLI. Staging và production mỗi môi trường dùng một Supabase project riêng.
- Bản Cloudflare Sites hiện tại được giữ làm rollback reference đến khi Vercel production qua smoke test.

Tên `vercel.app` chỉ là tên mong muốn; phải coi là provisional cho đến khi Vercel xác nhận khả dụng.

## Consequences

- Hai Vercel Hobby projects thay cho custom environment trả phí.
- Hai Supabase projects dùng hết quota hai free projects. Free projects có thể pause khi không hoạt động; production thương mại phải nâng cấp trước go-live có SLA.
- D1/Worker code phải được thay bằng Postgres/Next runtime trước cutover; không deploy bundle Cloudflare hiện tại lên Vercel.
