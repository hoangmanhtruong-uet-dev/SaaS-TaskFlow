Hướng dẫn giao việc cho coding agent

1. Quy tắc làm việc

Agent phải đọc các file liên quan trước khi sửa code. Không triển khai toàn bộ roadmap trong một lần. Mỗi task phải nhỏ, có acceptance criteria và test.

2. Prompt khởi động gợi ý

Đọc toàn bộ thư mục docs theo thứ tự trong 00-README.md. Chưa viết code.
Hãy khảo sát repository hiện tại, so sánh với tài liệu, rồi tạo kế hoạch Phase 0.
Nêu rõ giả định, file dự kiến thay đổi, migration, test và rủi ro.
Không mở rộng ngoài Phase 0 nếu chưa được yêu cầu.

3. Prompt triển khai một feature

Triển khai [FEATURE] theo các yêu cầu trong docs.

Trước khi sửa:
1. Tìm code và convention hiện có.
2. Liệt kê acceptance criteria áp dụng.
3. Xác định authorization, tenant scope, transaction và idempotency.

Khi sửa:
- Giữ thay đổi nhỏ và đúng module.
- Không tin userId/workspaceId/role từ client.
- Thêm migration nếu schema đổi.
- Thêm test allowed, denied, invalid và cross-tenant khi phù hợp.

Sau khi sửa:
- Chạy lint, typecheck, test liên quan và build nếu khả thi.
- Báo file đã đổi, quyết định chính, test đã chạy và phần còn lại.

4. Checklist review cho agent

Domain

Nghiệp vụ có khớp 05-BUSINESS_RULES.md?

Có trường hợp archive, suspended, expired hoặc conflict?

Timezone và timestamp có rõ?

Security

User/session lấy từ nguồn tin cậy?

Membership được kiểm tra?

Query có workspace scope?

Parent và child có cùng tenant/project?

Output có lộ trường nội bộ?

Data

Cần transaction?

Cần unique constraint hơn là chỉ application check?

Retry có tạo duplicate?

Migration có chạy trên database có dữ liệu?

UX

Loading, empty, error, permission denied?

Optimistic update có rollback?

Conflict 409 được xử lý?

Keyboard/accessibility cơ bản?

Verification

Unit/integration/E2E nào cần có?

Cross-tenant test đã có?

CI/build pass?

5. Chống agent làm quá tay

Không thêm Redis trước feature thực sự cần cache/queue/rate limit.

Không tách microservice.

Không tạo generic repository che mất tenant scope.

Không thêm billing/AI trong MVP.

Không đổi stack hoặc auth strategy khi chưa lập ADR.

Không sửa unrelated code chỉ để “dọn dẹp”.

Không bỏ test vì môi trường local khó; đưa test vào CI hoặc sửa môi trường.

6. ADR

Quyết định lớn phải có file docs/adr/NNNN-title.md gồm:

Context.

Decision.

Alternatives considered.

Consequences.

Migration/rollback.

Ví dụ cần ADR: auth provider, realtime provider, queue, object storage, rich-text format, billing provider.

7. Cách chia commit

Một commit schema/migration nếu có.

Một commit domain/service/API.

Một commit UI và test E2E khi cần.

Commit message mô tả kết quả, không dùng tên chung như update.

