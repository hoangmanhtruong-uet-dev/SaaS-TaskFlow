System Architecture

1. Kiểu kiến trúc

Khởi đầu bằng modular monolith: một web/API application và một worker process dùng chung domain package. Cách này đủ rõ để học boundary nhưng không tạo chi phí vận hành microservice quá sớm.

2. Thành phần

Browser
  -> Next.js Web/API
      -> PostgreSQL (source of truth)
      -> Redis (cache, rate limit, queue/realtime coordination)
      -> Object Storage (attachments)
      -> Outbox table
  -> Realtime Gateway

Worker
  -> Queue/Outbox
  -> Email provider
  -> Object storage processing
  -> Notification and scheduled jobs

3. Module boundary

src/modules/
  auth/
  users/
  workspaces/
  memberships/
  invitations/
  projects/
  boards/
  tasks/
  comments/
  notifications/
  billing/
  audit/
  files/

Mỗi module nên có domain, application/service, repository và public interface ở mức vừa đủ. Tránh tạo abstraction chỉ để tăng số file.

4. Request flow

Route nhận request và tạo/đọc request ID.

Authentication xác minh session.

Validation parse input bằng schema.

Service load workspace context và authorize.

Repository/query thực thi có tenant scope.

Transaction cập nhật nghiệp vụ và outbox.

API trả DTO, không trả trực tiếp database model.

Worker phát notification/realtime sau commit.

5. Multi-tenancy

MVP dùng shared database, shared schema với workspaceId. Đây là mô hình dễ vận hành nhưng đòi hỏi tenant isolation nghiêm ngặt.

Bảng tenant-owned có workspaceId trực tiếp nếu hợp lý.

Composite unique/index bắt đầu bằng workspaceId cho truy vấn phổ biến.

Repository nhận WorkspaceContext đã xác minh.

Không có hàm findTaskById(id) cho request người dùng; dùng findTask({workspaceId, id}).

Có integration test cố ý dùng ID từ tenant B trong session tenant A.

6. Transaction và outbox

Mutation quan trọng ghi dữ liệu nghiệp vụ và OutboxEvent trong cùng transaction. Worker đọc outbox, thực hiện tác dụng phụ và đánh dấu processed. Điều này tránh trường hợp database đã commit nhưng email/event chưa được tạo.

7. Cache

Chỉ cache dữ liệu đọc nhiều và không quá nhạy với độ trễ:

Workspace summary.

Permission map đã biên dịch với TTL ngắn.

Feature/plan limits.

Cache key phải chứa workspace/user khi kết quả phụ thuộc tenant hoặc quyền. PostgreSQL vẫn là source of truth.

8. Realtime

Channel phải được authorize khi subscribe. Payload ưu tiên eventType, entity ID, workspace ID nội bộ, version và timestamp; không gửi toàn bộ dữ liệu nhạy cảm. Client nhận event rồi patch có kiểm soát hoặc refetch.

9. Deployment

Web/API và worker triển khai độc lập.

Migration chạy như một bước release duy nhất, không chạy đồng thời ở mọi instance.

Readiness check khác liveness check.

Có staging database riêng, không dùng production secrets.

Rollback code phải xem xét compatibility với migration vừa chạy.

