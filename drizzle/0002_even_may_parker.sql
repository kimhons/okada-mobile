CREATE TABLE `sellerPayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`amount` int NOT NULL,
	`platformFee` int NOT NULL,
	`netAmount` int NOT NULL,
	`paymentMethod` enum('bank_transfer','mtn_money','orange_money') NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(100),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sellerPayouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sellers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`businessType` varchar(100),
	`businessAddress` text,
	`businessPhone` varchar(20),
	`businessEmail` varchar(320),
	`taxId` varchar(100),
	`bankName` varchar(100),
	`bankAccountNumber` varchar(50),
	`mobileMoneyProvider` enum('mtn_money','orange_money'),
	`mobileMoneyNumber` varchar(20),
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`verificationDocuments` text,
	`commissionRate` int NOT NULL DEFAULT 15,
	`totalSales` int NOT NULL DEFAULT 0,
	`totalOrders` int NOT NULL DEFAULT 0,
	`rating` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sellers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sellers_userId_unique` UNIQUE(`userId`)
);
