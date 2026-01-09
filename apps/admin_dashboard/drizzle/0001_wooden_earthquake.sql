CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(500),
	`parentId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('order','delivery','payment','system') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`total` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` int NOT NULL,
	`riderId` int,
	`status` enum('pending','confirmed','rider_assigned','in_transit','quality_verification','waiting_approval','delivered','cancelled','rejected') NOT NULL DEFAULT 'pending',
	`subtotal` int NOT NULL,
	`deliveryFee` int NOT NULL,
	`total` int NOT NULL,
	`paymentMethod` enum('mtn_money','orange_money','cash') NOT NULL,
	`paymentStatus` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
	`deliveryAddress` text NOT NULL,
	`deliveryLat` varchar(50),
	`deliveryLng` varchar(50),
	`pickupAddress` text,
	`pickupLat` varchar(50),
	`pickupLng` varchar(50),
	`estimatedDeliveryTime` timestamp,
	`actualDeliveryTime` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`categoryId` int NOT NULL,
	`imageUrl` varchar(500),
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`sellerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `qualityPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`photoUrl` varchar(500) NOT NULL,
	`uploadedBy` int NOT NULL,
	`approvalStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qualityPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderEarnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`orderId` int NOT NULL,
	`amount` int NOT NULL,
	`bonus` int NOT NULL DEFAULT 0,
	`tip` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`status` enum('pending','paid','withdrawn') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `riderEarnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`vehicleType` varchar(50),
	`vehicleNumber` varchar(50),
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`rating` int DEFAULT 0,
	`totalDeliveries` int NOT NULL DEFAULT 0,
	`acceptanceRate` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riders_id` PRIMARY KEY(`id`),
	CONSTRAINT `riders_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);