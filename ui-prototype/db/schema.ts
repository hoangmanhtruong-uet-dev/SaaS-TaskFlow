import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();

export const workspaceRole = pgEnum("workspace_role", ["OWNER", "ADMIN", "MEMBER", "GUEST"]);
export const membershipStatus = pgEnum("membership_status", ["ACTIVE", "SUSPENDED", "LEFT"]);
export const projectVisibility = pgEnum("project_visibility", ["WORKSPACE", "PRIVATE"]);
export const projectAccessLevel = pgEnum("project_access_level", ["VIEW", "COMMENT", "EDIT"]);
export const invitationStatus = pgEnum("invitation_status", ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "USED", "REVOKED"]);

export const users = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  providerUserId: text("provider_user_id").notNull(),
  email: text("email").notNull(),
  emailNormalized: text("email_normalized").generatedAlwaysAs(sql`lower(trim(email))`),
  name: text("name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true, mode: "date" }),
  timezone: text("timezone").notNull().default("Asia/Ho_Chi_Minh"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("profiles_provider_uidx").on(table.providerUserId),
  uniqueIndex("profiles_email_uidx").on(table.emailNormalized),
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  plan: text("plan", { enum: ["FREE", "PRO"] }).notNull().default("FREE"),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true, mode: "date" }),
  deletionScheduledFor: timestamp("deletion_scheduled_for", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("workspaces_slug_uidx").on(table.slug)]);

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: workspaceRole("role").notNull(),
  status: membershipStatus("status").notNull().default("ACTIVE"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("memberships_workspace_user_uidx").on(table.workspaceId, table.userId),
  uniqueIndex("memberships_workspace_id_uidx").on(table.workspaceId, table.id),
  index("memberships_lookup_idx").on(table.workspaceId, table.userId, table.status),
]);

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  emailNormalized: text("email_normalized").notNull(),
  role: workspaceRole("role").notNull(),
  tokenHash: text("token_hash").notNull(),
  status: invitationStatus("status").notNull().default("PENDING"),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("invitations_token_uidx").on(table.tokenHash),
  uniqueIndex("invitations_pending_email_uidx").on(table.workspaceId, table.emailNormalized).where(sql`${table.status} = 'PENDING'`),
  index("invitations_workspace_email_idx").on(table.workspaceId, table.emailNormalized, table.status),
]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  visibility: projectVisibility("visibility").notNull().default("WORKSPACE"),
  leadMembershipId: uuid("lead_membership_id").references(() => memberships.id),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("projects_workspace_id_uidx").on(table.workspaceId, table.id),
  index("projects_workspace_archive_idx").on(table.workspaceId, table.archivedAt, table.updatedAt),
]);

export const projectMembers = pgTable("project_members", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  membershipId: uuid("membership_id").notNull().references(() => memberships.id, { onDelete: "cascade" }),
  accessLevel: projectAccessLevel("access_level").notNull().default("VIEW"),
}, (table) => [primaryKey({ columns: [table.projectId, table.membershipId] })]);

export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const columns = pgTable("board_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  boardId: uuid("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("board_columns_board_position_idx").on(table.workspaceId, table.boardId, table.position),
  check("board_columns_position_check", sql`${table.position} >= 0`),
]);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  boardId: uuid("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  columnId: uuid("column_id").notNull().references(() => columns.id),
  creatorMembershipId: uuid("creator_membership_id").notNull().references(() => memberships.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  priority: text("priority", { enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] }).notNull().default("MEDIUM"),
  position: integer("position").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true, mode: "date" }),
  version: integer("version").notNull().default(1),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("tasks_board_position_idx").on(table.workspaceId, table.projectId, table.columnId, table.archivedAt, table.position),
  check("tasks_position_check", sql`${table.position} >= 0`),
]);

export const taskAssignees = pgTable("task_assignees", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  membershipId: uuid("membership_id").notNull().references(() => memberships.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.taskId, table.membershipId] })]);

export const taskChecklistItems = pgTable("task_checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  position: integer("position").notNull(),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  completedByUserId: uuid("completed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("task_checklist_items_task_position_idx").on(table.workspaceId, table.taskId, table.position),
  check("task_checklist_items_position_check", sql`${table.position} >= 0`),
  check("task_checklist_items_completion_check", sql`(${table.completed} and ${table.completedAt} is not null) or (not ${table.completed} and ${table.completedAt} is null)`),
]);

export const labels = pgTable("labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("labels_workspace_name_uidx").on(table.workspaceId, table.name)]);

export const taskLabels = pgTable("task_labels", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  labelId: uuid("label_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.taskId, table.labelId] })]);

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
}, (table) => [
  index("attachments_task_idx").on(table.workspaceId, table.taskId),
  uniqueIndex("attachments_storage_key_uidx").on(table.storageKey),
  check("attachments_size_check", sql`${table.size} >= 0`),
]);

export const attachmentUploads = pgTable("attachment_uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  uploaderUserId: uuid("uploader_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("attachment_uploads_storage_key_uidx").on(table.storageKey),
  index("attachment_uploads_expiry_idx").on(table.expiresAt),
  index("attachment_uploads_task_idx").on(table.workspaceId, table.taskId),
  check("attachment_uploads_size_check", sql`${table.size} > 0`),
]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  authorMembershipId: uuid("author_membership_id").notNull().references(() => memberships.id),
  body: text("body").notNull(),
  hiddenByAdminAt: timestamp("hidden_by_admin_at", { withTimezone: true, mode: "date" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  recipientUserId: uuid("recipient_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
}, (table) => [index("notifications_recipient_idx").on(table.recipientUserId, table.readAt, table.createdAt)]);

export const activityEvents = pgTable("activity_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("supabase"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  rotatedFromSessionId: uuid("rotated_from_session_id"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
});

export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  purpose: text("purpose", { enum: ["EMAIL_VERIFY", "PASSWORD_RESET"] }).notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true, mode: "date" }).notNull(),
  count: integer("count").notNull().default(0),
  blockedUntil: timestamp("blocked_until", { withTimezone: true, mode: "date" }),
  updatedAt: updatedAt(),
}, (table) => [
  primaryKey({ columns: [table.key, table.windowStartedAt] }),
  index("rate_limits_cleanup_idx").on(table.updatedAt),
  check("rate_limits_count_check", sql`${table.count} >= 0`),
]);

export const workspaceTombstones = pgTable("workspace_tombstones", {
  workspaceId: uuid("workspace_id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true, mode: "date" }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }).notNull(),
  ownerUserId: uuid("owner_user_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
});

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  attempts: integer("attempts").notNull().default(0),
  availableAt: timestamp("available_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
  createdAt: createdAt(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  providerCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeSubscriptionItemId: text("stripe_subscription_item_id"),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  status: text("status").notNull(),
  quantity: integer("quantity").notNull().default(1),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  lastInvoiceStatus: text("last_invoice_status"),
  providerUpdatedAt: timestamp("provider_updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("subscriptions_workspace_uidx").on(table.workspaceId),
  uniqueIndex("subscriptions_customer_uidx").on(table.providerCustomerId),
  uniqueIndex("subscriptions_stripe_subscription_uidx").on(table.stripeSubscriptionId),
  uniqueIndex("subscriptions_stripe_item_uidx").on(table.stripeSubscriptionItemId),
  check("subscriptions_quantity_check", sql`${table.quantity} >= 1`),
]);

export const idempotencyRecords = pgTable("idempotency_records", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  operation: text("operation").notNull(),
  responseHash: text("response_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: createdAt(),
}, (table) => [
  primaryKey({ columns: [table.workspaceId, table.key, table.operation] }),
  index("idempotency_expiry_idx").on(table.expiresAt),
]);

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});
