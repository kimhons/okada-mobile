CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`secret` text,
	`permissions` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `backupLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`size` int,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`type` enum('manual','automatic') NOT NULL DEFAULT 'manual',
	`errorMessage` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `backupLogs_id` PRIMARY KEY(`id`)
);
