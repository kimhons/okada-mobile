CREATE TABLE `complianceChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`area` enum('data_privacy','financial','tax','labor','consumer_protection','licensing') NOT NULL,
	`regulation` varchar(255),
	`checkType` enum('automated','manual','audit') NOT NULL,
	`frequency` enum('daily','weekly','monthly','quarterly','annually') NOT NULL,
	`status` enum('compliant','non_compliant','pending_review','remediation') NOT NULL DEFAULT 'pending_review',
	`lastCheckDate` timestamp,
	`nextCheckDate` timestamp,
	`evidence` text,
	`notes` text,
	`responsiblePerson` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceChecks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceViolations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checkId` int NOT NULL,
	`description` text NOT NULL,
	`severity` enum('minor','moderate','major','critical') NOT NULL,
	`remediationPlan` text,
	`remediationDeadline` timestamp,
	`remediationStatus` enum('pending','in_progress','completed','overdue') NOT NULL DEFAULT 'pending',
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`resolutionNotes` text,
	`reportedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceViolations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerSegments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`criteria` text NOT NULL,
	`customerCount` int NOT NULL DEFAULT 0,
	`lastCalculated` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerSegments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryRoutes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`riderId` int,
	`vehicleId` int,
	`date` timestamp NOT NULL,
	`status` enum('planned','in_progress','completed','cancelled') NOT NULL DEFAULT 'planned',
	`totalDistance` int NOT NULL DEFAULT 0,
	`estimatedDuration` int NOT NULL DEFAULT 0,
	`actualDuration` int,
	`totalStops` int NOT NULL DEFAULT 0,
	`completedStops` int NOT NULL DEFAULT 0,
	`optimizationScore` int,
	`fuelEstimate` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryRoutes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketingAutomations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggerType` enum('time_based','event_based','segment_based') NOT NULL,
	`triggerConfig` text NOT NULL,
	`actionType` enum('email','sms','push','discount') NOT NULL,
	`actionConfig` text NOT NULL,
	`segmentId` int,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`sentCount` int NOT NULL DEFAULT 0,
	`openedCount` int NOT NULL DEFAULT 0,
	`clickedCount` int NOT NULL DEFAULT 0,
	`convertedCount` int NOT NULL DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketingAutomations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riskAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('financial','operational','compliance','security','reputational') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`likelihood` enum('rare','unlikely','possible','likely','certain') NOT NULL,
	`impactScore` int NOT NULL,
	`riskScore` int NOT NULL,
	`mitigationPlan` text,
	`mitigationStatus` enum('not_started','in_progress','completed','ongoing') NOT NULL DEFAULT 'not_started',
	`mitigationOwner` int,
	`mitigationDeadline` timestamp,
	`status` enum('identified','assessed','mitigating','resolved','accepted') NOT NULL DEFAULT 'identified',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riskAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routeWaypoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeId` int NOT NULL,
	`orderId` int,
	`sequenceNumber` int NOT NULL,
	`address` text NOT NULL,
	`lat` varchar(50) NOT NULL,
	`lng` varchar(50) NOT NULL,
	`type` enum('pickup','delivery','return') NOT NULL,
	`status` enum('pending','arrived','completed','skipped') NOT NULL DEFAULT 'pending',
	`estimatedArrival` timestamp,
	`actualArrival` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routeWaypoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicleMaintenance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`type` enum('routine','repair','inspection','emergency') NOT NULL,
	`description` text NOT NULL,
	`cost` int NOT NULL,
	`vendorId` int,
	`status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`scheduledDate` timestamp NOT NULL,
	`completedDate` timestamp,
	`mileageAtMaintenance` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicleMaintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plateNumber` varchar(20) NOT NULL,
	`type` enum('motorcycle','bicycle','car','van','truck') NOT NULL,
	`make` varchar(100),
	`model` varchar(100),
	`year` int,
	`color` varchar(50),
	`assignedRiderId` int,
	`status` enum('available','in_use','maintenance','retired') NOT NULL DEFAULT 'available',
	`currentLat` varchar(50),
	`currentLng` varchar(50),
	`lastLocationUpdate` timestamp,
	`lastMaintenanceDate` timestamp,
	`nextMaintenanceDate` timestamp,
	`totalMileage` int NOT NULL DEFAULT 0,
	`insuranceExpiry` timestamp,
	`insuranceProvider` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_plateNumber_unique` UNIQUE(`plateNumber`)
);
--> statement-breakpoint
CREATE TABLE `vendorContracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`contractNumber` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`value` int NOT NULL,
	`status` enum('draft','active','expired','terminated','renewed') NOT NULL DEFAULT 'draft',
	`documentUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendorContracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`contactPerson` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`businessType` varchar(100),
	`taxId` varchar(100),
	`status` enum('active','inactive','suspended','pending') NOT NULL DEFAULT 'pending',
	`rating` int DEFAULT 0,
	`paymentTerms` varchar(100),
	`totalPurchases` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEndpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`authType` enum('none','basic','bearer','hmac') NOT NULL DEFAULT 'hmac',
	`authCredentials` text,
	`events` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastDeliveryStatus` enum('success','failed','pending'),
	`lastDeliveryAt` timestamp,
	`failureCount` int NOT NULL DEFAULT 0,
	`maxRetries` int NOT NULL DEFAULT 3,
	`retryDelay` int NOT NULL DEFAULT 60,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookEndpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpointId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`statusCode` int,
	`response` text,
	`errorMessage` text,
	`attemptCount` int NOT NULL DEFAULT 1,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookLogs_id` PRIMARY KEY(`id`)
);
