CREATE TABLE `couponUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`discountAmount` int NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `couponUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` int NOT NULL,
	`minOrderAmount` int NOT NULL DEFAULT 0,
	`maxDiscountAmount` int,
	`usageLimit` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`perUserLimit` int NOT NULL DEFAULT 1,
	`validFrom` timestamp NOT NULL,
	`validUntil` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyProgram` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`tier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`lifetimePoints` int NOT NULL DEFAULT 0,
	`lifetimeSpent` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyProgram_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyProgram_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earned','redeemed','expired','adjusted') NOT NULL,
	`points` int NOT NULL,
	`description` text NOT NULL,
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotionalCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('discount','free_delivery','cashback','bundle') NOT NULL,
	`targetAudience` enum('all','new_users','active_users','inactive_users','specific') NOT NULL,
	`targetUserIds` text,
	`budget` int,
	`spent` int NOT NULL DEFAULT 0,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('draft','scheduled','active','paused','completed','cancelled') NOT NULL DEFAULT 'draft',
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotionalCampaigns_id` PRIMARY KEY(`id`)
);
