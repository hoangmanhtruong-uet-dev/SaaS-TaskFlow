Business Rules

Workspace và tenant

BR-001: Một user có thể thuộc nhiều workspace.

BR-002: Mỗi workspace phải có ít nhất một Owner đang hoạt động.

BR-003: Slug là duy nhất toàn hệ thống nhưng không dùng slug để authorization.

BR-004: Workspace archived chỉ cho đọc theo quyền; mutation nghiệp vụ bị khóa.

BR-005: Dữ liệu của hai workspace không được liên kết trực tiếp, trừ user identity dùng chung.

Membership và invitation

BR-010: Cặp workspaceId + userId chỉ có một membership.

BR-011: Invitation token chỉ dùng một lần, có hạn và chỉ lưu dạng hash.

BR-012: Invitation chỉ được chấp nhận bởi email mục tiêu, trừ khi policy rõ ràng cho domain invite.

BR-013: Khi invitation được chấp nhận, việc tạo membership và đổi trạng thái invitation phải atomic.

BR-014: Không mời vượt seat/quota của plan.

BR-015: Remove membership thu hồi quyền ngay ở request kế tiếp.

Project và board

BR-020: Project luôn thuộc đúng một workspace.

BR-021: Board luôn thuộc đúng một project.

BR-022: Project private chỉ hiển thị cho workspace admin và project member.

BR-023: Archive project làm các board/task bên trong chỉ đọc theo mặc định.

BR-024: Không xóa column có task nếu chưa chuyển hoặc archive các task đó.

Task

BR-030: Task phải thuộc một column và column phải thuộc board của project.

BR-031: Assignee phải là membership active và có quyền trong project.

BR-032: dueAt lưu UTC; UI hiển thị theo timezone người dùng/workspace.

BR-033: Di chuyển task dùng optimistic concurrency với trường version.

BR-034: Thứ tự task dùng sortable position; hệ thống có job rebalance khi khoảng vị trí cạn.

BR-035: Archive là mặc định; hard delete không được dùng cho thao tác thường ngày.

BR-036: Title task không được rỗng sau trim và có giới hạn độ dài.

Comment và attachment

BR-040: Người dùng chỉ sửa comment của mình trong phạm vi chính sách.

BR-041: Xóa comment là soft delete; audit vẫn giữ metadata cần thiết.

BR-042: Mention chỉ hợp lệ với user có access đến task.

BR-043: Attachment phải qua allowlist MIME, size limit và quota.

BR-044: Tên file do người dùng cung cấp không được dùng trực tiếp làm storage key.

Notification và job

BR-050: Notification không được làm transaction nghiệp vụ chính thất bại.

BR-051: Job có deduplicationKey để retry không tạo tác dụng phụ trùng.

BR-052: Job thất bại sau số lần retry tối đa chuyển dead-letter state.

BR-053: Người thực hiện không nhận notification cho hành động của chính mình, trừ nhắc hạn theo lựa chọn.

Billing

BR-060: Backend tự tính quyền lợi từ plan; client không gửi isPro đáng tin cậy.

BR-061: Webhook billing phải xác minh chữ ký và idempotent theo event ID.

BR-062: Hết Pro không xóa dữ liệu; khóa tạo mới vượt quota và cho phép export/giảm sử dụng.

BR-063: Billing state không được cập nhật từ redirect URL phía client.

Audit

BR-070: Audit event chứa actor, action, target, workspace, timestamp và request ID.

BR-071: Không lưu secret, raw token hoặc toàn bộ dữ liệu nhạy cảm trong metadata.

BR-072: Audit nghiệp vụ quan trọng là append-only đối với người dùng ứng dụng.

