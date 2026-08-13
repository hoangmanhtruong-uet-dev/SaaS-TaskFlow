Role và Permission

1. Vai trò workspace

OWNER: toàn quyền, billing, chuyển ownership, archive/delete workspace.

ADMIN: quản lý thành viên và phần lớn cấu hình, không can thiệp ownership/billing nếu chưa được cấp.

MEMBER: cộng tác trong project được nhìn thấy.

GUEST: chỉ truy cập project được cấp rõ ràng.

2. Ma trận quyền

Hành động

Owner

Admin

Member

Guest

Xem workspace

Có

Có

Có

Giới hạn

Sửa cấu hình workspace

Có

Có

Không

Không

Quản lý billing

Có

Không

Không

Không

Mời Member/Guest

Có

Có

Không

Không

Gán vai trò Admin

Có

Không

Không

Không

Remove thành viên

Có

Có*

Không

Không

Tạo project

Có

Có

Có

Không

Archive project

Có

Có

Project Lead

Không

Xem project private

Có

Có

Nếu được cấp

Nếu được cấp

Tạo/sửa task

Có

Có

Nếu có project access

Nếu có quyền edit

Xóa mềm task

Có

Có

Người tạo/Project Lead

Không

Comment

Có

Có

Có quyền xem task

Có quyền comment

Xem workspace audit log

Có

Có

Không

Không

* Admin không được remove Owner hoặc Admin khác nếu chính sách không cho phép.

3. Quy tắc authorization

Authorization không chỉ dựa trên role. Mỗi quyết định gồm:

User đã authenticated chưa?

User có membership ACTIVE trong workspace không?

Role có permission cần thiết không?

Tài nguyên có thuộc workspace không?

Với project private/guest, user có project membership không?

Tài nguyên có archived/locked không?

Gói hiện tại có cho phép hành động không?

4. Permission constants gợi ý

workspace.read
workspace.update
workspace.archive
workspace.billing.manage
member.invite
member.role.update
member.remove
project.create
project.read
project.update
project.archive
task.create
task.update
task.assign
task.archive
comment.create
comment.moderate
audit.read

5. Nguyên tắc triển khai

Khai báo permission map tập trung, có test.

Route handler chỉ parse request và gọi service; service bắt buộc authorization.

Query nên luôn scope bằng workspace đã xác minh.

Không dựa vào việc UI ẩn nút để bảo vệ hành động.

Trả 404 thay vì tiết lộ tài nguyên tồn tại ở workspace khác khi phù hợp.

Cache permission phải có TTL ngắn và cơ chế invalidation khi role thay đổi.

6. Test tối thiểu

Mỗi mutation có test allowed và denied.

Owner cuối cùng không thể rời hoặc bị remove.

Guest không thể đoán ID để đọc project khác.

Member không thể thay role của mình.

Admin không thể quản lý billing.

Membership suspended bị từ chối dù session vẫn hợp lệ.

