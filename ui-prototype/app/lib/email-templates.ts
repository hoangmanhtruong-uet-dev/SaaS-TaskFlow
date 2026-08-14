type EmailTemplate = { subject: string; html: string };

const roleLabels = { ADMIN: "Admin", MEMBER: "Member", GUEST: "Guest" } as const;

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function action(url: string, label: string) {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">${escapeHtml(label)}</a>`;
}

function shell(preview: string, title: string, body: string) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f4f7fb;color:#172033;font-family:Arial,sans-serif"><span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #e5eaf2;border-radius:14px"><tr><td style="padding:28px"><div style="font-size:20px;font-weight:800;color:#2563eb;margin-bottom:24px">TaskFlow</div><h1 style="font-size:24px;line-height:1.3;margin:0 0 16px">${escapeHtml(title)}</h1>${body}<p style="font-size:12px;line-height:1.6;color:#667085;margin:28px 0 0">Email giao dịch tự động từ TaskFlow. Nếu bạn không thực hiện yêu cầu này, hãy liên hệ quản trị workspace.</p></td></tr></table></td></tr></table></body></html>`;
}

export function verificationEmail(input: { name: string; verificationUrl: string }): EmailTemplate {
  const title = "Xác minh email TaskFlow";
  return { subject: title, html: shell(title, title, `<p>Xin chào ${escapeHtml(input.name)},</p><p style="line-height:1.6">Xác minh địa chỉ email để hoàn tất tài khoản của bạn.</p><p style="margin:24px 0">${action(input.verificationUrl, "Xác minh email")}</p>`) };
}

export function passwordResetEmail(input: { name: string; resetUrl: string }): EmailTemplate {
  const title = "Đặt lại mật khẩu TaskFlow";
  return { subject: title, html: shell(title, title, `<p>Xin chào ${escapeHtml(input.name)},</p><p style="line-height:1.6">Bạn vừa yêu cầu đặt lại mật khẩu. Liên kết chỉ sử dụng được một lần.</p><p style="margin:24px 0">${action(input.resetUrl, "Đặt lại mật khẩu")}</p>`) };
}

export function invitationEmail(input: { inviterName: string; workspaceName: string; role: keyof typeof roleLabels; inviteUrl: string; expiresAt: Date }): EmailTemplate {
  const title = `Lời mời tham gia ${input.workspaceName}`;
  const expiry = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(input.expiresAt);
  return { subject: title, html: shell(title, title, `<p><strong>${escapeHtml(input.inviterName)}</strong> đã mời bạn tham gia workspace <strong>${escapeHtml(input.workspaceName)}</strong> với vai trò <strong>${roleLabels[input.role]}</strong>.</p><p style="margin:24px 0">${action(input.inviteUrl, "Xem lời mời")}</p><p style="line-height:1.6;color:#475467">Lời mời hết hạn lúc ${escapeHtml(expiry)} và chỉ dành cho đúng địa chỉ email nhận thư.</p>`) };
}

export function membershipSuspendedEmail(input: { name: string; workspaceName: string }): EmailTemplate {
  const title = `Quyền truy cập ${input.workspaceName} đã bị tạm ngưng`;
  return { subject: title, html: shell(title, title, `<p>Xin chào ${escapeHtml(input.name)},</p><p style="line-height:1.6">Quyền truy cập của bạn vào workspace <strong>${escapeHtml(input.workspaceName)}</strong> đã bị tạm ngưng. Các phiên đăng nhập liên quan không còn được phép truy cập dữ liệu workspace.</p>`) };
}

export function workspaceDeletionScheduledEmail(input: { workspaceName: string; scheduledFor: Date; settingsUrl: string }): EmailTemplate {
  const title = `Đã lên lịch xóa ${input.workspaceName}`;
  const deletionDate = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(input.scheduledFor);
  return { subject: title, html: shell(title, title, `<p>Workspace <strong>${escapeHtml(input.workspaceName)}</strong> được lên lịch xóa vĩnh viễn lúc <strong>${escapeHtml(deletionDate)}</strong>.</p><p style="line-height:1.6">Owner có thể hủy yêu cầu trong thời gian chờ 30 ngày.</p><p style="margin:24px 0">${action(input.settingsUrl, "Mở cài đặt workspace")}</p>`) };
}
