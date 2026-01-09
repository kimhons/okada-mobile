CREATE TABLE `backupSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('full','incremental','differential') NOT NULL DEFAULT 'full',
	`frequency` enum('hourly','daily','weekly','monthly') NOT NULL DEFAULT 'daily',
	`time` varchar(10) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 30,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`lastRun` timestamp,
	`nextRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backupSchedules_id` PRIMARY KEY(`id`)
);
