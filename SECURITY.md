Security Requirements

The operational threat model, data flows, trust boundaries, control owners, detection signals, and recovery procedures are maintained in [`ui-prototype/docs/security/threat-model.md`](ui-prototype/docs/security/threat-model.md). Mobile release gates are maintained in [`ui-prototype/docs/security/mobile-baseline.md`](ui-prototype/docs/security/mobile-baseline.md).

1. Threat model chính

Đọc hoặc sửa dữ liệu của workspace khác bằng ID đoán được.

Tự nâng quyền qua body/API ẩn.

Chiếm session hoặc reset password.

Invitation token bị lộ/dùng lại.

Upload file độc hại.

XSS qua title, description, comment hoặc filename.

CSRF với cookie-based authentication.

Abuse API, spam invitation/comment và tốn chi phí email/AI.

Secret hoặc PII xuất hiện trong log.

Webhook giả mạo hoặc replay.

2. Authentication

Password hash bằng thuật toán phù hợp và cấu hình mạnh.

Session token ngẫu nhiên đủ dài; lưu hash nếu lưu database.

Cookie HttpOnly, Secure, SameSite phù hợp.

Rotate/revoke session khi đổi mật khẩu hoặc có sự cố.

Reset/verify token một lần, có hạn, lưu hash.

Rate limit login, register, forgot password và verify resend.

Không tiết lộ email tồn tại qua thông báo khác biệt không cần thiết.

3. Authorization và tenant isolation

workspaceId từ route chỉ là input; server phải xác minh membership.

Tất cả repository của tenant-owned entity cần workspace scope.

Kiểm tra parent-child relationship, không chỉ từng ID tồn tại.

Có test chéo tenant cho mỗi module.

Admin action tạo audit event.

4. Input/output

Validate độ dài, enum, format và unknown fields.

Render rich text bằng parser/sanitizer allowlist.

Không ghép SQL thủ công từ input.

DTO chỉ trả trường cần thiết.

Error production không trả stack trace hoặc query.

5. CSRF, CORS và headers

Cookie auth mutation phải có CSRF defense phù hợp.

CORS allowlist, không dùng wildcard cùng credential.

CSP hạn chế script/style/connect source.

Thiết lập HSTS, content type protection, frame restrictions và referrer policy.

6. File upload

Presigned upload có hạn ngắn và scope theo user/workspace.

Storage key do server tạo.

Allowlist MIME/extension; không tin Content-Type duy nhất.

Giới hạn kích thước ở nhiều lớp.

File private; download qua authorization hoặc signed URL ngắn hạn.

Quét malware khi sản phẩm yêu cầu.

Cleanup upload không được finalize.

7. Rate limit

Endpoint

Key gợi ý

Login/reset

IP + normalized email

Invitation

user + workspace

Comment

user + workspace

Search

user + workspace

File upload

user + workspace quota

Realtime connect

user + IP

Rate limit quan trọng không chỉ dựa trên state trong một process.

8. Secret và log

Secret chỉ ở secret manager/environment, không commit.

Tách key dev/staging/prod.

Log structured với allowlist trường.

Redact authorization header, cookie, token và password.

Có rotation plan cho credential.

9. Security acceptance tests

IDOR chéo workspace bị chặn.

Guest không thể gọi endpoint admin.

Token reset/invite dùng lại thất bại.

CSRF request bị chặn.

XSS payload được encode/sanitize.

File quá dung lượng/MIME cấm bị từ chối.

Billing webhook sai chữ ký bị từ chối và không thay state.

