CREATE TABLE `dndSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`daysOfWeek` varchar(20) NOT NULL DEFAULT '0,1,2,3,4,5,6',
	`muteSounds` boolean NOT NULL DEFAULT true,
	`muteDesktopNotifications` boolean NOT NULL DEFAULT true,
	`muteEmailNotifications` boolean NOT NULL DEFAULT false,
	`allowUrgent` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dndSchedules_id` PRIMARY KEY(`id`)
);
