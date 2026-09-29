# UI MASTER SPECIFICATION — SaaS QUẢN LÝ CÔNG VIỆC TASKFLOW

> Phiên bản mở rộng từ blueprint 36 màn hình ban đầu.
> Mục tiêu: làm tài liệu nguồn duy nhất để thiết kế UI/UX và triển khai frontend cho một SaaS quản lý công việc hoàn chỉnh.
>
> **Phạm vi:** Public/Marketing, Authentication, Onboarding, Workspace/App Shell, Dashboard, Tasks, Projects, Calendar, Collaboration, Search, Notifications, Analytics, Admin, Settings, Billing, Integrations, Support, Static pages, System errors, Global states, Responsive UI và Design System.

---

# 0. NGUYÊN TẮC THIẾT KẾ TOÀN HỆ THỐNG

## 0.1. Mục tiêu sản phẩm

TaskFlow là SaaS quản lý công việc theo workspace/team. Người dùng có thể:

- Tạo và quản lý workspace.
- Mời thành viên và phân quyền.
- Tạo project.
- Quản lý task theo Kanban/List/Timeline/Calendar.
- Gán người thực hiện, priority, due date, tag.
- Checklist/sub-task.
- Comment, mention, reaction.
- Upload file.
- Nhận notification.
- Tìm kiếm toàn cục.
- Theo dõi activity/audit log.
- Xem analytics/report.
- Quản lý profile, security, workspace, permissions.
- Kết nối integrations.
- Quản lý subscription và billing.

## 0.2. Quy tắc UI bắt buộc

Mọi page quan trọng phải có các trạng thái:

1. Initial/loading.
2. Loaded/normal.
3. Empty.
4. Error.
5. Network error.
6. Permission denied.
7. Saving/updating.
8. Saved/success.
9. Unsaved changes.
10. Deleted/archived khi liên quan.
11. Responsive mobile/tablet/desktop.
12. Dark mode nếu app hỗ trợ dark theme.

Không thiết kế chỉ trạng thái "đẹp nhất" khi API luôn thành công.

## 0.3. Nguyên tắc layout

- Desktop-first nhưng không bỏ mobile.
- App pages dùng App Shell thống nhất.
- Public pages dùng Marketing Shell.
- Auth pages dùng Auth Shell.
- Modal dùng focus trap, Esc để đóng khi phù hợp.
- Drawer có back/close trên mobile.
- Form báo lỗi ngay tại field và có summary nếu form dài.
- Toast không thay thế inline error đối với lỗi cần người dùng sửa.
- Confirmation dialog bắt buộc cho destructive actions.

---

# 1. KIẾN TRÚC ROUTE TỔNG THỂ

```text
PUBLIC
├── /
├── /pricing
├── /solutions
├── /resources
├── /support
├── /terms
├── /privacy
└── /security

AUTH
├── /login
├── /register
├── /verify-email
├── /forgot-password
├── /reset-password
├── /auth/mfa
└── /account-locked

ONBOARDING / INVITE
├── /onboarding
├── /onboarding/welcome
└── /invite?token=...

APP
├── /app
├── /app/tasks
├── /app/tasks/new
├── /app/tasks/[id]
├── /app/projects
├── /app/projects/new
├── /app/projects/[id]/board
├── /app/projects/[id]/list
├── /app/projects/[id]/timeline
├── /app/projects/[id]/files
├── /app/projects/[id]/settings
├── /app/calendar
├── /app/search
├── /app/notifications
├── /app/activity
├── /app/archived
├── /app/members
├── /app/members/invitations
├── /app/members/[id]
└── /app/analytics

SETTINGS
├── /app/settings/profile
├── /app/settings/security
├── /app/settings/notifications
├── /app/settings/workspace
├── /app/settings/permissions
├── /app/settings/integrations
└── /app/settings/billing

INTEGRATION DETAIL
└── /app/settings/integrations/[provider]

BILLING
├── /checkout
├── /checkout/success
├── /checkout/failure
└── /subscription/cancel

SUPPORT
├── /support
├── /support/article/[id]
└── /support/contact

SYSTEM
├── /403
├── 404 catch-all
├── global-error / 500
└── /maintenance
```

---

# 2. PUBLIC / MARKETING PAGES

## 2.1. Landing Page — `/`

### Mục đích

Giới thiệu TaskFlow, giải thích value proposition và đưa người dùng đến đăng ký/dùng thử.

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo │ Features │ Pricing │ Solutions │ Resources │ Support │
│                                      Login │ Start Free      │
├──────────────────────────────────────────────────────────────┤
│ HERO                                                        │
│ H1 + subtitle                                               │
│ [Start Free] [Watch Demo]                                  │
│                       Product Mockup / Interactive Preview  │
├──────────────────────────────────────────────────────────────┤
│ Trusted by / customer logos                                 │
├──────────────────────────────────────────────────────────────┤
│ Core Features Grid                                         │
├──────────────────────────────────────────────────────────────┤
│ Workflow / Product Preview                                 │
├──────────────────────────────────────────────────────────────┤
│ Use Cases                                                  │
├──────────────────────────────────────────────────────────────┤
│ Testimonials / Case Studies                                │
├──────────────────────────────────────────────────────────────┤
│ Pricing Preview                                            │
├──────────────────────────────────────────────────────────────┤
│ FAQ                                                        │
├──────────────────────────────────────────────────────────────┤
│ Final CTA                                                  │
├──────────────────────────────────────────────────────────────┤
│ Footer                                                     │
└──────────────────────────────────────────────────────────────┘
```

### Header

- Logo + wordmark.
- Navigation: Features, Pricing, Solutions, Resources, Support.
- Login button.
- Primary CTA: Dùng thử miễn phí.
- Sticky khi scroll.
- Mobile: hamburger menu + full-screen navigation drawer.

### Hero

- H1 lớn.
- Subtitle ngắn.
- Primary CTA.
- Secondary CTA.
- Product screenshot/live preview.
- Social proof ngay dưới CTA.

### Feature grid

- Kanban.
- Calendar.
- Analytics.
- Permissions.
- Automation.
- Integrations.

### States

- Video unavailable.
- Interactive preview loading.
- Mobile navigation open.
- Reduced-motion mode.

---

## 2.2. Pricing — `/pricing`

### Layout

```text
Pricing

[Monthly] [Yearly — Save %]

┌────────┐ ┌────────────┐ ┌─────────────┐
│ FREE   │ │ PRO        │ │ ENTERPRISE  │
│        │ │ Popular    │ │             │
│ Price  │ │ Price      │ │ Contact     │
│ CTA    │ │ CTA        │ │ CTA         │
└────────┘ └────────────┘ └─────────────┘

Feature comparison table

FAQ

Enterprise CTA
```

### Nội dung plan

| Hạng mục | Free | Pro | Enterprise |
|---|---|---|---|
| Thành viên | 5 | Không giới hạn | Không giới hạn |
| Dự án | 3 | Không giới hạn | Không giới hạn |
| Dung lượng | 1 GB | 50 GB | Tuỳ chỉnh |
| Tích hợp | — | Slack, GitHub | API riêng |
| SSO/MFA | — | MFA | SSO/SAML |
| Hỗ trợ | Email | Priority | Dedicated CSM |
| Giá | Miễn phí | $12/user/tháng | Liên hệ |

### States

- Loading prices.
- Currency unavailable.
- Checkout unavailable.
- Current plan highlighted khi người dùng đã login.

---

## 2.3. Solutions — `/solutions`

### Layout

- Hero.
- Industry/use-case cards.
- Workflow illustrations.
- KPI/benefit section.
- CTA "Dùng mẫu này".

### Use cases

- Software/Scrum.
- Marketing.
- HR.
- Education.
- General team operations.

---

## 2.4. Resources — `/resources`

### Layout

- Search.
- Featured article.
- Tabs/categories: Blog, Guide, Webinar, Template.
- Card grid.
- Pagination/load more.

### States

- No results.
- Loading cards.
- Broken thumbnail.

---

## 2.5. Support Center — `/support`

### Layout

```text
How can we help?
[ Search help center... ]

Getting Started | Tasks | Projects | Billing | Security | Account

Popular articles
FAQ

[Contact Support]
```

---

## 2.6. Terms — `/terms`

- Header.
- Sidebar table of contents.
- Legal document content.
- Anchor links.
- Last updated date.
- Download PDF.

## 2.7. Privacy — `/privacy`

- Table of contents.
- Data collected.
- Purpose of processing.
- Retention.
- User rights.
- Contact.

## 2.8. Security — `/security`

- Encryption.
- Authentication/security controls.
- Compliance/certification area.
- Penetration testing information.
- Bug bounty.
- Security whitepaper CTA.

---

# 3. AUTHENTICATION

## 3.1. Login — `/login`

### Layout

```text
┌────────────────────────┬──────────────────────────┐
│ Product visual/banner  │ Logo                     │
│ Feature highlights     │ Welcome back             │
│                        │ Email                    │
│                        │ Password                 │
│                        │ [Login]                  │
│                        │                            │
│                        │ [Google] [Microsoft]     │
│                        │                            │
│                        │ Remember me              │
│                        │ Forgot password?          │
│                        │ Create account            │
└────────────────────────┴──────────────────────────┘
```

### Fields

- Email.
- Password.
- Show/hide password.
- Remember me.

### SSO

- Google Workspace.
- Microsoft 365.
- GitHub.

### Error UI

- Required field.
- Invalid email.
- Wrong password.
- Account locked.
- Account disabled.
- Email not verified.
- MFA required.
- Network error.
- Server error.
- Rate limited.

### Success flow

`Login → MFA (nếu bật) → /app`.

---

## 3.2. Register — `/register`

### Fields

- Full name.
- Work email.
- Password.
- Confirm password.
- Password strength meter.
- Terms checkbox.
- Privacy checkbox.

### Social signup

- Google.
- Microsoft.

### Validation

- Email invalid.
- Email already exists.
- Password weak.
- Password mismatch.
- Terms not accepted.
- Server error.

---

## 3.3. Email Verification — `/verify-email`

### Layout

```text
             ✓

       Check your inbox

We sent a verification link to
user@example.com

[Resend email]

Available again in 48s

[Change email]
```

### States

- Pending verification.
- Verified successfully.
- Token expired.
- Token invalid.
- Already verified.
- Resend cooldown.
- Resend failed.

---

## 3.4. Forgot Password — `/forgot-password`

- Email input.
- Send reset link.
- Success state.
- Resend cooldown.
- Back to login.

### Security UI

Không nên hiển thị quá nhiều thông tin khiến người khác đoán được email có tồn tại hay không.

---

## 3.5. Reset Password — `/reset-password?token=...`

### Fields

- New password.
- Confirm password.
- Strength meter.

### Token states

- Valid.
- Expired.
- Invalid.
- Already used.

### Success

→ Login + success toast.

---

## 3.6. MFA Verification — `/auth/mfa`

### Layout

```text
Verify your identity

[ _ ][ _ ][ _ ][ _ ][ _ ][ _ ]

Code from Authenticator

[Verify]

Use backup code
Remember this device
```

### States

- Wrong code.
- Expired code.
- Too many attempts.
- Backup code accepted.
- Session expired.

---

## 3.7. Account Locked — `/account-locked`

```text
🔒

Account temporarily locked

Too many failed login attempts.

[Back to login]
[Contact support]
```

---

# 4. ONBOARDING / INVITATION

## 4.1. Welcome — `/onboarding/welcome`

- Welcome message.
- Short explanation.
- Checklist onboarding.
- [Get started].
- Skip option.

## 4.2. Create Workspace — `/onboarding`

### Wizard

```text
Step 1: Workspace
Step 2: Invite
Step 3: Template
```

### Step 1

- Workspace name.
- Subdomain.
- Team size.
- Industry/use case.
- Logo.

### Step 2

- Multiple email input.
- Role selector.
- Remove pending invite.
- Skip.

### Step 3

- Software Sprint.
- Marketing Campaign.
- HR Hiring.
- General Tasks.

### States

- Subdomain available.
- Subdomain taken.
- Invite failed.
- Template loading.
- Save progress.
- Skip onboarding.

---

## 4.3. Workspace Invitation — `/invite?token=...`

### Valid invite

```text
[Workspace Logo]

John invited you to join
ACME Workspace

[Accept & Create account]
[Login to accept]
```

### Other states

- Expired invite.
- Invalid token.
- Already member.
- Invitation revoked.
- Workspace unavailable.
- User already belongs to workspace.

---

# 5. GLOBAL APP SHELL

Áp dụng cho hầu hết `/app/*`.

## 5.1. Desktop Layout

```text
┌──────────────┬────────────────────────────────────────────┐
│              │ Top Bar                                    │
│ Sidebar      ├────────────────────────────────────────────┤
│              │                                            │
│              │ Main Content                               │
│              │                                            │
│              │                                            │
└──────────────┴────────────────────────────────────────────┘
```

## 5.2. Sidebar

- Logo.
- Workspace switcher.
- Dashboard.
- My Tasks.
- Projects.
- Calendar.
- Members.
- Analytics.
- Reports nếu bật module.
- Archived.
- Activity.
- Settings.
- Quick create.
- User profile.

### Sidebar states

- Expanded.
- Collapsed.
- Mobile drawer.
- Hover tooltip khi collapsed.

## 5.3. Top Bar

- Breadcrumb.
- Global Search.
- Command shortcut hint `Ctrl + K / Cmd + K`.
- Notification bell.
- Quick filter nếu page hỗ trợ.
- User avatar/menu.

## 5.4. Workspace Switcher

```text
Workspaces

● ACME
○ Startup
○ Personal

[+ Create workspace]
[Manage workspaces]
```

---

# 6. DASHBOARD

## 6.1. Workspace Dashboard — `/app`

### Layout

```text
Dashboard

[Total Tasks] [In Progress] [Overdue] [Completed]

Search     Project ▼   Priority ▼   Members   Date

TODO         IN PROGRESS       REVIEW        DONE
┌───────┐    ┌───────┐        ┌───────┐     ┌───────┐
│ Task  │    │ Task  │        │ Task  │     │ Task  │
│ Task  │    │ Task  │        │       │     │       │
└───────┘    └───────┘        └───────┘     └───────┘
```

### KPI

- Total tasks.
- In progress.
- Overdue.
- Completed this week.
- Trend percentage.
- Comparison period.

### Task card

- Title.
- Summary.
- Priority.
- Tags.
- Due date.
- Assignee avatar.
- Checklist progress.
- Comment count.
- Attachment count.
.

### States

- Empty workspace.
- No tasks.
- Loading.
- Partial data.
- API error.
- Permission-limited dashboard.

---

# 7. MY TASKS

## 7.1. My Tasks — `/app/tasks`

### Tabs

- Today.
- Upcoming.
- Overdue.
- Completed.

### Toolbar

- Search.
- Filter.
- Sort.
- Group.
- View switcher.
- Bulk select.

### Table

| Checkbox | Task | Project | Status | Priority | Due date | Assignee |
|---|---|---|---|---|---|---|
| □ | Fix login | Core | Doing | High | Sep 25 | Me |

### Bulk actions

- Complete.
- Change status.
- Priority.
- Due date.
- Assign.
- Add tag.
- Archive.

---

# 8. TASK MANAGEMENT

## 8.1. Quick Create Task — Modal

### Trigger

- `C`.
- `+ Create`.
- `+ Task` trên board.

### Fields

- Title.
- Project.
- Status.
- Assignee.
- Priority.
- Due date.

### States

- Creating.
- Validation error.
- Duplicate/conflict nếu backend yêu cầu.
- Network failure.
- Success toast.

---

## 8.2. Full Create Task — `/app/tasks/new`

### Sections

**Basic**
- Title.
- Description.
- Project.
- Status.

**Scheduling**
- Start date.
- Due date.
- Recurring schedule.

**Ownership**
- Assignee.
- Followers.

**Classification**
- Priority.
- Tags.
- Custom fields.

**Advanced**
- Parent task.
- Dependencies.
- Estimate.
- Attachments.
- Checklist.

### Bottom action bar

- Cancel.
- Save draft.
- Create task.

---

## 8.3. Task Detail — `/app/tasks/[id]`

### Desktop

```text
┌──────────────────────────────────────────────────────────┐
│ Task title                                      ⋮   X    │
├────────────────────────────────────┬─────────────────────┤
│ Description                        │ Status              │
│                                    │ Assignee            │
│ Checklist                          │ Start date          │
│ █████████░ 80%                     │ Due date            │
│                                    │ Priority            │
│ Attachments                        │ Tags                │
│                                    │                     │
│ Comments                           │ Activity            │
│ [Write a comment...]               │                     │
└────────────────────────────────────┴─────────────────────┘
```

### Nội dung trái

- Editable title.
- Rich-text description.
- Checklist/subtasks.
- Progress percentage.
- Attachments.
- Comment stream.
- `@mention`.
- Emoji/reactions.

### Properties phải

- Status.
- Assignee.
- Start date.
- Due date.
- Priority.
- Tags.
- Followers.
- Custom fields.
- Dependencies.
- Activity history.

### Task actions

- Edit.
- Duplicate.
- Move.
- Archive.
- Delete.
- Copy link.
- Subscribe/unsubscribe.

### States

- Saving.
- Saved.
- Unsaved changes.
- Loading attachments.
- Attachment upload failed.
- Comment failed.
- Task deleted.
- Task archived.
- No permission.
- Network disconnected.
- Concurrent edit/conflict.

---

# 9. PROJECTS

## 9.1. Project List — `/app/projects`

### Toolbar

- Search.
- New Project.
- Grid/List toggle.
- Filter.
- Sort.
- Archived toggle.

### Grid card

- Project icon/color.
- Name.
- Status.
- Progress bar.
- Task count.
- Member avatars.
- Due date.
- More menu.

### Table view

| Project | Status | Progress | Tasks | Members | Due | Updated |
|---|---|---:|---:|---|---|---|

### States

- No projects.
- Search empty.
- Loading.
- Permission-limited.

---

## 9.2. Create Project — `/app/projects/new`

### Fields

- Name.
- Description.
- Icon.
- Color.
- Template.
- Team/members.
- Visibility.
- Start date.
- Due date.
- Default workflow.

### Destructive

- Cancel.
- Discard draft confirmation.

---

## 9.3. Project Board — `/app/projects/[id]/board`

### Header

- Project name.
- Description.
- Favorite.
- Share.
- View switcher: Board/List/Timeline/Files/Settings.
- Filter.
- Search.
- Add task.

### Kanban

- Drag/drop cards.
- Add column.
- Rename column.
- Reorder column.
- Column color.
- WIP limit.
- Collapse column.
- Archive column.

### Card

- Title.
- Priority.
- Tags.
- Assignee.
- Due date.
- Checklist progress.
- Comment count.
.

### Drag/drop states

- Drag preview.
- Valid drop target.
- Invalid drop target.
- Saving.
- Save failed.
- Revert after API failure.

---

## 9.4. Project List View — `/app/projects/[id]/list`

### Features

- Table.
- Sort.
- Filter.
- Group by status/assignee/priority.
- Inline edit.
- Multi-select.
- Bulk edit.
- Column visibility.

---

## 9.5. Project Timeline — `/app/projects/[id]/timeline`

### Layout

```text
            JAN        FEB        MAR
Project ─────────────────────────────────
Task A       █████████
Task B          ███████████
Task C                █████████
```

### Features

- Start/end date.
- Dependencies.
- Today marker.
- Zoom Day/Week/Month/Quarter.
- Drag timeline.
- Resize duration.
- Dependency arrows.
- Conflict warning.

---

## 9.6. Project Files — `/app/projects/[id]/files`

### Features

- Upload.
- Drag/drop.
- Grid/List.
- Folder.
- Search.
- Sort.
- Type filter.
- Preview.
- Download.
- Rename.
- Delete.

### Upload states

- Uploading.
- Progress.
- Complete.
- Failed.
- File too large.
- Unsupported type.

---

## 9.7. Project Settings — `/app/projects/[id]/settings`

### Sections

- General.
- Members.
- Permissions.
- Workflow.
- Notifications.
- Custom fields.
- Archive.
- Danger Zone/Delete project.

---

# 10. CALENDAR

## Calendar — `/app/calendar`

### Toolbar

- Previous/Next.
- Today.
- Day/Week/Month/Agenda.
- Search.
- Project filter.
- Assignee filter.
- Status filter.

### Main area

- Calendar grid.
- Task chips.
- Due-date markers.
- Unscheduled tasks panel.
- Drag task to date.
- Resize scheduled duration nếu hỗ trợ.

### States

- No tasks scheduled.
- Loading.
- Drag failed.
- Calendar sync error.
- Date conflict.

---

# 11. SEARCH

## 11.1. Command Palette — `Ctrl + K / Cmd + K`

### Layout

```text
┌───────────────────────────────────────┐
│ 🔍 Search tasks, projects, people... │
├───────────────────────────────────────┤
│ Recent                                │
│                                       │
│ TASKS                                 │
│  Fix login                            │
│  Update dashboard                     │
│                                       │
│ PROJECTS                              │
│  Auction System                       │
└───────────────────────────────────────┘
```

### Keyboard

- Arrow Up/Down.
- Enter.
- Esc.
- Shortcut hint.

### Search states

- Recent searches.
- Suggestions.
- Loading.
- No result.
- Error.

---

## 11.2. Full Search — `/app/search`

### Result groups

- Tasks.
- Projects.
- Members.
- Comments.
- Attachments.

### Filters

- Project.
- Result type.
- Date range.
- Status.
- Priority.
- Assignee.
.

### Empty state

- Search illustration.
- Query suggestions.
- Clear filters.

---

# 12. NOTIFICATIONS

## 12.1. Notification Dropdown

### Contents

- Latest 5–10 items.
- Unread marker.
- Mark all read.
- View all.

### Notification types

- Task assigned.
- Mention.
- Comment.
- Due date approaching.
- Invite.
- Workspace event.

---

## 12.2. Notification Center — `/app/notifications`

### Tabs/filters

- All.
- Unread.
- Mentions.
- Assignments.
- Comments.
- Deadlines.
- Workspace.

### States

- Unread.
- Read.
- Empty.
- Loading.
- Pagination.

---

# 13. COLLABORATION / MEMBERS

## 13.1. Members — `/app/members`

### Table

| Avatar | Name | Email | Role | Status | Last active | Actions |
|---|---|---|---|---|---|---|

### Roles

- Owner.
- Admin.
- Member.
- Guest.

### Actions

- View profile.
- Change role.
- Suspend.
- Remove.
- Resend invite.
.

---

## 13.2. Invite Member Modal

### Fields

- Email multi-input.
- Role.
- Optional personal message.

### Actions

- Cancel.
- Send invitations.

### Errors

- Invalid email.
- Duplicate email.
- User already member.
- Invite limit reached.
- Mail service failed.

---

## 13.3. Pending Invitations — `/app/members/invitations`

### Table

- Email.
- Role.
- Invited by.
- Invited date.
- Expiration.
- Status.
- Resend.
- Revoke.

---

## 13.4. Member Profile — `/app/members/[id]`

### Sections

- Avatar/name/email.
- Role.
- Projects.
- Assigned tasks.
- Activity.
- Last active.
- Permission summary.

---

# 14. ACTIVITY / AUDIT

## Activity Log — `/app/activity`

### Layout

```text
Activity

[Date] [User] [Action] [Entity]

10:32 John   updated  Task #123
10:28 Jane   created  Project A
09:54 Admin  changed  role
```

### Filters

- Date range.
- User.
- Action.
- Project.
- Task/entity.

### Event types

- Create.
- Update.
- Delete.
- Archive.
- Restore.
- Role change.
- Login.
- Logout.
- Integration changes.
- Billing events.

---

# 15. ANALYTICS / REPORTING

## Analytics Dashboard — `/app/analytics`

### Header

- Date range.
- Project filter.
- Member filter.
- Export CSV.
- Export PDF.

### KPI cards

- Tasks created.
- Tasks completed.
- Overdue tasks.
- Average completion time.
- Completion rate.

### Charts

1. Burn-down Chart — Line.
2. Task Distribution — Pie/Donut.
3. Team Velocity — Bar.
4. Overdue Trend — Area.
5. Project Progress — Horizontal bars.
6. Time to Completion — Histogram.

### Layout

```text
Analytics

Filters

[KPI] [KPI] [KPI] [KPI]

┌────────────────┐ ┌────────────────┐
│ Burn-down      │ │ Team Velocity  │
└────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│ Priority       │ │ Overdue Trend  │
└────────────────┘ └────────────────┘

Project progress
████████████░░ 82%
```

### States

- No data.
- Loading chart.
- API error.
- Filter returns empty.
- Export processing.
- Export failed.

---

# 16. ARCHIVED

## Archived — `/app/archived`

### Tabs

- Archived Projects.
- Archived Tasks.

### Table

- Item name.
- Original project.
- Archived by.
- Archived date.
- Actions.

### Actions

- Restore.
- Delete forever.
.

### Permanent deletion

Phải có dialog xác nhận, ưu tiên yêu cầu nhập tên entity.

### Empty state

"Chưa có mục nào được lưu trữ."

---

# 17. SETTINGS

## 17.1. Profile — `/app/settings/profile`

### Personal information

- Avatar upload/crop.
- Full name.
- Email.
- Timezone.
- Language.

### Password

- Current password.
- New password.
- Confirm new password.

### Notifications shortcut

- Link tới Notification Settings.

---

## 17.2. Security — `/app/settings/security`

### Sections

**Password**
- Change password.

**Two-factor authentication**
- Enable.
- Disable.
- Setup QR.
- Backup codes.
- Regenerate backup codes.

**Active sessions**
- Device.
- Browser.
- Location summary nếu hệ thống cung cấp.
- Last active.
- Revoke session.
- Logout all devices.

**Login history**
- Successful login.
- Failed login.
- Timestamp.
- Device/browser summary.

---

## 17.3. Notification Settings — `/app/settings/notifications`

### Matrix

| Event | Email | In-app | Slack |
|---|---:|---:|---:|
| Assignment | ON | ON | OFF |
| Mention | ON | ON | ON |
| Comment | OFF | ON | OFF |
| Due date | ON | ON | ON |

### UI

- Toggle.
- Select all.
- Reset defaults.
- Save state.

---

## 17.4. Workspace Settings — `/app/settings/workspace`

### Fields

- Workspace name.
- Logo.
- Domain/subdomain.
- Default timezone.
- Default role.
- Workspace preferences.

### Danger Zone

- Archive workspace.
- Delete workspace.
- Require workspace-name confirmation.

---

## 17.5. Roles & Permissions — `/app/settings/permissions`

### Permission matrix

| Role | Projects | Tasks | Members | Billing | Settings |
|---|---:|---:|---:|---:|---:|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | — | ✓ |
| Member | ✓ | ✓ | — | — | — |
| Guest | Limited | Limited | — | — | — |

### Features

- View permissions.
- Edit custom role nếu SaaS hỗ trợ.
- Create role.
- Delete role nếu không còn user.
- Set default role.

---

# 18. INTEGRATIONS

## 18.1. Integrations — `/app/settings/integrations`

### Grid

- Slack.
- GitHub.
- GitLab.
- Jira.
- Zapier.
- Google Drive.
- Notion Import.

### Card

```text
[Logo]
Slack
Team notifications

Status: Connected

[Configure] [Disconnect]
```

### Statuses

- Not connected.
- Connecting.
- Connected.
- Needs re-authentication.
- Error.

---

## 18.2. Integration Detail — `/app/settings/integrations/[provider]`

### Sections

- Connection status.
- Account/workspace.
- Channel/project mapping.
- Notification types.
- Permissions.
- Test connection.
- Disconnect.

### OAuth errors

- Popup blocked.
- Authorization denied.
- Expired token.
- Missing permissions.
- Provider unavailable.

---

# 19. BILLING / SUBSCRIPTION

## 19.1. Billing — `/app/settings/billing`

### Current plan

- Plan name.
- Seats used/total.
- Billing cycle.
- Next renewal.
- Upgrade CTA.
.

### Payment method

- Brand.
- Last 4 digits.
- Expiry.
- Update card.
.

### Invoices

| Month | Amount | Status | Invoice |
|---|---:|---|---|

- View invoice.
- Download PDF.

### Subscription actions

- Upgrade.
- Downgrade.
- Cancel.
.

---

## 19.2. Checkout — `/checkout`

### Layout

```text
Checkout

Plan summary                  Payment
──────────────               ─────────────
Pro                           Card number
25 seats                      Expiration
Monthly                       CVC
                              Billing info
                              [Pay & Upgrade]
```

### States

- Payment processing.
- Card declined.
- 3DS required.
- Payment timeout.
- Payment failed.
- Success.

---

## 19.3. Checkout Success — `/checkout/success`

```text
✓ Upgrade complete

Your workspace is now on Pro.

[Go to workspace]
[View billing]
```

---

## 19.4. Checkout Failure — `/checkout/failure`

```text
Payment failed

We couldn't complete the payment.

[Try again]
[Change payment method]
[Contact support]
```

---

## 19.5. Cancel Subscription — `/subscription/cancel`

### UI

- Current plan.
- End date.
- Reason options.
- Free-text feedback.
- Keep plan.
- Confirm cancellation.

---

# 20. SUPPORT SUB-PAGES

## 20.1. Help Article — `/support/article/[id]`

- Breadcrumb.
- Article title.
- Updated date.
- Table of contents.
- Article body.
- Related articles.
- Helpful Yes/No.
- Contact support CTA.

## 20.2. Contact Support — `/support/contact`

### Fields

- Category.
- Subject.
- Description.
- Attachment.
- Priority.
- Email.

### States

- Sending.
- Submitted.
- Failed.
- Attachment failed.
.

---

# 21. SYSTEM ERROR PAGES

## 21.1. 404 — Not Found

### Layout

```text
404

Trang không tồn tại

The page may have been removed,
renamed, or is unavailable.

[Go to Dashboard]
[Report problem]
```

### Actions

- Back.
- Dashboard.
- Report problem.

---

## 21.2. 403 — Forbidden

**Có thể dùng như page riêng hoặc inline component tùy route.**

```text
403

Access denied

You don't have permission to view this resource.

[Back]
[Dashboard]
[Contact admin]
```

### Dùng cho

- Project private.
- Member management.
- Billing admin-only.
- Workspace settings.
- Enterprise-only feature.
.

---

## 21.3. 500 — Global Error

```text
500

Something went wrong.

Reference ID: ERR-XXXXXX

[Reload]
[Contact support]
```

### Không hiển thị

- Stack trace cho user bình thường.
- Internal implementation details.

---

## 21.4. Maintenance — `/maintenance`

### UI

- Illustration.
- Maintenance message.
- Estimated completion nếu có.
- Status page link.
- Refresh button.
- Support/contact.

---

# 22. GLOBAL ERROR / FEEDBACK COMPONENTS

## 22.1. Inline Validation Error

```text
Email
┌──────────────────────────────┐
│ abc@                         │
└──────────────────────────────┘
⚠ Email không hợp lệ
```

### Variants

- Required.
- Invalid.
- Conflict.
- Weak password.
- Server validation.

---

## 22.2. Toast

### Success

`✓ Đã lưu thay đổi thành công.`

### Error

`✕ Không thể lưu. [Thử lại]`

### Warning

`⚠ Tệp vượt quá dung lượng cho phép.`

### Info

`ℹ Đang đồng bộ dữ liệu...`

### Rules

- Auto-dismiss cho toast không quan trọng.
- Error có retry khi có thể.
- Toast không che action chính.
- Có close button.

---

## 22.3. Alert/Banner

Dùng cho thông tin cần tồn tại lâu hơn toast.

Variants:

- Success.
- Warning.
- Error.
- Info.

Ví dụ:

```text
⚠ Your trial ends in 3 days. [Upgrade]
```

---

# 23. EMPTY STATES

## 23.1. General pattern

```text
        [Illustration]

        No data yet

Short explanation.

        [Primary CTA]
```

## 23.2. Variants cần thiết

- No projects.
- No tasks.
- No tasks today.
- No overdue tasks.
- No archived items.
- No members.
- No invitations.
- No notifications.
- No analytics data.
- No integrations.
- No search results.
- No files.
- No activity.
.

---

# 24. LOADING / SKELETON STATES

## 24.1. Components

- Page skeleton.
- Table row skeleton.
- Card skeleton.
- Board skeleton.
- Chart skeleton.
- Notification skeleton.
- Avatar skeleton.
- Search results skeleton.
.

## 24.2. Rules

- Giữ layout ổn định.
- Không nhảy kích thước mạnh.
- Skeleton không thay đổi theo dữ liệu thật quá đột ngột.
- Dùng spinner cho thao tác ngắn ở cấp action.

---

# 25. GLOBAL MODALS / DIALOGS

Các modal bắt buộc phải có thiết kế riêng và trạng thái loading/error.

## 25.1. Delete Confirmation

- Entity name.
- Warning.
- Cancel.
- Delete.

## 25.2. Permanent Delete

- Warning mạnh.
- Type entity name.
- Delete forever.

## 25.3. Archive Confirmation

- Explanation.
- Cancel.
- Archive.

## 25.4. Restore Confirmation

- Explanation.
- Restore.

## 25.5. Remove Member

- Member identity.
- What happens to assigned tasks.
- Cancel/Remove.

## 25.6. Revoke Invitation

- Invite email.
- Confirm revoke.

## 25.7. Change Role

- Current role.
- New role.
- Permission warning.

## 25.8. Disconnect Integration

- Provider.
- Data impact.
- Confirm disconnect.

## 25.9. Leave Workspace

- Confirm.
- Explain ownership restriction nếu là owner.

## 25.10. Unsaved Changes

```text
You have unsaved changes.

[Keep editing] [Discard]
```

## 25.11. Session Expired

```text
Your session has expired.

[Login again]
```

## 25.12. Upgrade Required

```text
This feature is available on Pro.

[View plans]
```

---

# 26. GLOBAL POPOVERS / MENUS

## User Menu

- Profile.
- Settings.
- Keyboard shortcuts.
- Help.
- Logout.

## Task Context Menu

- Open.
- Edit.
- Duplicate.
- Move.
- Archive.
- Delete.
- Copy link.
.

## Project Context Menu

- Open.
- Rename.
- Duplicate.
- Archive.
- Delete.
.

## Table Row Menu

- View.
- Edit.
- Duplicate.
- Delete.
.

---

# 27. RESPONSIVE DESIGN

## 27.1. Desktop

- Sidebar khoảng 240px.
- Content fluid.
- Multi-column dashboard.
- Drawer task từ phải.

## 27.2. Tablet

- Sidebar collapsible.
- Toolbar wrap.
- Board horizontal scroll.
- Drawer rộng hơn hoặc gần full screen.

## 27.3. Mobile

```text
┌──────────────────────┐
│ ☰  Dashboard      🔔│
├──────────────────────┤
│                      │
│      CONTENT         │
│                      │
├──────────────────────┤
│ Home Tasks + More    │
└──────────────────────┘
```

### Mobile-specific UI

- Bottom navigation.
- Hamburger.
- Full-screen task details.
- Horizontal Kanban scroll.
- Filter sheet.
- Datepicker bottom sheet.
- Mobile action sheet.
- Swipe actions.
.

---

# 28. ACCESSIBILITY

## Keyboard

- Tab navigation.
- Enter.
- Esc.
- Arrow navigation trong menu/list.
- `Ctrl/Cmd + K` search.
- `C` create task.

## Focus

- Visible focus ring.
- Focus trap trong modal.
- Focus restore sau khi đóng modal.

## Screen reader

- Aria label cho icon buttons.
- Semantic headings.
- Table headers.
- Error association với field.
- Live region cho toast/status khi cần.

## Color

- Không dùng màu duy nhất để biểu đạt state.
- Error/warning/success phải có icon/label.

---

# 29. DESIGN SYSTEM

## 29.1. Color Tokens

| Token | HEX | Dùng cho |
|---|---|---|
| `--primary` | `#08785c` | CTA, active |
| `--primary-dark` | `#005d46` | Hover |
| `--primary-soft` | `#dff5eb` | Soft badges |
| `--surface` | `#f6faf6` | Light background |
| `--ink` | `#181d1a` | Text |
| `--muted` | `#66716b` | Secondary text |
| `--line` | `#dbe5de` | Borders |
| `--danger` | `#ba1a1a` | Error/destructive |
| `--amber` | `#9a5b00` | Warning |
| `--blue` | `#2563a8` | Info |
| App BG | `#141a17` | Dark app |
| Sidebar BG | `#111814` | Dark sidebar |
| Card dark | `rgba(255,255,255,0.05)` | Dark cards |
| Accent teal | `#4ecda8` | Active highlight |

## 29.2. Typography

| Style | Size | Weight |
|---|---:|---:|
| H1 | 32–40px | 800 |
| H2 | 24px | 700 |
| H3 | 18px | 700 |
| Body | 14px | 400 |
| Small | 12px | 500 |
| Micro | 10.5px | 600–700 |

## 29.3. Spacing

| Token | Value |
|---|---:|
| xs | 4px |
| sm | 8px |
| md | 12–16px |
| lg | 24–28px |
| xl | 40–48px |

## 29.4. Radius

| Token | Value | Use |
|---|---:|---|
| sm | 8px | Buttons/inputs |
| md | 10–12px | Cards |
| lg | 14–16px | Panels/modals |
| pill | 999px | Tags/badges |

## 29.5. Interaction states

| State | UI |
|---|---|
| Hover | translateY(-1 to -2px) + subtle shadow |
| Focus | 2px primary outline |
| Active | scale 0.98 |
| Disabled | opacity ~0.48 |
| Loading | spinner/skeleton |
| Error | red border + message |
| Success | success icon/color |

## 29.6. Core components

- Button.
- Input.
- Textarea.
- Select.
- Combobox.
- Badge.
- Avatar.
- Toast.
- Alert.
- Modal/Dialog.
- Drawer.
- Dropdown.
- Tooltip.
- Tabs.
- Datepicker.
- Calendar.
- Table.
- Pagination.
- Progress bar.
- Skeleton.
- Empty state.
- Command palette.
- File uploader.
- Rich text editor.
- Tag input.
- Avatar group.
- Checkbox.
- Radio.
- Switch.
.

---

# 30. CRITICAL USER FLOWS

## Flow 1 — Register

```text
Landing
→ Register
→ Email verification
→ Onboarding
→ Workspace setup
→ Invite members
→ Choose template
→ Dashboard
```

## Flow 2 — Login

```text
Login
→ password valid
→ MFA nếu bật
→ Dashboard
```

## Flow 3 — Create Task

```text
Dashboard
→ + Create
→ Quick Task Modal
→ Create
→ Toast success
→ Task appears
```

## Flow 4 — Full Task

```text
Create Task
→ Description
→ Assignee
→ Priority
→ Due date
→ Checklist
→ Attachment
→ Save
```

## Flow 5 — Board Drag/Drop

```text
Board
→ drag card
→ valid target
→ drop
→ PATCH status
→ optimistic UI
→ success / revert on failure
```

## Flow 6 — Invite Member

```text
Members
→ Invite
→ Enter email + role
→ Send
→ Invitation email
→ Invite page
→ Accept
→ Login/Register
→ Workspace
```

## Flow 7 — Forgot Password

```text
Forgot password
→ email
→ reset link
→ reset password
→ success
→ Login
```

## Flow 8 — Billing

```text
Pricing
→ Choose plan
→ Checkout
→ Payment
→ Success
→ Billing updated
```

## Flow 9 — Network Error

```text
Task editor
→ Save
→ Network/API failure
→ Inline/Toast error
→ Retry
→ Success
```

## Flow 10 — Permission Error

```text
User opens protected resource
→ permission check
→ 403 / inline unauthorized
→ Back / Dashboard / Contact admin
```

---

# 31. FINAL SCREEN INVENTORY

## 31.1. Primary page/context inventory

| # | Screen / Context | Route | Auth |
|---:|---|---|:---:|
| 1 | Landing | `/` | No |
| 2 | Pricing | `/pricing` | No |
| 3 | Solutions | `/solutions` | No |
| 4 | Resources | `/resources` | No |
| 5 | Support Center | `/support` | No |
| 6 | Terms | `/terms` | No |
| 7 | Privacy | `/privacy` | No |
| 8 | Security | `/security` | No |
| 9 | Login | `/login` | No |
| 10 | Register | `/register` | No |
| 11 | Verify Email | `/verify-email` | Partial |
| 12 | Forgot Password | `/forgot-password` | No |
| 13 | Reset Password | `/reset-password` | No |
| 14 | MFA Verification | `/auth/mfa` | Partial |
| 15 | Account Locked | `/account-locked` | No |
| 16 | Welcome Onboarding | `/onboarding/welcome` | Yes |
| 17 | Workspace Onboarding | `/onboarding` | Yes |
| 18 | Workspace Invite | `/invite` | No |
| 19 | Dashboard | `/app` | Yes |
| 20 | My Tasks | `/app/tasks` | Yes |
| 21 | Create Task | `/app/tasks/new` | Yes |
| 22 | Task Detail | `/app/tasks/[id]` | Yes |
| 23 | Projects | `/app/projects` | Yes |
| 24 | Create Project | `/app/projects/new` | Yes |
| 25 | Project Board | `/app/projects/[id]/board` | Yes |
| 26 | Project List | `/app/projects/[id]/list` | Yes |
| 27 | Project Timeline | `/app/projects/[id]/timeline` | Yes |
| 28 | Project Files | `/app/projects/[id]/files` | Yes |
| 29 | Project Settings | `/app/projects/[id]/settings` | Yes |
| 30 | Calendar | `/app/calendar` | Yes |
| 31 | Search | `/app/search` | Yes |
| 32 | Notifications | `/app/notifications` | Yes |
| 33 | Activity Log | `/app/activity` | Yes |
| 34 | Archived | `/app/archived` | Yes |
| 35 | Members | `/app/members` | Yes/Admin |
| 36 | Invitations | `/app/members/invitations` | Yes/Admin |
| 37 | Member Profile | `/app/members/[id]` | Yes |
| 38 | Analytics | `/app/analytics` | Yes |
| 39 | Profile Settings | `/app/settings/profile` | Yes |
| 40 | Security Settings | `/app/settings/security` | Yes |
| 41 | Notification Settings | `/app/settings/notifications` | Yes |
| 42 | Workspace Settings | `/app/settings/workspace` | Yes/Admin |
| 43 | Roles & Permissions | `/app/settings/permissions` | Yes/Admin |
| 44 | Integrations | `/app/settings/integrations` | Yes/Admin |
| 45 | Integration Detail | `/app/settings/integrations/[provider]` | Yes/Admin |
| 46 | Billing | `/app/settings/billing` | Yes/Owner |
| 47 | Checkout | `/checkout` | Yes |
| 48 | Checkout Success | `/checkout/success` | Yes |
| 49 | Checkout Failure | `/checkout/failure` | Yes |
| 50 | Cancel Subscription | `/subscription/cancel` | Yes/Owner |
| 51 | Help Article | `/support/article/[id]` | No |
| 52 | Contact Support | `/support/contact` | Optional |
| 53 | 403 | `/403` | Optional |
| 54 | 404 | catch-all | No |
| 55 | 500 Global Error | `global-error` | No |
| 56 | Maintenance | `/maintenance` | No |

**Tổng: 56 primary page/context.**

## 31.2. Global UI contexts không tính vào 56 page

- App Shell.
- Workspace Switcher.
- User Menu.
- Command Palette.
- Notification Dropdown.
- Quick Create Task Modal.
- Invite Member Modal.
- Delete Confirmation.
- Permanent Delete Dialog.
- Archive Dialog.
- Restore Dialog.
- Remove Member Dialog.
- Revoke Invite Dialog.
- Change Role Dialog.
- Disconnect Integration Dialog.
- Unsaved Changes Dialog.
- Session Expired Dialog.
- Upgrade Required Dialog.
- File Upload Modal/Drawer.
- Datepicker.
- Filter Sheet.
- Mobile Action Sheet.
- Context Menu.
- Toast.
- Alert Banner.
- Empty States.
- Skeleton States.
- Inline Errors.
- Network Error State.
- Permission Denied State.

---

# 32. MỨC ĐỘ HOÀN THIỆN

## MVP bắt buộc

- Landing.
- Login.
- Register.
- Forgot/Reset Password.
- Onboarding.
- Dashboard.
- Tasks.
- Projects.
- Board.
- Calendar.
- Members.
- Notifications.
- Settings cơ bản.
- 404/403/500.
- Error/loading/empty states.

## Production-ready

Bổ sung:

- Email verification.
- MFA setup.
- Security.
- Active sessions.
- Roles & permissions.
- Invitations management.
- Project list/timeline/files/settings.
- Analytics.
- Integrations + OAuth error states.
- Billing + checkout + payment failure.
- Support article/contact.
- Audit log.
- Responsive mobile.
- Accessibility.

## Enterprise-ready mở rộng

Có thể bổ sung thêm trong phase sau:

- SSO/SAML setup UI.
- SCIM provisioning.
- Enterprise audit export.
- Advanced retention policies.
- Custom security policies.
- Custom domains.
- API key management.
- Webhooks.
- Advanced automation builder.
- Custom fields management.
- Time tracking.
- Advanced report builder.

---

# 33. CHECKLIST UI TRƯỚC KHI CODE

## Page-level

- [ ] Desktop layout.
- [ ] Tablet layout.
- [ ] Mobile layout.
- [ ] Loading.
- [ ] Empty.
- [ ] Error.
- [ ] Permission.
- [ ] Success.
- [ ] Network failure.

## Form-level

- [ ] Required validation.
- [ ] Invalid format.
- [ ] Disabled.
- [ ] Loading submit.
- [ ] Duplicate/conflict.
- [ ] Server error.
- [ ] Unsaved changes.

## Destructive action

- [ ] Confirmation dialog.
- [ ] Explicit action label.
- [ ] Loading state.
- [ ] Failure state.
- [ ] Success feedback.

## Navigation

- [ ] Breadcrumb.
- [ ] Back behavior.
- [ ] Active sidebar item.
- [ ] Deep-link handling.
- [ ] 404.
- [ ] 403.
- [ ] Session expired.

## Accessibility

- [ ] Keyboard.
- [ ] Focus ring.
- [ ] Screen reader labels.
- [ ] Error association.
- [ ] Contrast.
- [ ] No color-only communication.

---

# 34. KẾT LUẬN

Blueprint ban đầu có 36 màn hình chính. Tài liệu này mở rộng thành **56 primary page/context**, đồng thời tách riêng hệ thống modal, drawer, popup, command palette, error states, empty states, loading states, responsive states và security/billing/support flows.

Đây nên được xem là **UI Master Specification**: trước khi AI/frontend code từng route, phải đọc đúng phần route đó và tuân thủ App Shell + Design System + State Matrix + Permission + Responsive rules ở các phần dùng chung.

Không được tự ý bỏ qua các trạng thái Error/Empty/Loading chỉ vì backend mock đang trả dữ liệu thành công.

