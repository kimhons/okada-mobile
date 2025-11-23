CREATE TABLE `payment_gateway_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('mtn_money','orange_money') NOT NULL,
	`apiKey` varchar(255),
	`apiSecret` varchar(255),
	`webhookUrl` varchar(512),
	`isActive` boolean NOT NULL DEFAULT false,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_gateway_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_gateway_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('mtn_money','orange_money') NOT NULL,
	`syncType` enum('manual','automatic','webhook') NOT NULL,
	`status` enum('success','failed','partial') NOT NULL,
	`transactionsSynced` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_gateway_sync_log_id` PRIMARY KEY(`id`)
);
