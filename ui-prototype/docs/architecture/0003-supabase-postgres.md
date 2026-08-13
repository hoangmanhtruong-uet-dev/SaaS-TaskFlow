# ADR-0003: Supabase Postgres

- Status: Accepted
- Date: 2026-08-14

## Decision

- PostgreSQL là source of truth production; schema đặt tại `supabase/migrations`.
- UUID là khóa chính. Mọi bảng tenant-owned có `workspace_id` và foreign key rõ ràng.
- RLS bật trên mọi bảng public chứa dữ liệu người dùng; server authorization vẫn bắt buộc, RLS là lớp phòng thủ thứ hai.
- Migration forward-only; thay đổi phá vỡ theo expand → backfill → contract.
- Local/test chạy migration trên Supabase CLI sạch. Staging chạy trước production.
- Backup production trước migration; free tier dùng `supabase db dump` theo lịch ngoài nền tảng.
- Transaction PostgreSQL thay cho D1 batch trong mutation nhiều bảng.

## Isolation invariant

Không truy vấn entity tenant-owned chỉ bằng `id`. Điều kiện phải chứa `workspace_id`, hoặc join đến membership active trong cùng workspace. Project private yêu cầu `project_members` trừ Owner/Admin.

## Consequences

- Migration SQLite/D1 cũ được giữ cho lịch sử, không chạy trên Supabase.
- Cutover cần repository adapter PostgreSQL và data migration riêng; không chuyển dữ liệu D1 ngầm định.
