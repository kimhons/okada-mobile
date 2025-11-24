CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientId` int NOT NULL,
	`recipientType` enum('rider','seller') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'XAF',
	`status` enum('pending','approved','rejected','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50) NOT NULL,
	`accountDetails` text,
	`notes` text,
	`approvedBy` int,
	`approvedAt` timestamp,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenueAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`period` enum('daily','weekly','monthly') NOT NULL,
	`totalRevenue` int NOT NULL DEFAULT 0,
	`orderCount` int NOT NULL DEFAULT 0,
	`averageOrderValue` int NOT NULL DEFAULT 0,
	`commissionEarned` int NOT NULL DEFAULT 0,
	`payoutsProcessed` int NOT NULL DEFAULT 0,
	`netRevenue` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenueAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(100) NOT NULL,
	`type` enum('order_payment','payout','refund','commission','fee','adjustment') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'XAF',
	`status` enum('pending','completed','failed','cancelled') NOT NULL,
	`userId` int,
	`orderId` int,
	`payoutId` int,
	`description` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionId_unique` UNIQUE(`transactionId`)
);
