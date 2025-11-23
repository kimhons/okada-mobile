CREATE TABLE `commissionSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('seller','rider') NOT NULL,
	`commissionType` enum('percentage','fixed') NOT NULL,
	`value` int NOT NULL,
	`minAmount` int DEFAULT 0,
	`maxAmount` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryZones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`description` text,
	`baseFee` int NOT NULL,
	`perKmFee` int NOT NULL,
	`minDeliveryTime` int,
	`maxDeliveryTime` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryZones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`transactionId` varchar(100) NOT NULL,
	`provider` enum('mtn_money','orange_money','cash') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`phoneNumber` varchar(20),
	`reference` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentTransactions_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `supportTicketMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`isStaff` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supportTicketMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('order','payment','delivery','technical','other') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`assignedTo` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
