CREATE TABLE `exportHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`exportType` varchar(100) NOT NULL,
	`format` enum('csv','excel','pdf') NOT NULL,
	`filters` text,
	`recordCount` int NOT NULL DEFAULT 0,
	`fileSize` int,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`downloadUrl` text,
	`errorMessage` text,
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `exportHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`reportType` varchar(100) NOT NULL,
	`filters` text,
	`columns` text,
	`groupBy` varchar(100),
	`sortBy` varchar(100),
	`sortOrder` enum('asc','desc') DEFAULT 'desc',
	`chartType` varchar(50),
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`time` varchar(10) NOT NULL,
	`recipients` text NOT NULL,
	`format` enum('pdf','csv','excel') NOT NULL DEFAULT 'pdf',
	`isActive` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledReports_id` PRIMARY KEY(`id`)
);
