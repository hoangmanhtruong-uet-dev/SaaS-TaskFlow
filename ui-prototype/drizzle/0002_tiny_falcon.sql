CREATE TABLE `auth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_tokens_hash_uidx` ON `auth_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `auth_tokens_user_purpose_idx` ON `auth_tokens` (`user_id`,`purpose`,`used_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text NOT NULL,
	`window_started_at` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`blocked_until` integer,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`key`, `window_started_at`),
	CONSTRAINT "rate_limits_count_check" CHECK("rate_limits"."count" >= 0)
);
--> statement-breakpoint
CREATE INDEX `rate_limits_cleanup_idx` ON `rate_limits` (`updated_at`);--> statement-breakpoint
CREATE TABLE `workspace_tombstones` (
	`workspace_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`requested_at` integer NOT NULL,
	`deleted_at` integer NOT NULL,
	`owner_user_id` text,
	`metadata` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text DEFAULT 'chatgpt' NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`rotated_from_session_id` text,
	`last_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`revoked_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
INSERT INTO `__new_auth_sessions` (`id`, `user_id`, `provider`, `token_hash`, `expires_at`, `rotated_from_session_id`, `last_seen_at`, `revoked_at`, `created_at`)
SELECT `id`, `user_id`, `provider`, 'legacy-' || `id`, coalesce(`last_seen_at`, `created_at`) + 2592000000, NULL, `last_seen_at`, `revoked_at`, `created_at` FROM `auth_sessions`;--> statement-breakpoint
DROP TABLE `auth_sessions`;--> statement-breakpoint
ALTER TABLE `__new_auth_sessions` RENAME TO `auth_sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `auth_sessions_token_uidx` ON `auth_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_idx` ON `auth_sessions` (`user_id`,`revoked_at`,`expires_at`);--> statement-breakpoint
CREATE TABLE `__new_outbox_events` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`available_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`processed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "outbox_attempts_check" CHECK("__new_outbox_events"."attempts" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_outbox_events`("id", "workspace_id", "type", "payload", "attempts", "available_at", "processed_at", "created_at") SELECT "id", "workspace_id", "type", "payload", "attempts", "created_at", "processed_at", "created_at" FROM `outbox_events`;--> statement-breakpoint
DROP TABLE `outbox_events`;--> statement-breakpoint
ALTER TABLE `__new_outbox_events` RENAME TO `outbox_events`;--> statement-breakpoint
CREATE INDEX `outbox_pending_idx` ON `outbox_events` (`processed_at`,`available_at`,`created_at`);--> statement-breakpoint
ALTER TABLE `workspaces` ADD `deletion_scheduled_for` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `boards_workspace_id_uidx` ON `boards` (`workspace_id`,`id`);--> statement-breakpoint
CREATE TABLE `__new_columns` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`board_id` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "columns_position_check" CHECK("__new_columns"."position" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_columns`("id", "workspace_id", "board_id", "name", "position", "created_at", "updated_at") SELECT "id", "workspace_id", "board_id", "name", "position", "created_at", "updated_at" FROM `columns`;--> statement-breakpoint
DROP TABLE `columns`;--> statement-breakpoint
ALTER TABLE `__new_columns` RENAME TO `columns`;--> statement-breakpoint
CREATE UNIQUE INDEX `columns_workspace_id_uidx` ON `columns` (`workspace_id`,`id`);--> statement-breakpoint
CREATE INDEX `columns_board_position_idx` ON `columns` (`workspace_id`,`board_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_pending_email_uidx` ON `invitations` (`workspace_id`,`email_normalized`) WHERE "invitations"."status" = 'PENDING';--> statement-breakpoint
CREATE UNIQUE INDEX `memberships_workspace_id_uidx` ON `memberships` (`workspace_id`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_workspace_id_uidx` ON `projects` (`workspace_id`,`id`);--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`project_id` text NOT NULL,
	`board_id` text NOT NULL,
	`column_id` text NOT NULL,
	`creator_membership_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`position` integer NOT NULL,
	`due_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`column_id`) REFERENCES `columns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_membership_id`) REFERENCES `memberships`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "tasks_position_check" CHECK("__new_tasks"."position" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "workspace_id", "project_id", "board_id", "column_id", "creator_membership_id", "title", "description", "priority", "position", "due_at", "version", "archived_at", "created_at", "updated_at") SELECT "id", "workspace_id", "project_id", "board_id", "column_id", "creator_membership_id", "title", "description", "priority", "position", "due_at", "version", "archived_at", "created_at", "updated_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_workspace_id_uidx` ON `tasks` (`workspace_id`,`id`);--> statement-breakpoint
CREATE INDEX `tasks_board_position_idx` ON `tasks` (`workspace_id`,`project_id`,`column_id`,`archived_at`,`position`);--> statement-breakpoint
CREATE TABLE `__new_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`task_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "attachments_size_check" CHECK("__new_attachments"."size" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_attachments`("id", "workspace_id", "task_id", "storage_key", "file_name", "mime_type", "size", "created_at") SELECT "id", "workspace_id", "task_id", "storage_key", "file_name", "mime_type", "size", "created_at" FROM `attachments`;--> statement-breakpoint
DROP TABLE `attachments`;--> statement-breakpoint
ALTER TABLE `__new_attachments` RENAME TO `attachments`;--> statement-breakpoint
CREATE INDEX `attachments_task_idx` ON `attachments` (`workspace_id`,`task_id`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA optimize;
