Product Requirements Document

1. Tổng quan

TaskFlow là ứng dụng SaaS multi-tenant. Một tài khoản có thể tham gia nhiều workspace. Mỗi workspace có thành viên, project và chính sách riêng. Project chứa board; board chứa column; column chứa task.

2. Mục tiêu MVP

Người dùng có thể đăng ký, tạo workspace, mời người khác, tạo project và quản lý task từ lúc tạo đến khi hoàn thành mà dữ liệu giữa các workspace được cách ly an toàn.

3. Functional requirements

FR-01 — Authentication

Đăng ký, đăng nhập, đăng xuất.

Xác minh email.

Quên và đặt lại mật khẩu.

Quản lý phiên đăng nhập.

OAuth là tính năng V1, không chặn MVP.

FR-02 — Workspace

Tạo, đổi tên và cập nhật slug workspace.

Chuyển đổi workspace đang hoạt động.

Xem danh sách workspace người dùng được tham gia.

Owner có thể archive workspace.

Xóa vĩnh viễn cần thời gian chờ và xác nhận lại.

FR-03 — Membership và invitation

Mời qua email với vai trò được phép.

Invitation có hạn sử dụng và chỉ dùng một lần.

Chấp nhận hoặc từ chối invitation.

Thay đổi vai trò thành viên.

Suspend hoặc remove thành viên.

Không được xóa Owner cuối cùng.

FR-04 — Project

Tạo, sửa, archive và restore project.

Project có tên, mô tả, màu, trạng thái và project lead.

Project có thể private hoặc workspace-visible.

Guest chỉ thấy project được cấp quyền.

FR-05 — Board và column

Tạo board trong project.

Tạo, sửa và sắp xếp column.

Kéo thả column.

Không xóa column đang chứa task nếu chưa chọn nơi chuyển task.

Board mặc định gồm Backlog, In Progress, Review, Done.

FR-06 — Task

Tạo, sửa, archive và restore task.

Thuộc tính: title, description, status/column, priority, due date, assignee, labels.

Kéo thả task giữa các column.

Sắp xếp task trong một column.

Checklist và subtasks thuộc V1.

Mọi thay đổi quan trọng tạo activity event.

FR-07 — Comment

Thêm, sửa và xóa mềm comment của chính mình.

Admin được ẩn comment vi phạm.

Hỗ trợ mention thành viên trong workspace.

Mention tạo notification bất đồng bộ.

FR-08 — Activity log

Ghi nhận người thực hiện, hành động, tài nguyên, thời gian và metadata tối thiểu.

Log nghiệp vụ quan trọng không được sửa bởi người dùng.

Có timeline theo task và theo workspace.

FR-09 — Notification

In-app notification cho assignment, mention, invitation và thay đổi deadline quan trọng.

Đánh dấu một hoặc tất cả là đã đọc.

Email notification là V1 và chạy qua worker.

FR-10 — Search

MVP: tìm theo title task trong workspace.

V1: full-text search task, project và comment; filter theo assignee, label, trạng thái, hạn.

FR-11 — Attachment

V1: upload qua presigned URL.

Kiểm tra loại file, dung lượng và quota.

Metadata lưu trong database; bytes lưu object storage.

FR-12 — Billing

V2: Free và Pro.

Billing provider là source of truth cho thanh toán; database lưu trạng thái đồng bộ.

Webhook phải được xác minh chữ ký và xử lý idempotent.

4. Non-functional requirements

NFR-01: Không request nào được truy cập dữ liệu workspace khi chưa xác minh membership.

NFR-02: API đọc phổ biến có p95 mục tiêu dưới 500 ms trong môi trường production bình thường.

NFR-03: Mutation quan trọng hỗ trợ idempotency hoặc optimistic concurrency khi cần.

NFR-04: UI sử dụng được bằng bàn phím và có nhãn accessibility cơ bản.

NFR-05: Hỗ trợ responsive từ 360 px trở lên.

NFR-06: Tác vụ gửi email không làm chậm request chính.

NFR-07: Log không chứa password, token, cookie hoặc nội dung file nhạy cảm.

NFR-08: Backup và restore database phải được thử nghiệm định kỳ trước khi gọi production-ready.

5. Acceptance criteria cấp sản phẩm

Hai workspace có task trùng ID thử nghiệm vẫn không thể đọc chéo qua URL/API.

Member không thể tự nâng quyền thành Admin.

Invitation hết hạn hoặc đã dùng không thể dùng lại.

Hai người kéo cùng task không làm task biến mất hoặc tạo bản sao.

Event realtime bị bỏ lỡ không làm mất dữ liệu vì client có thể refetch.

Worker retry không gửi trùng email quan trọng.

Archive giữ dữ liệu và có thể restore theo quyền.

