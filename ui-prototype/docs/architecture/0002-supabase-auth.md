# ADR-0002: Supabase Auth

- Status: Accepted
- Date: 2026-08-14

## Decision

- Supabase Auth quản lý email/password, email verification, password reset và Google OAuth.
- Browser dùng publishable key; service-role key chỉ tồn tại server-side.
- Next.js server đọc session bằng `@supabase/ssr`; Proxy làm mới token bằng `getClaims()` và API nhạy cảm xác minh identity mới nhất bằng `getUser()`.
- OAuth callback duy nhất: `/auth/callback`; email confirmation: `/auth/confirm`.
- Redirect allowlist dùng URL chính xác cho production/staging; preview chỉ dùng wildcard Vercel được giới hạn theo account slug.
- Mỗi môi trường dùng Google OAuth client riêng. Không dùng client production cho local/staging.
- `auth.users.id` được tham chiếu từ `public.profiles`; workspace authorization vẫn thực hiện server-side và bằng RLS.
- Suspended membership bị từ chối dù Supabase session còn hợp lệ.

## Redirects

- Local: `http://localhost:3000/auth/callback`
- Staging: `https://taskflow-mvp-staging.vercel.app/auth/callback`
- Production: `https://taskflow-mvp.vercel.app/auth/callback`

## Consequences

- TaskFlow không lưu password hash.
- Verify/reset email do Supabase Auth phát hành token một lần.
- Resend được cấu hình làm custom SMTP cho Supabase ở staging/production.
