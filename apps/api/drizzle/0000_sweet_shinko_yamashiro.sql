CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36),
	`actor_user_id` varchar(36),
	`action` varchar(120) NOT NULL,
	`entity_type` varchar(80),
	`entity_id` varchar(36),
	`request_id` varchar(36),
	`ip_address` varchar(64),
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`employee_code` varchar(60) NOT NULL,
	`department_id` varchar(36),
	`designation_id` varchar(36),
	`status` enum('DRAFT','INVITED','ACTIVE','INACTIVE','EXITED') NOT NULL DEFAULT 'INVITED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_org_code_unique` UNIQUE(`organization_id`,`employee_code`)
);
--> statement-breakpoint
CREATE TABLE `membership_roles` (
	`membership_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	CONSTRAINT `membership_roles_membership_id_role_id_pk` PRIMARY KEY(`membership_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`email` varchar(190) NOT NULL,
	`first_name` varchar(90) NOT NULL,
	`last_name` varchar(90) NOT NULL,
	`role_name` varchar(80) NOT NULL,
	`employee_code` varchar(60),
	`department_id` varchar(36),
	`designation_id` varchar(36),
	`token_hash` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` datetime NOT NULL,
	`accepted_at` datetime,
	`invited_by` varchar(36),
	CONSTRAINT `organization_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `organization_memberships` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`status` enum('INVITED','ACTIVE','SUSPENDED','DISABLED') NOT NULL DEFAULT 'INVITED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `memberships_user_org_unique` UNIQUE(`user_id`,`organization_id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(36) NOT NULL,
	`name` varchar(180) NOT NULL,
	`code` varchar(30) NOT NULL,
	`domain` varchar(180),
	`timezone` varchar(80) NOT NULL DEFAULT 'Asia/Kolkata',
	`status` enum('PENDING','ACTIVE','SUSPENDED','ARCHIVED') NOT NULL DEFAULT 'PENDING',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_code_unique` UNIQUE(`code`),
	CONSTRAINT `organizations_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `otp_challenges` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`destination` varchar(190) NOT NULL,
	`code_digest` varchar(64) NOT NULL,
	`purpose` enum('EMAIL_VERIFICATION','LOGIN','PASSWORD_RESET') NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`max_attempts` int NOT NULL DEFAULT 5,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` datetime NOT NULL,
	`consumed_at` datetime,
	CONSTRAINT `otp_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` datetime NOT NULL,
	`used_at` datetime,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `reset_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL,
	`code` varchar(120) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `platform_user_roles` (
	`user_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	CONSTRAINT `platform_user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL,
	`name` varchar(80) NOT NULL,
	`scope` enum('PLATFORM','ORGANIZATION') NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_scope_unique` UNIQUE(`name`,`scope`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`scope_type` enum('PLATFORM','ORGANIZATION') NOT NULL,
	`organization_id` varchar(36),
	`membership_id` varchar(36),
	`refresh_token_hash` varchar(64) NOT NULL,
	`refresh_jti` varchar(36) NOT NULL,
	`user_agent` varchar(500),
	`ip_address` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` datetime NOT NULL,
	`last_used_at` datetime,
	`revoked_at` datetime,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(90) NOT NULL,
	`last_name` varchar(90) NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(255),
	`status` enum('INVITED','PENDING_VERIFICATION','PENDING_APPROVAL','ACTIVE','LOCKED','SUSPENDED','DISABLED') NOT NULL DEFAULT 'INVITED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`email_verified_at` datetime,
	`password_changed_at` datetime,
	`failed_login_attempts` int NOT NULL DEFAULT 0,
	`locked_until` datetime,
	`last_login_at` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membership_roles` ADD CONSTRAINT `membership_roles_membership_id_organization_memberships_id_fk` FOREIGN KEY (`membership_id`) REFERENCES `organization_memberships`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membership_roles` ADD CONSTRAINT `membership_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_memberships` ADD CONSTRAINT `organization_memberships_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_memberships` ADD CONSTRAINT `organization_memberships_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otp_challenges` ADD CONSTRAINT `otp_challenges_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_user_roles` ADD CONSTRAINT `platform_user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_user_roles` ADD CONSTRAINT `platform_user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_membership_id_organization_memberships_id_fk` FOREIGN KEY (`membership_id`) REFERENCES `organization_memberships`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_org_created_idx` ON `audit_logs` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `employees_org_status_idx` ON `employees` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `invitations_org_email_idx` ON `organization_invitations` (`organization_id`,`email`);--> statement-breakpoint
CREATE INDEX `invitations_expires_idx` ON `organization_invitations` (`expires_at`);--> statement-breakpoint
CREATE INDEX `memberships_org_status_idx` ON `organization_memberships` (`organization_id`,`status`);--> statement-breakpoint
CREATE INDEX `organizations_status_idx` ON `organizations` (`status`);--> statement-breakpoint
CREATE INDEX `otp_destination_purpose_idx` ON `otp_challenges` (`destination`,`purpose`);--> statement-breakpoint
CREATE INDEX `otp_expires_idx` ON `otp_challenges` (`expires_at`);--> statement-breakpoint
CREATE INDEX `reset_user_idx` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);