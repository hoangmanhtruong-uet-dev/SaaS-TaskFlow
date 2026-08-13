import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = () => integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  providerUserId: text("provider_user_id").notNull(),
  email: text("email").notNull(),
  emailNormalized: text("email_normalized").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
  timezone: text("timezone").notNull().default("Asia/Ho_Chi_Minh"),
  createdAt: now(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("users_provider_uidx").on(table.providerUserId), uniqueIndex("users_email_uidx").on(table.emailNormalized)]);

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(), name: text("name").notNull(), slug: text("slug").notNull(),
  plan: text("plan", { enum: ["FREE", "PRO"] }).notNull().default("FREE"),
  archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
  deletionRequestedAt: integer("deletion_requested_at", { mode: "timestamp_ms" }),
  deletionScheduledFor: integer("deletion_scheduled_for", { mode: "timestamp_ms" }),
  createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("workspaces_slug_uidx").on(table.slug)]);

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["OWNER", "ADMIN", "MEMBER", "GUEST"] }).notNull(),
  status: text("status", { enum: ["ACTIVE", "SUSPENDED", "LEFT"] }).notNull().default("ACTIVE"),
  createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("memberships_workspace_user_uidx").on(table.workspaceId, table.userId), uniqueIndex("memberships_workspace_id_uidx").on(table.workspaceId, table.id), index("memberships_lookup_idx").on(table.workspaceId, table.userId, table.status)]);

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  emailNormalized: text("email_normalized").notNull(), role: text("role", { enum: ["ADMIN", "MEMBER", "GUEST"] }).notNull(),
  tokenHash: text("token_hash").notNull(), status: text("status", { enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "USED", "REVOKED"] }).notNull().default("PENDING"),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(), acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id), createdAt: now(),
}, (table) => [uniqueIndex("invitations_token_uidx").on(table.tokenHash), uniqueIndex("invitations_pending_email_uidx").on(table.workspaceId, table.emailNormalized).where(sql`${table.status} = 'PENDING'`), index("invitations_workspace_email_idx").on(table.workspaceId, table.emailNormalized, table.status)]);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(), description: text("description").notNull().default(""),
  visibility: text("visibility", { enum: ["WORKSPACE", "PRIVATE"] }).notNull().default("WORKSPACE"),
  leadMembershipId: text("lead_membership_id").references(() => memberships.id), archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
  createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("projects_workspace_id_uidx").on(table.workspaceId, table.id), index("projects_workspace_archive_idx").on(table.workspaceId, table.archivedAt, table.updatedAt)]);

export const projectMembers = sqliteTable("project_members", {
  projectId: text("project_id").notNull().references(() => projects.id), membershipId: text("membership_id").notNull().references(() => memberships.id),
  accessLevel: text("access_level", { enum: ["VIEW", "COMMENT", "EDIT"] }).notNull().default("VIEW"),
}, (table) => [primaryKey({ columns: [table.projectId, table.membershipId] })]);

export const boards = sqliteTable("boards", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(), version: integer("version").notNull().default(1), createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("boards_workspace_id_uidx").on(table.workspaceId, table.id), index("boards_project_idx").on(table.workspaceId, table.projectId)]);

export const columns = sqliteTable("columns", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), boardId: text("board_id").notNull().references(() => boards.id),
  name: text("name").notNull(), position: integer("position").notNull(), createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("columns_workspace_id_uidx").on(table.workspaceId, table.id), index("columns_board_position_idx").on(table.workspaceId, table.boardId, table.position), check("columns_position_check", sql`${table.position} >= 0`)]);

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), projectId: text("project_id").notNull().references(() => projects.id),
  boardId: text("board_id").notNull().references(() => boards.id), columnId: text("column_id").notNull().references(() => columns.id),
  creatorMembershipId: text("creator_membership_id").notNull().references(() => memberships.id), title: text("title").notNull(), description: text("description").notNull().default(""),
  priority: text("priority", { enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] }).notNull().default("MEDIUM"), position: integer("position").notNull(),
  dueAt: integer("due_at", { mode: "timestamp_ms" }), version: integer("version").notNull().default(1), archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
  createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("tasks_workspace_id_uidx").on(table.workspaceId, table.id), index("tasks_board_position_idx").on(table.workspaceId, table.projectId, table.columnId, table.archivedAt, table.position), check("tasks_position_check", sql`${table.position} >= 0`)]);

export const taskAssignees = sqliteTable("task_assignees", {
  taskId: text("task_id").notNull().references(() => tasks.id), membershipId: text("membership_id").notNull().references(() => memberships.id),
}, (table) => [primaryKey({ columns: [table.taskId, table.membershipId] })]);

export const labels = sqliteTable("labels", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), name: text("name").notNull(), color: text("color").notNull(), createdAt: now(),
}, (table) => [uniqueIndex("labels_workspace_name_uidx").on(table.workspaceId, table.name)]);

export const taskLabels = sqliteTable("task_labels", {
  taskId: text("task_id").notNull().references(() => tasks.id), labelId: text("label_id").notNull().references(() => labels.id),
}, (table) => [primaryKey({ columns: [table.taskId, table.labelId] })]);

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), taskId: text("task_id").notNull().references(() => tasks.id),
  storageKey: text("storage_key").notNull(), fileName: text("file_name").notNull(), mimeType: text("mime_type").notNull(), size: integer("size").notNull(), createdAt: now(),
}, (table) => [index("attachments_task_idx").on(table.workspaceId, table.taskId), check("attachments_size_check", sql`${table.size} >= 0`)]);

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), taskId: text("task_id").notNull().references(() => tasks.id),
  authorMembershipId: text("author_membership_id").notNull().references(() => memberships.id), body: text("body").notNull(), hiddenByAdminAt: integer("hidden_by_admin_at", { mode: "timestamp_ms" }),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }), createdAt: now(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [index("comments_task_created_idx").on(table.workspaceId, table.taskId, table.createdAt)]);

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").references(() => workspaces.id), recipientUserId: text("recipient_user_id").notNull().references(() => users.id),
  type: text("type").notNull(), title: text("title").notNull(), body: text("body").notNull(), readAt: integer("read_at", { mode: "timestamp_ms" }), createdAt: now(),
}, (table) => [index("notifications_recipient_idx").on(table.recipientUserId, table.readAt, table.createdAt)]);

export const activityEvents = sqliteTable("activity_events", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), actorUserId: text("actor_user_id").references(() => users.id),
  action: text("action").notNull(), targetType: text("target_type").notNull(), targetId: text("target_id").notNull(), metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}), createdAt: now(),
}, (table) => [index("activity_workspace_created_idx").on(table.workspaceId, table.createdAt)]);

export const authSessions = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), provider: text("provider").notNull().default("chatgpt"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  rotatedFromSessionId: text("rotated_from_session_id"),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`), revokedAt: integer("revoked_at", { mode: "timestamp_ms" }), createdAt: now(),
}, (table) => [uniqueIndex("auth_sessions_token_uidx").on(table.tokenHash), index("auth_sessions_user_idx").on(table.userId, table.revokedAt, table.expiresAt)]);

export const authTokens = sqliteTable("auth_tokens", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  purpose: text("purpose", { enum: ["EMAIL_VERIFY", "PASSWORD_RESET"] }).notNull(), tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(), usedAt: integer("used_at", { mode: "timestamp_ms" }), createdAt: now(),
}, (table) => [uniqueIndex("auth_tokens_hash_uidx").on(table.tokenHash), index("auth_tokens_user_purpose_idx").on(table.userId, table.purpose, table.usedAt)]);

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").notNull(), windowStartedAt: integer("window_started_at", { mode: "timestamp_ms" }).notNull(),
  count: integer("count").notNull().default(0), blockedUntil: integer("blocked_until", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [primaryKey({ columns: [table.key, table.windowStartedAt] }), index("rate_limits_cleanup_idx").on(table.updatedAt), check("rate_limits_count_check", sql`${table.count} >= 0`)]);

export const workspaceTombstones = sqliteTable("workspace_tombstones", {
  workspaceId: text("workspace_id").primaryKey(), name: text("name").notNull(), slug: text("slug").notNull(),
  requestedAt: integer("requested_at", { mode: "timestamp_ms" }).notNull(), deletedAt: integer("deleted_at", { mode: "timestamp_ms" }).notNull(),
  ownerUserId: text("owner_user_id"), metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
});

export const outboxEvents = sqliteTable("outbox_events", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), type: text("type").notNull(),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull(), attempts: integer("attempts").notNull().default(0),
  availableAt: integer("available_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`), processedAt: integer("processed_at", { mode: "timestamp_ms" }), createdAt: now(),
}, (table) => [index("outbox_pending_idx").on(table.processedAt, table.availableAt, table.createdAt), check("outbox_attempts_check", sql`${table.attempts} >= 0`)]);

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(), workspaceId: text("workspace_id").notNull().references(() => workspaces.id), providerCustomerId: text("provider_customer_id"),
  status: text("status").notNull(), currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }), createdAt: now(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("subscriptions_workspace_uidx").on(table.workspaceId)]);

export const idempotencyRecords = sqliteTable("idempotency_records", {
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id), key: text("key").notNull(), operation: text("operation").notNull(),
  responseHash: text("response_hash").notNull(), expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(), createdAt: now(),
}, (table) => [primaryKey({ columns: [table.workspaceId, table.key, table.operation] }), index("idempotency_expiry_idx").on(table.expiresAt)]);
