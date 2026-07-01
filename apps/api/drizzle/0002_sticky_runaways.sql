CREATE TABLE `departments` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`code` varchar(30) NOT NULL,
	`description` varchar(255),
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_org_code_unique` UNIQUE(`organization_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `designations` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`department_id` varchar(36),
	`title` varchar(120) NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designations_id` PRIMARY KEY(`id`),
	CONSTRAINT `designations_org_title_unique` UNIQUE(`organization_id`,`title`)
);
--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `designations` ADD CONSTRAINT `designations_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `designations` ADD CONSTRAINT `designations_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `departments_org_active_idx` ON `departments` (`organization_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `designations_org_dept_idx` ON `designations` (`organization_id`,`department_id`);--> statement-breakpoint
CREATE INDEX `designations_org_active_idx` ON `designations` (`organization_id`,`is_active`);--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_designation_id_designations_id_fk` FOREIGN KEY (`designation_id`) REFERENCES `designations`(`id`) ON DELETE set null ON UPDATE no action;