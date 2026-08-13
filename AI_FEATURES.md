AI Features — Sau V1

AI không thuộc MVP. Chỉ thêm khi task, comment, activity và permission đã ổn định. AI phải tuân thủ cùng tenant isolation và audit như người dùng.

1. AI Task Copilot

Biến mô tả mục tiêu thành bản nháp task/subtask.

Gợi ý title, description, acceptance criteria và priority.

Tóm tắt comment dài và activity gần đây.

Gợi ý task có nguy cơ trễ dựa trên dữ liệu rõ ràng.

Mọi mutation do AI đề xuất phải ở trạng thái draft và cần người dùng xác nhận.

2. Project Knowledge Assistant

Tìm kiếm task, comment và tài liệu mà người hỏi có quyền xem.

Trả lời có liên kết tới nguồn nội bộ.

Không retrieve dữ liệu từ workspace/project khác.

Nếu nguồn không đủ, nói không đủ dữ liệu thay vì bịa.

Vector record phải mang workspaceId, projectId và access metadata. Filter quyền trước hoặc trong retrieval, không retrieve toàn bộ rồi mới che kết quả.

3. Meeting-to-task

Người dùng upload transcript.

AI đề xuất summary, decision và action items.

Người dùng chọn action item để tạo task.

Hệ thống hiển thị assignee/deadline được suy đoán và yêu cầu xác nhận.

4. Natural-language automation

Ví dụ: “Khi task ưu tiên cao quá hạn, báo Project Lead”. AI chỉ chuyển câu tự nhiên thành cấu hình rule có schema; rule engine thông thường mới là phần thực thi.

5. Kiến trúc AI

AI gateway ở server, không để API key trên client.

Prompt template có version.

Structured output được validate.

Tool calling dùng allowlist và kiểm tra authorization lại tại tool/service.

Tác vụ dài chạy worker.

Lưu model, prompt version, latency, token usage, kết quả và feedback ở mức không xâm phạm riêng tư.

Có budget/quota theo workspace.

6. Security

Nội dung task/file là dữ liệu không tin cậy và có thể chứa prompt injection.

Không cho model tự quyết định quyền truy cập.

Tool không nhận userId, role từ model; lấy từ execution context.

Hành động gửi email, xóa, đổi quyền hoặc tạo hàng loạt cần confirmation.

Redact secret/PII không cần thiết trước khi gửi model.

Audit mọi AI tool call có tác dụng phụ.

7. Evaluation

Chuẩn bị dataset tối thiểu cho từng tính năng:

30–50 case task generation với rubric.

50 câu hỏi knowledge assistant có nguồn mong đợi.

Case không có đáp án để đo hallucination.

Cross-tenant/adversarial prompt injection tests.

Test structured output, timeout và provider failure.

Theo dõi correctness, citation accuracy, action approval rate, latency, cost và user feedback. Mỗi thay đổi prompt/model phải chạy lại eval trước khi release.

8. Thứ tự triển khai

AI tóm tắt task/activity chỉ đọc.

AI tạo bản nháp task.

Knowledge assistant có retrieval và citation.

Meeting-to-task.

Automation có tool calling và approval.

Không bắt đầu bằng agent tự trị nhiều bước. Bắt đầu với tác vụ hẹp, đo được và dễ kiểm soát.

