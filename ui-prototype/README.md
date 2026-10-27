# TaskFlow — Ứng dụng Next.js

Đây là source code ứng dụng TaskFlow (Next.js 16, React 19, Supabase, Drizzle ORM, PayOS).

> [!WARNING]
> **Trạng thái: NO-GO.** Ứng dụng chưa đủ điều kiện go-live; nhiều màn hình authenticated còn mock, luồng PayOS chưa hoàn chỉnh và CI đang đỏ.
> Đọc báo cáo đầy đủ tại [`../AUDIT_REPORT.md`](../AUDIT_REPORT.md) và hướng dẫn tổng quan tại [`../README.md`](../README.md).

## Chạy local

```bash
npm ci
cp .env.example .env.local
# Điền biến môi trường thật (xem ../README.md mục 5)
npm run dev
```

Yêu cầu Node.js `>= 22.13.0`.

## Kiểm tra chất lượng

```bash
npx tsc --noEmit
npm run lint
npm test
npm run test:security
npm run test:architecture
npm run test:migrations
npm run env:check
npm audit --omit=dev --audit-level=high
```

## Database

- Schema nguồn: `db/schema.ts`
- Migration nguồn: `supabase/migrations/*.sql` (17 file)
- Local: `npm run supabase:start` và `npm run supabase:reset`
- Staging/production: `npx supabase db push --db-url "$SUPABASE_DB_URL"` sau khi backup

## Lưu ý cấu hình

`.env.example` hiện còn biến `STRIPE_*` và thiếu `PAYOS_*`, `CLOUDINARY_*`. Đây là sai lệch đã được ghi nhận trong audit; cần cập nhật trước khi onboarding hoặc deploy.

## Tài liệu

- [`../AUDIT_REPORT.md`](../AUDIT_REPORT.md) — kết quả audit và blocker go-live
- [`../README.md`](../README.md) — hướng dẫn cài đặt, kiến trúc, deploy
- [`docs/GO_LIVE_STATUS.md`](./docs/GO_LIVE_STATUS.md) — nhật ký go-live nội bộ
- [`docs/PRODUCTION_MOCK_AUDIT.md`](./docs/PRODUCTION_MOCK_AUDIT.md) — kiểm kê mock
