CREATE TABLE `smsLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipient` varchar(20) NOT NULL,
	`message` text NOT NULL,
	`status` enum('sent','delivered','failed','pending','rejected') NOT NULL DEFAULT 'pending',
	`messageId` varchar(100),
	`cost` varchar(50),
	`errorMessage` text,
	`sentAt` timestamp NOT NULL,
	`deliveredAt` timestamp,
	`orderId` int,
	`notificationType` varchar(100),
	`provider` varchar(50) DEFAULT 'africastalking',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smsLogs_id` PRIMARY KEY(`id`)
);
