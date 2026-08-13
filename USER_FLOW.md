User Flow

1. Onboarding

Người dùng mở landing page.

Chọn đăng ký.

Nhập tên, email, mật khẩu hoặc dùng OAuth ở V1.

Hệ thống tạo tài khoản chưa xác minh.

Người dùng xác minh email.

Hệ thống hỏi tạo workspace mới hoặc chấp nhận invitation đang chờ.

Người dùng tạo workspace, nhập tên và slug.

Hệ thống tạo membership OWNER và board mẫu.

Người dùng được đưa vào màn hình dashboard.

Trường hợp lỗi

Email đã tồn tại: hướng dẫn đăng nhập hoặc reset password.

Link xác minh hết hạn: cho phép gửi lại có rate limit.

Slug trùng: gợi ý slug khác; uniqueness không thay thế kiểm tra authorization.

2. Mời thành viên

Admin mở Workspace Settings > Members.

Nhập email và vai trò.

Backend kiểm tra quyền, seat limit và invitation hiện có.

Tạo invitation token một lần; chỉ lưu hash token.

Worker gửi email.

Người nhận mở link và đăng nhập/đăng ký.

Backend kiểm tra token, email, thời hạn và trạng thái.

Trong transaction: tạo membership, đánh dấu invitation accepted.

Ghi activity log và phát event.

3. Tạo project và board

Thành viên có quyền chọn New Project.

Nhập tên, mô tả, visibility và project lead.

Backend kiểm tra workspace membership.

Tạo project, board mặc định và các column trong một transaction.

Trả project về client.

Gửi event project.created sau khi commit.

4. Tạo và giao task

Người dùng mở project board.

Chọn column và tạo task nhanh.

Client gửi title, column ID và idempotency key.

Backend xác minh column thuộc project và workspace hiện tại.

Tạo task với position phù hợp.

Nếu có assignee, kiểm tra assignee là thành viên được phép.

Tạo activity và notification job.

Trả kết quả; realtime cập nhật các client khác.

5. Kéo thả task

Client hiển thị optimistic update.

Gửi task ID, destination column ID, vị trí mới và expectedVersion.

Backend kiểm tra quyền và quan hệ cùng board.

Nếu version không khớp, trả 409 CONFLICT cùng trạng thái mới nhất.

Nếu hợp lệ, cập nhật column, position, version trong transaction.

Client xác nhận hoặc rollback optimistic state.

Event realtime chứa entity ID và version mới.

6. Comment và mention

Member nhập comment chứa @user.

Backend sanitize nội dung và xác minh user được mention thuộc workspace.

Tạo comment và activity.

Đưa notification vào outbox.

Worker tạo in-app/email notification.

Realtime cập nhật thread.

7. Rời hoặc xóa thành viên

Member có thể tự rời nếu không phải Owner cuối cùng.

Admin có thể remove Member/Guest nhưng không remove Owner cao hơn quyền mình.

Khi remove, membership bị thu hồi ngay; task cũ vẫn giữ lịch sử và có thể để assignee null.

Phiên đang mở nhận event thu hồi và bị từ chối ở request kế tiếp.

8. Archive và delete

Người dùng chọn archive tài nguyên.

UI yêu cầu xác nhận nếu ảnh hưởng nhiều task.

Backend kiểm tra quyền và đặt archivedAt.

Tài nguyên biến mất khỏi danh sách mặc định nhưng lịch sử còn nguyên.

Permanent deletion chỉ dùng cho workspace theo quy trình riêng, có thời gian chờ và audit.

