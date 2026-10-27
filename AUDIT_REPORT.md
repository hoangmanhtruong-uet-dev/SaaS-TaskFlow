# Báo cáo Kiểm toán Go-Live — TaskFlow

**Ngày audit:** 28/10/2026  
**Phạm vi:** `ui-prototype/` (Next.js app), database schema/migrations, API, UI authenticated, CI, dependency, cấu hình môi trường.  
**Nhánh:** `release/go-live` · **HEAD:** `da7c802` · **Working tree:** 227 thay đổi chưa commit.  
**Kết luận:** **NO-GO** — chưa được triển khai production.

> Báo cáo này thay thế báo cáo ngày 30/09/2026. Các kết luận cũ về Stripe, lint pass và trạng thái "READY FOR GO-LIVE" không còn đúng sau khi chuyển sang PayOS và phát sinh thay đổi chưa commit.

---

## 1. Tóm tắt điều hành

TaskFlow có nền tảng backend/database tốt: 59 API route, 28 bảng, 33 RLS policy, 17 migration, auth/MFA, CSP/CSRF, rate limit và nhiều test bảo mật đang pass. Tuy nhiên, sản phẩm **chưa đủ điều kiện go-live** vì lớp giao diện authenticated còn nhiều mock, luồng thanh toán chưa hoàn chỉnh, CI đỏ và chưa có bằng chứng staging.

### 1.1. Các cổng kiểm soát

| Cổng | Kết quả | Bằng chứng |
|---|---|---|
| TypeScript | ✅ PASS | `npx tsc --noEmit` exit code 0 |
| Production build | ✅ PASS | `npm run build` thành công; 59 page; BUILD_ID được tạo |
| Lint | ❌ FAIL | 15 errors, 8 warnings |
| Rendered/contract tests | ❌ FAIL | 7/10 pass; 3 fail |
| Security tests | ❌ FAIL | 45/48 pass; 3 fail |
| Architecture tests | ❌ FAIL | 10/12 pass; 2 fail |
| Migration safety | ✅ PASS | 17 migration |
| Env contract | ✅ PASS | 29 biến, ranh giới public/secret đúng |
| Dependency audit | ❌ FAIL | 7 lỗ hổng: 2 critical, 4 high, 1 moderate |
| Health readiness | ❌ FAIL | `/api/health/ready` → `503`, database down |
| E2E P0 | ⛔ BLOCKED | Thiếu tài khoản, workspace/task fixture |
| Database security audit | ⛔ BLOCKED | Không có DB staging truy cập được |
| Backup/restore rehearsal | ⛔ BLOCKED | Cần `APP_ENV=staging` + target |
| Release hygiene | ❌ FAIL | 227 thay đổi chưa commit; Git repo lồng nhau |

**Tổng số test fail:** 8 test case (3 security + 2 architecture + 3 rendered).  
**Tổng số lỗ hổng production dependency:** 7 (2 critical, 4 high, 1 moderate).  
**Số màn hình authenticated còn mock:** tối thiểu 14 route.

---

## 2. Phương pháp audit

Đã thực hiện:

- Đọc source, route handler, component, schema, migration và tài liệu.
- Chạy typecheck, build, lint, test suites, env check, npm audit.
- Khởi chạy bản production build (`next start`) và kiểm tra các endpoint công khai.
- Đối chiếu tài liệu go-live/mock audit với code hiện tại.
- Kiểm tra Git history, worktree, cấu trúc repo và CI workflow.

Không thực hiện:

- Không gọi PayOS/Resend/Sentry production.
- Không chạy migration hay thao tác ghi lên database thật.
- Không chạy E2E authenticated vì thiếu fixture.
- Không thực hiện penetration test chuyên sâu.

---

## 3. Phát hiện P0 — Chặn go-live

### P0-01. Mock dữ liệu và thao tác giả trong khu vực authenticated

**Mức độ:** Critical — sai lệch dữ liệu, mất niềm tin người dùng, rủi ro vận hành.

Ít nhất các route sau đang hiển thị hoặc thao tác trên dữ liệu mock/local state:

| Route | Nguồn mock / hành vi |
|---|---|
| `/app/projects` | `ProjectDashboardContainer` → `useProjectManagement()` khởi tạo `MOCK_PROJECTS`; create/edit/delete/archive chỉ đổi React state |
| `/app/projects/[projectId]/list` | `mockTasks` hardcode trong page |
| `/app/projects/[projectId]/files` | `mockFiles` hardcode trong page |
| `/app/calendar` | `MOCK_CALENDAR_TASKS`, `MOCK_UNSCHEDULED_TASKS`, `MOCK_GOOGLE_CALENDAR_EVENTS` |
| `/app/notifications` | `MOCK_NOTIFICATIONS`; read/delete/reply chỉ local |
| `/app/activity` | `MOCK_ACTIVITY_LOGS` |
| `/app/archived` | `MOCK_ARCHIVED_ITEMS`; restore/delete chỉ local |
| `/app/settings/billing` | Hardcode PRO, 12/25 seat, hóa đơn, thẻ Stripe; cập nhật local |
| `/app/settings/security` | `MOCK_2FA_CONFIG`, `MOCK_ACTIVE_SESSIONS`, `MOCK_SECURITY_LOGS` |
| `/app/settings/workspace` | `mockWorkspaceMembers`, `mockExportHistory`; save/DNS/transfer/delete dùng `setTimeout` và báo thành công giả |
| `/app/settings/permissions` | `mockProjectOverrides`, `mockWorkspaceProjectsList`; save local |
| `/app/settings/integrations` | `initialAppsList`, `initialWebhooks`, `initialApiKeys` |
| `/app/settings/notifications` | `INITIAL_NOTIFICATION_STATE`; lưu local |
| `/app/settings/profile` | Fallback profile giả khi lỗi; đổi email không hoạt động thật |

Ngoài ra:

- `/app/members`: tab permission matrix đọc `MOCK_PERMISSION_MATRIX`; nút copy invitation tạo link giả `https://taskflow.io/invite/ws-dev-8849?...`.
- `/app/tasks`: danh sách task lấy API thật nhưng assignee luôn gán `"Tôi"`, số subtask/attachment/comment được tạo công thức; tick hoàn thành chỉ đổi local state.
- `LiveDashboard`: vẫn tạo `subtasksTotal: 4`, `attachmentCount`, `commentCount` không lấy từ DB.
- `QuickCreateTaskModal`: còn nút "Nạp dữ liệu mẫu (1-Click Demo)" trong luồng authenticated, tạo project mẫu thật trong workspace.

**Tác động:** người dùng có thể nhìn thấy dữ liệu không tồn tại, tưởng thao tác đã lưu, hoặc bị mất dữ liệu khi refresh. Đây là blocker trực tiếp cho go-live.

**Hướng khắc phục:** với mỗi route, chọn một trong hai:

1. Nối vào API/service thật và có loading/error/empty state.
2. Ẩn khỏi navigation và chặn route (feature flag/404) cho đến khi hoàn thiện.

Không được giữ fallback mock khi API lỗi.

---

### P0-02. Luồng thanh toán giả và không nhất quán

**Mức độ:** Critical — rủi ro doanh thu và pháp lý.

Bằng chứng:

- `app/checkout/page.tsx`: nút thanh toán chỉ `setTimeout(1500)` rồi `router.push("/checkout/success")`. Không gọi PayOS, không xác thực chữ ký, không kiểm tra trạng thái đơn. Trang hiển thị "THANH TOÁN AN TOÀN STRIPE".
- `app/checkout/success/page.tsx`: tuyên bố workspace đã nâng cấp Pro mà không có webhook/subscription thật.
- `app/components/settings/billing/useBillingManager.ts`: hardcode `currentPlanId = "pro"`, `seatsUsed = 12`, `seatsTotal = 25`, ngày gia hạn, hóa đơn, thẻ và địa chỉ. Các thao tác update/cancel chỉ đổi state.
- `app/components/settings/billing/UpdateCardModal.tsx`: hiển thị "Stripe Element", "mã hóa qua Stripe" — sai với PayOS.
- `/app/settings/billing` (mock) và `/app/settings` (dùng `BillingSettings` thật) là hai UI billing khác nhau, có thể mâu thuẫn trạng thái.
- `app/api/v1/workspaces/[workspaceId]/billing/portal/route.ts`: luôn trả `501 NOT_IMPLEMENTED`, nhưng UI vẫn hiển thị nút "Quản lý trong Billing Portal".

**Tác động:** người dùng có thể tưởng đã thanh toán thành công, trong khi hệ thống không ghi nhận giao dịch; hoặc ngược lại, giao dịch thật nhưng UI hiển thị sai.

**Hướng khắc phục:** xóa trang `/checkout` giả; chỉ giữ một UI billing duy nhất; checkout phải tạo PayOS link thật; trạng thái PRO chỉ được cập nhật bởi webhook đã xác thực.

---

### P0-03. Tích hợp PayOS chưa đủ tin cậy để xử lý tiền

**Mức độ:** Critical — sai lệch entitlement, trùng giao dịch, thất thoát doanh thu.

Bằng chứng trong `app/api/v1/workspaces/[workspaceId]/billing/checkout/route.ts` và `db/billing.ts`:

1. **`orderCode` không duy nhất:**
   ```ts
   const orderCode = Number(String(new Date().getTime()).slice(-6));
   ```
   Chỉ lấy 6 chữ số cuối của timestamp → không gian 1.000.000 giá trị; có thể trùng giữa các lần checkout hoặc giữa các workspace. Không có unique constraint đảm bảo.

2. **Idempotency key được đọc nhưng không dùng:**
   ```ts
   const idempotencyKey = readIdempotencyKey(request);
   if (!idempotencyKey) return fail(...);
   ```
   Sau đó không lưu vào `idempotency_records` và không dùng để chống retry. Retry checkout tạo thêm PayOS link và bản ghi subscription.

3. **Mỗi checkout insert một subscription mới:**
   ```ts
   await db.insert(subscriptions).values({ workspaceId, providerCustomerId: String(orderCode), status: "PENDING", ... });
   ```
   Không upsert theo workspace. Nếu người dùng hủy rồi checkout lại, có nhiều bản ghi cùng workspace. `getBillingSummary` dùng `.maybeSingle()`, sẽ lỗi khi có nhiều bản ghi.

4. **Webhook không đối soát số tiền/seat/giá:**
   `syncPayOSSubscription` chỉ tìm subscription theo `orderCode` rồi set `active`. Không kiểm tra `amount`, currency, quantity so với giá gói. Một giao dịch giá thấp có thể kích hoạt gói Pro.

5. **Không xử lý hủy/hết hạn:** webhook chỉ xử lý trạng thái thành công; không có cơ chế đồng bộ PayOS cancel/expire, không có cron expire subscription.

6. **Race condition idempotency:** `hasProcessedPayOSEvent` (SELECT) rồi `syncPayOSSubscription` (batch INSERT/UPDATE) không nằm trong cùng transaction khóa; hai webhook đồng thời có thể cùng xử lý.

7. **Lỗi webhook trả `400` cho mọi exception**, kể cả orderCode không tồn tại; PayOS sẽ retry liên tục. Log dùng `console.log` thay vì structured logging.

8. **Cấu hình PayOS optional:** `payosEnv` cho phép thiếu cả 3 biến; production có thể build thành công nhưng fail khi thanh toán.

**Hướng khắc phục:**

- Dùng orderCode tăng dần/ULID và lưu unique.
- Lưu idempotency trong cùng transaction; unique `(workspace_id)` cho subscription hoặc upsert.
- Webhook verify signature, so khớp `amount`, `currency`, `orderCode`, workspace; ghi idempotency atomically.
- Xử lý cancel/expire; cron đối soát định kỳ.
- Bắt buộc cấu hình PayOS ở production; fail-fast khi khởi động.

---

### P0-04. Lỗ hổng dependency production

**Mức độ:** Critical — có CVE critical trong framework.

`npm audit --omit=dev`:

| Package | Severity | Vấn đề chính |
|---|---|---|
| `next@16.3.6` | Critical | RCE/SSRF/cache poisoning trong Image Optimization, Server Actions, `use cache` |
| `@sentry/nextjs@10.70.0` | Critical | Middleware bypass khi dùng tunnel route |
| `zod@4.4.3` | High | Memory exhaustion với collection lớn |
| `sharp` | High | Lỗ hổng librsvg |
| `source-map-js` | High | Event-loop DoS |
| `fast-uri` | Moderate | URI scheme spoofing/host confusion |
| `brace-expansion` | High | ReDoS/stack exhaustion |

**Hướng khắc phục:** nâng `next` ra ngoài vùng ảnh hưởng (audit báo range `16.0.0 – 16.4.0`), `@sentry/nextjs` lên bản vá, `zod >= 4.6.6`, cập nhật transitive dependencies; chạy lại build/test/E2E.

---

### P0-05. CI và test suite đỏ

**Mức độ:** Critical — không có cổng chất lượng đáng tin cậy.

- `npm run lint`: 15 errors, 8 warnings.
  - `no-explicit-any`, `no-require-imports` trong `app/lib/payos.ts`, `db/billing.ts`.
  - `set-state-in-effect` trong `useMyTasks.ts`, các component khác.
  - unused vars trong `db/billing.ts`, `use-connection-sync.ts`, `useTeamManagement.ts`.
  - `no-unused-expressions` trong `scripts/test-connections.mjs`.
- `npm run test:security`: 45/48 pass. 3 fail:
  - `checkout and write APIs require stable idempotency keys` — checkout chưa persist idempotency.
  - `every mutation route has an explicit authentication or signature boundary` — route PayOS webhook không khớp allowlist của test (test cần cập nhật hoặc route cần boundary rõ hơn).
  - `high-cost and identity endpoints are database rate limited without storing raw emails` — portal trả 501, không có rate limit.
- `npm run test:architecture`: 10/12 pass. 2 fail:
  - Test còn tìm `stripe-signature` trong khi app đã chuyển PayOS.
  - Test đọc `app/lib/stripe.ts` đã bị xóa.
- `node --test tests/rendered-html.test.mjs`: 7/10 pass. 3 fail:
  - Test kỳ vọng route `/ui` và `/screens` tồn tại, nhưng đã bị xóa.
  - Test kỳ vọng `visibilityState` trong `use-connection-sync.ts`, hiện không có.
- `git diff --check`: fail trailing whitespace ở nhiều file.

Đây là test contract cũ, không phải bằng chứng sản phẩm hỏng hoàn toàn — nhưng CI đỏ nghĩa là không thể tin tưởng release gate.

---

### P0-06. Chưa có bằng chứng staging / database

**Mức độ:** Critical — không thể xác nhận RLS, migration, backup và E2E.

- `next start` trên bản build:
  - `/api/health/live` → `200`.
  - `/` → `200`.
  - `/login` → `200`.
  - `/api/health/ready` → `503`, log `getaddrinfo ENOTFOUND` cho host DB cấu hình trong `.env.local`.
- `npm run test:e2e:critical`: tất cả test bị skip nếu thiếu `E2E_RUN_AUTH`, workspace/task ID và tài khoản OWNER/ADMIN/MEMBER/GUEST.
- `npm run test:security:database`: không chạy được vì thiếu `SUPABASE_DB_URL`.
- `npm run test:recovery:staging`: từ chối chạy ngoài `APP_ENV=staging`.

**Tác động:** không có bằng chứng rằng RLS, migration, backup/restore và luồng 4 role hoạt động trên môi trường giống production.

---

### P0-07. Release chưa được đóng băng

**Mức độ:** High — không xác định được chính xác bản release.

- `ui-prototype` đang ở nhánh `release/go-live`, HEAD `da7c802`, nhưng có **227 thay đổi chưa commit**.
- Repo gốc cũng theo dõi `ui-prototype/`, trong khi `ui-prototype/.git` là một repo riêng → lịch sử trùng lặp, khó xác định commit nào được deploy.
- Có hai bộ CI workflow (root `.github/workflows` và `ui-prototype/.github/workflows`) với nội dung khác nhau.
- Các file rác chưa track: `eslint-report.json` (~1 MB), `lint-errors.txt`, `remaining-errors.txt`.
- Nhiều tài liệu mâu thuẫn: README cũ ghi "READY FOR GO-LIVE", `docs/GO_LIVE_STATUS.md` ghi NO-GO và số liệu lint cũ.

**Hướng khắc phục:** chọn một repo, commit toàn bộ thay đổi có chủ đích, tag release, xóa file rác, đồng bộ tài liệu, đảm bảo CI chạy trên đúng thư mục.

---

## 4. Phát hiện P1 — Cần xử lý trước khi mở rộng

### P1-01. Realtime chưa được xác minh

`app/hooks/use-connection-sync.ts` đã chuyển từ polling sang Supabase channel, nhưng:

- Subscribe toàn bộ bảng `tasks`, không filter theo workspace/project; phụ thuộc RLS để lọc.
- Không xử lý `document.visibilityState` (test cũ vẫn kỳ vọng).
- Callback nhận `payload` nhưng không dùng (lint error).
- `refetch` trong dependency array có thể gây subscribe lại nếu hàm không ổn định.
- Chưa có E2E 2 client xác nhận cập nhật < 500ms.

### P1-02. My Tasks và dashboard còn dữ liệu dẫn xuất giả

- `assigneeName: "Tôi"`, `assigneeAvatar: "T"` cho mọi task.
- `checklistTotal`, `attachmentCount`, `commentCount` không lấy từ DB.
- `toggleTaskComplete` chỉ `setTasks`, không gọi API → refresh sẽ mất trạng thái.
- `LiveDashboard` tạo subtask/attachment/comment count theo công thức `idx`.

### P1-03. Members / permission chưa hoàn chỉnh

- Tab permission matrix dùng `MOCK_PERMISSION_MATRIX`.
- Copy invitation tạo link giả, không dùng token thật từ API.
- Chưa có E2E role matrix trên staging.

### P1-04. Profile và đổi email

- `app/app/settings/profile/page.tsx` fallback về tên/email/avatar giả khi lỗi.
- `EmailChangeModal` còn nhánh network fallback sinh OTP client-side và hiển thị OTP; API `/profile/email-otp` hiện trả `410`, nên UI không khớp backend.
- Cần chuyển sang Supabase email change flow hoặc ẩn tính năng.

### P1-05. Demo seeding trong production UI

`QuickCreateTaskModal` còn nút "Nạp dữ liệu mẫu" trong `/app`; nên chỉ giữ ở môi trường demo/dev hoặc xóa.

### P1-06. Cấu hình và tài liệu lệch

- `.env.example` còn `STRIPE_*`, thiếu `PAYOS_*`, `CLOUDINARY_*`.
- `.github/workflows/staging-e2e.yml`, `scripts/run-staging-e2e.mjs`, `e2e/README.md`, `docs/STAGING_READINESS.md`, `docs/operations/secrets.md`, ADR-0005 vẫn nói Stripe.
- `ui-prototype/README.md` vẫn ghi Stripe và "production-oriented".
- `app/checkout/page.tsx` và `operations-views.tsx` vẫn có copy "Stripe".

### P1-07. Settings thao tác giả

Các hành động nhạy cảm đang báo thành công mà không lưu server:

- Xóa workspace, chuyển owner, đổi subdomain, kiểm tra DNS, export dữ liệu.
- Bật/tắt 2FA, quản lý session, connected accounts.
- Lưu permission override.
- Kết nối integration, tạo API key/webhook.

Đây là rủi ro niềm tin và vận hành; cần implement hoặc vô hiệu hóa rõ ràng.

---

## 5. Điểm mạnh đã xác nhận

- **Database schema:** 28 bảng, 33 RLS policy, 17 migration; migration safety pass.
- **API:** 59 route handler; nhiều route có auth, rate limit, idempotency, transaction.
- **Bảo mật nền tảng:** CSP nonce, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSRF Origin/Fetch Metadata, service-role server-only.
- **Auth:** Supabase SSR, MFA, session management, password reset; test auth lifecycle pass.
- **Tenant isolation:** test IDOR/tenant pass; RLS policy helpers và test database hardening pass.
- **Attachment/checklist/reminder:** có migration, API, test pass.
- **Build/typecheck:** ổn định; production build chạy được.
- **Observability:** Sentry, structured log, request ID, health endpoint.
- **Tài liệu:** nhiều đặc tả và audit nội bộ; cần đồng bộ lại.

---

## 6. Bảng trạng thái chức năng

| Chức năng | Code | UI | Test | Kết luận |
|---|---|---|---|---|
| Auth / MFA / session | ✅ | ✅ | ✅ | Sẵn sàng code-level; cần E2E |
| Workspace / member / invite | 🟡 | 🟡 | 🟡 | Danh sách thật; permission/invite link mock |
| Project API | ✅ | — | ✅ | Sẵn sàng |
| Project UI | — | ❌ | — | Mock |
| Task / Kanban | 🟡 | 🟡 | 🟡 | Board thật; metadata/assignee giả |
| Comment / mention / checklist / attachment | ✅ | 🟡 | ✅ | Backend tốt; UI cần E2E |
| Realtime | 🟡 | 🟡 | ❌ | Chưa xác minh 2 client |
| Search | ✅ | ✅ | ✅ | Hoạt động |
| Notifications | ✅ | ❌ | — | UI mock |
| Activity | ✅ | ❌ | — | UI mock |
| Archived | ✅ | ❌ | — | UI mock |
| Calendar | 🟡 | ❌ | — | UI mock |
| Billing/PayOS | 🟡 | ❌ | ❌ | Chưa đủ tin cậy |
| Settings (security/workspace/permissions/integrations/notifications) | 🟡 | ❌ | — | Phần lớn mock |
| Email Resend | ✅ | — | 🟡 | Cần verify domain production |
| Sentry/health/cron | 🟡 | — | 🟡 | Readiness đang fail |

---

## 7. Checklist GO-LIVE

Chỉ chuyển sang **GO** khi tất cả mục dưới đây có bằng chứng:

- [ ] CI `main` xanh: typecheck, lint, build, security, architecture, rendered, E2E smoke.
- [ ] `npm audit --omit=dev --audit-level=high` trả 0.
- [ ] Không còn mock/local state trong `/app/*`.
- [ ] Không còn `/checkout` giả; chỉ một luồng PayOS.
- [ ] PayOS sandbox E2E: checkout → webhook → entitlement; replay không duplicate; cancel/expire đúng.
- [ ] Staging DB: migration 17 file, RLS audit, tenant isolation, last-owner concurrency.
- [ ] Backup/restore rehearsal có checksum và RPO/RTO.
- [ ] E2E 4 role + tenant isolation + realtime 2 client + attachment/checklist/calendar.
- [ ] `/api/health/ready` trả 200 trên staging/production.
- [ ] Release snapshot được tag; không còn thay đổi vô chủ; một repo duy nhất.
- [ ] Sentry alert, Slack/Telegram alert, log retention hoạt động.
- [ ] Rollback runbook đã diễn tập.
- [ ] Legal: LICENSE, privacy/terms, chính sách hoàn tiền nếu thu phí.
- [ ] Load test staging có báo cáo P95/P99 và error rate.

---

## 8. Thứ tự khắc phục đề xuất

1. **Đóng băng release** — chọn repo, commit/tag, xóa file rác, đồng bộ CI.
2. **Khôi phục DB/staging** — sửa env, chạy migration, readiness 200.
3. **Dọn mock UI** — ẩn hoặc implement 14 route; ưu tiên projects, billing, settings.
4. **Hoàn thiện PayOS** — orderCode, idempotency, amount, unique subscription, cancel/expire.
5. **Nâng dependency + sửa lint/test** — CI xanh.
6. **Chạy E2E/security/backup** — lấy bằng chứng staging.
7. **Diễn tập go-live/rollback** — chỉ deploy khi checklist P0 hoàn tất.

Ước tính sơ bộ: **2–4 tuần cho nhóm P0 với 2 kỹ sư**, chưa tính thời gian chờ cấp tài khoản/staging hoặc phê duyệt nghiệp vụ.

---

## 9. Giới hạn của báo cáo

- Kết quả test phản ánh working tree hiện tại (227 thay đổi chưa commit), không phải một commit release bất biến.
- Không có quyền truy cập staging/production DB; các kết luận về RLS/migration dựa trên static test và migration safety, không phải chạy thật.
- Không chạy E2E authenticated do thiếu fixture; không kết luận các luồng đó pass.
- Không thực hiện pentest, load test hoặc đánh giá hạ tầng Vercel/Supabase thực tế.
- Không hiển thị hoặc trích xuất giá trị secret từ `.env.local`.
- Một số lỗi test là test contract cũ (Stripe, `/ui`), không đồng nghĩa code production hỏng; nhưng vẫn là blocker vì CI không xanh.

---

## 10. Phụ lục — lệnh đã chạy

```text
npx tsc --noEmit                                  PASS
npm run build                                     PASS
npm run lint                                      FAIL (15 errors, 8 warnings)
node --test tests/rendered-html.test.mjs          FAIL (7/10)
npm run test:security                             FAIL (45/48)
npm run test:architecture                         FAIL (10/12)
npm run test:migrations                           PASS (17 migrations)
npm run env:check                                 PASS (29 variables)
npm audit --omit=dev --audit-level=high           FAIL (7 vulnerabilities)
git diff --check                                  FAIL (trailing whitespace)
next start + GET /                               200
next start + GET /login                          200
next start + GET /api/health/live                200
next start + GET /api/health/ready               503 (database down)
```

Các lệnh E2E/DB/backup không chạy do thiếu môi trường; trạng thái được ghi là **BLOCKED**, không phải PASS.
