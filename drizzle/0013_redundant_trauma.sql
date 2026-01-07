CREATE TABLE `badgeNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`badgeId` int NOT NULL,
	`type` enum('earned','progress','milestone') NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badgeNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(100) NOT NULL,
	`category` enum('earnings','deliveries','streak','quality','speed','special') NOT NULL,
	`tier` enum('bronze','silver','gold','platinum','diamond') NOT NULL,
	`criteria` text NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentModerationQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('user_profile','product_listing','review','seller_profile','rider_profile','support_message','other') NOT NULL,
	`contentId` int NOT NULL,
	`userId` int NOT NULL,
	`contentUrl` varchar(500),
	`contentText` text,
	`contentMetadata` text,
	`status` enum('pending','approved','rejected','flagged') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`flagReason` text,
	`moderatorId` int,
	`moderatorNotes` text,
	`moderatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentModerationQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`reportType` enum('orders','revenue','riders','users','products','incidents','feedback','training','custom') NOT NULL,
	`filters` text,
	`metrics` text,
	`groupBy` varchar(100),
	`sortBy` varchar(100),
	`sortOrder` enum('asc','desc') DEFAULT 'desc',
	`createdBy` int NOT NULL,
	`isPublic` int NOT NULL DEFAULT 0,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`orderId` int,
	`riderId` int,
	`sellerId` int,
	`overallRating` int NOT NULL,
	`qualityPhotoRating` int,
	`deliveryRating` int,
	`serviceRating` int,
	`productRating` int,
	`feedbackText` text,
	`category` enum('delivery_speed','quality_photos','product_quality','rider_behavior','app_experience','pricing','customer_service','other'),
	`sentiment` enum('positive','neutral','negative'),
	`sentimentScore` int,
	`keywords` text,
	`responseText` text,
	`respondedBy` int,
	`respondedAt` timestamp,
	`status` enum('pending','reviewed','responded','resolved') NOT NULL DEFAULT 'pending',
	`isPublic` int NOT NULL DEFAULT 1,
	`isFeatured` int NOT NULL DEFAULT 0,
	`source` varchar(100),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`note` text NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerTagAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`tagId` int NOT NULL,
	`assignedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerTagAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT '#6B7280',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerTags_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerTags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `disputeMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`disputeId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('customer','admin','rider','seller') NOT NULL,
	`message` text NOT NULL,
	`attachments` text,
	`isInternal` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `disputeMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disputes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`disputeNumber` varchar(50) NOT NULL,
	`orderId` int NOT NULL,
	`customerId` int NOT NULL,
	`riderId` int,
	`sellerId` int,
	`disputeType` enum('delivery_issue','product_quality','missing_items','wrong_order','payment_issue','rider_behavior','seller_issue','other') NOT NULL,
	`status` enum('open','investigating','resolved','escalated','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`resolutionType` enum('refund','replacement','compensation','dismissed','other'),
	`resolutionAmount` int,
	`resolutionNotes` text,
	`assignedTo` int,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`escalatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `disputes_id` PRIMARY KEY(`id`),
	CONSTRAINT `disputes_disputeNumber_unique` UNIQUE(`disputeNumber`)
);
--> statement-breakpoint
CREATE TABLE `fraudAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('suspicious_transaction','multiple_accounts','fake_orders','payment_fraud','identity_theft','bot_activity','unusual_pattern') NOT NULL,
	`userId` int,
	`orderId` int,
	`riskScore` int NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text NOT NULL,
	`detectionMethod` varchar(100),
	`evidenceData` text,
	`status` enum('new','investigating','confirmed','false_positive','resolved') NOT NULL DEFAULT 'new',
	`assignedTo` int,
	`investigationNotes` text,
	`actionTaken` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fraudAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `geoRegions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`regionType` enum('city','zone','district') NOT NULL,
	`parentId` int,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`boundaryData` text,
	`population` int,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `geoRegions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentType` enum('accident','theft','damage','injury','complaint','other') NOT NULL,
	`severity` enum('minor','moderate','severe','critical') NOT NULL,
	`status` enum('pending','investigating','resolved','closed') NOT NULL DEFAULT 'pending',
	`riderId` int,
	`customerId` int,
	`orderId` int,
	`thirdPartyName` varchar(200),
	`thirdPartyContact` varchar(100),
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(500),
	`latitude` varchar(50),
	`longitude` varchar(50),
	`incidentDate` timestamp NOT NULL,
	`insuranceClaimNumber` varchar(100),
	`claimStatus` enum('not_filed','filed','approved','denied','settled') DEFAULT 'not_filed',
	`claimAmount` int,
	`liabilityAssessment` text,
	`photoUrls` text,
	`witnessStatements` text,
	`policeReportNumber` varchar(100),
	`resolutionNotes` text,
	`compensationAmount` int,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`reportedBy` int,
	`assignedTo` int,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`alertType` enum('low_stock','out_of_stock','overstocked') NOT NULL,
	`threshold` int NOT NULL,
	`currentStock` int NOT NULL,
	`severity` enum('critical','warning','info') NOT NULL,
	`status` enum('active','resolved','dismissed') NOT NULL DEFAULT 'active',
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryThresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`lowStockThreshold` int NOT NULL,
	`criticalStockThreshold` int NOT NULL,
	`overstockThreshold` int,
	`autoReorder` int NOT NULL DEFAULT 0,
	`reorderQuantity` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryThresholds_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventoryThresholds_productId_unique` UNIQUE(`productId`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(50) NOT NULL,
	`nativeName` varchar(50) NOT NULL,
	`isRTL` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`),
	CONSTRAINT `languages_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `liveDashboardEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('order_created','order_assigned','order_picked_up','order_delivered','rider_online','rider_offline','rider_location_update','payment_completed','issue_reported') NOT NULL,
	`entityId` int NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`eventData` text,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `liveDashboardEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyPointsTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionType` enum('earned','redeemed','expired','bonus','adjustment','refund') NOT NULL,
	`points` int NOT NULL,
	`orderId` int,
	`description` text,
	`balanceBefore` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`expiresAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyPointsTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyRedemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rewardId` int NOT NULL,
	`pointsSpent` int NOT NULL,
	`status` enum('pending','approved','used','expired','cancelled') NOT NULL DEFAULT 'pending',
	`redemptionCode` varchar(50),
	`usedAt` timestamp,
	`expiresAt` timestamp,
	`orderId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyRedemptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyRedemptions_redemptionCode_unique` UNIQUE(`redemptionCode`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`pointsCost` int NOT NULL,
	`rewardType` enum('discount_coupon','free_delivery','cashback','product','service') NOT NULL,
	`rewardValue` int,
	`imageUrl` varchar(500),
	`stock` int,
	`minTierRequired` int,
	`isActive` int NOT NULL DEFAULT 1,
	`validityDays` int NOT NULL DEFAULT 30,
	`termsAndConditions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`minPoints` int NOT NULL,
	`maxPoints` int,
	`discountPercentage` int NOT NULL DEFAULT 0,
	`pointsMultiplier` int NOT NULL DEFAULT 100,
	`benefits` text,
	`icon` varchar(100),
	`color` varchar(20),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyTiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyTiers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `mobileTrainingSync` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`deviceId` varchar(100) NOT NULL,
	`syncType` enum('progress','quiz_answers','completion','certificate') NOT NULL,
	`moduleId` int NOT NULL,
	`data` text NOT NULL,
	`syncStatus` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`syncedAt` timestamp,
	`errorMessage` text,
	`offlineTimestamp` timestamp NOT NULL,
	`onlineTimestamp` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mobileTrainingSync_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderEditHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`editedBy` int NOT NULL,
	`fieldChanged` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderEditHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`previousStatus` varchar(50),
	`newStatus` varchar(50) NOT NULL,
	`changedBy` int,
	`changedByType` enum('admin','rider','system') NOT NULL DEFAULT 'admin',
	`riderId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformStatistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`activeUsers` int NOT NULL DEFAULT 0,
	`concurrentOrders` int NOT NULL DEFAULT 0,
	`availableRiders` int NOT NULL DEFAULT 0,
	`busyRiders` int NOT NULL DEFAULT 0,
	`offlineRiders` int NOT NULL DEFAULT 0,
	`avgResponseTime` int NOT NULL DEFAULT 0,
	`errorRate` int NOT NULL DEFAULT 0,
	`systemUptime` int NOT NULL DEFAULT 0,
	`apiCallVolume` int NOT NULL DEFAULT 0,
	`databaseConnections` int NOT NULL DEFAULT 0,
	`memoryUsage` int NOT NULL DEFAULT 0,
	`cpuUsage` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platformStatistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realtimeNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`message` text NOT NULL,
	`type` enum('incident','feedback','training','order','system','alert','info') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`recipientId` int,
	`recipientType` enum('admin','rider','user','seller','all') NOT NULL DEFAULT 'admin',
	`channel` varchar(100),
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`deliveryStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`actionUrl` varchar(500),
	`actionLabel` varchar(100),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `realtimeNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tier` enum('bronze','silver','gold','platinum') NOT NULL,
	`referrerReward` int NOT NULL,
	`referredReward` int NOT NULL,
	`minOrderValue` int NOT NULL DEFAULT 0,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralRewards_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralRewards_tier_unique` UNIQUE(`tier`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerUserId` int NOT NULL,
	`referredUserId` int,
	`referralCode` varchar(50) NOT NULL,
	`status` enum('pending','completed','expired','cancelled') NOT NULL DEFAULT 'pending',
	`rewardTier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`rewardAmount` int NOT NULL DEFAULT 0,
	`rewardStatus` enum('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
	`referredUserEmail` varchar(320),
	`referredUserPhone` varchar(20),
	`completedAt` timestamp,
	`rewardPaidAt` timestamp,
	`expiresAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `regionalAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regionId` int NOT NULL,
	`period` enum('day','week','month','year') NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`totalOrders` int NOT NULL DEFAULT 0,
	`totalRevenue` int NOT NULL DEFAULT 0,
	`activeUsers` int NOT NULL DEFAULT 0,
	`activeRiders` int NOT NULL DEFAULT 0,
	`avgDeliveryTime` int,
	`orderDensity` int NOT NULL DEFAULT 0,
	`customerSatisfaction` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regionalAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportExecutionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int,
	`scheduledReportId` int,
	`executedBy` int,
	`executionType` enum('manual','scheduled') NOT NULL,
	`status` enum('success','failed','in_progress') NOT NULL,
	`recordCount` int,
	`fileUrl` varchar(500),
	`fileSize` int,
	`format` enum('pdf','excel','csv') NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`duration` int,
	`errorMessage` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportExecutionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`achievementType` enum('top_performer','fast_delivery','customer_favorite','quality_champion','consistency_king','milestone_100','milestone_500','milestone_1000') NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` text,
	CONSTRAINT `riderAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`availabilityDate` timestamp NOT NULL,
	`availabilityType` enum('available','unavailable','preferred','maybe') NOT NULL,
	`timeSlots` text,
	`startTime` varchar(10),
	`endTime` varchar(10),
	`reason` enum('vacation','sick','personal','other','none') DEFAULT 'none',
	`notes` text,
	`isRecurring` int NOT NULL DEFAULT 0,
	`recurringPattern` varchar(100),
	`recurringEndDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderAvailability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`badgeId` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`earnedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderEarningsTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	`transactionType` enum('delivery_fee','tip','bonus','penalty','adjustment','refund') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XAF',
	`orderId` int,
	`shiftId` int,
	`description` varchar(500) NOT NULL,
	`category` varchar(100),
	`status` enum('pending','approved','paid','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`payoutId` int,
	`paidAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderEarningsTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`orderId` int,
	`latitude` varchar(20) NOT NULL,
	`longitude` varchar(20) NOT NULL,
	`status` enum('idle','en_route_pickup','en_route_delivery','offline') NOT NULL DEFAULT 'idle',
	`speed` int DEFAULT 0,
	`heading` int DEFAULT 0,
	`accuracy` int DEFAULT 0,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderPayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`payoutDate` timestamp NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`totalEarnings` int NOT NULL,
	`deductions` int NOT NULL DEFAULT 0,
	`bonuses` int NOT NULL DEFAULT 0,
	`netAmount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XAF',
	`paymentMethod` enum('bank_transfer','mobile_money','cash','wallet') NOT NULL,
	`paymentAccount` varchar(255),
	`paymentReference` varchar(255),
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`processedBy` int,
	`processedAt` timestamp,
	`failureReason` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastRetryAt` timestamp,
	`receiptUrl` varchar(500),
	`receiptNumber` varchar(100),
	`transactionIds` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderPayouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderShifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`shiftDate` timestamp NOT NULL,
	`shiftType` enum('morning','afternoon','evening','night','split','full_day') NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`assignedBy` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('scheduled','confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
	`confirmedAt` timestamp,
	`zone` varchar(100),
	`location` varchar(255),
	`notes` text,
	`cancellationReason` text,
	`isRecurring` int NOT NULL DEFAULT 0,
	`recurringPattern` varchar(100),
	`recurringGroupId` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderShifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderTierHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`previousTier` enum('platinum','gold','silver','bronze','rookie'),
	`newTier` enum('platinum','gold','silver','bronze','rookie') NOT NULL,
	`performanceScore` int NOT NULL,
	`promotionDate` timestamp NOT NULL DEFAULT (now()),
	`notificationSent` int NOT NULL DEFAULT 0,
	`notificationSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `riderTierHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riderTrainingProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`moduleId` int NOT NULL,
	`status` enum('not_started','in_progress','completed','failed') NOT NULL DEFAULT 'not_started',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`quizAttempts` int NOT NULL DEFAULT 0,
	`lastQuizScore` int,
	`bestQuizScore` int,
	`quizAnswers` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`lastAccessedAt` timestamp,
	`certificateIssued` int NOT NULL DEFAULT 0,
	`certificateNumber` varchar(100),
	`certificateIssuedAt` timestamp,
	`certificateExpiresAt` timestamp,
	`timeSpent` int NOT NULL DEFAULT 0,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riderTrainingProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `riderTrainingProgress_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `shiftSwaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterId` int NOT NULL,
	`requesterShiftId` int NOT NULL,
	`targetRiderId` int,
	`targetShiftId` int,
	`requestType` enum('swap','give_up','take_over') NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shiftSwaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`settingType` enum('string','number','boolean','json') NOT NULL,
	`category` enum('general','payment','delivery','notification','security','api','feature_flags') NOT NULL,
	`description` text,
	`isPublic` int NOT NULL DEFAULT 0,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `trainingModules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`category` enum('safety','customer_service','app_usage','quality_photos','delivery_procedures','compliance','maintenance') NOT NULL,
	`contentType` enum('video','document','interactive','quiz') NOT NULL,
	`contentUrl` varchar(500),
	`duration` int,
	`isMandatory` int NOT NULL DEFAULT 0,
	`prerequisiteModuleId` int,
	`minPassingScore` int NOT NULL DEFAULT 70,
	`certificateTemplate` varchar(500),
	`certificateValidityDays` int,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`version` varchar(20) NOT NULL DEFAULT '1.0',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingModules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingQuizQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','true_false','short_answer') NOT NULL,
	`options` text,
	`correctAnswer` text,
	`explanation` text,
	`points` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingQuizQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`languageCode` varchar(10) NOT NULL,
	`namespace` varchar(50) NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userLoyaltyPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentPoints` int NOT NULL DEFAULT 0,
	`lifetimePoints` int NOT NULL DEFAULT 0,
	`currentTierId` int,
	`tierAchievedAt` timestamp,
	`pointsToNextTier` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLoyaltyPoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `userLoyaltyPoints_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `verificationRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userType` enum('customer','seller','rider') NOT NULL,
	`documentType` enum('national_id','drivers_license','business_license','tax_certificate','bank_statement') NOT NULL,
	`documentUrl` varchar(500) NOT NULL,
	`additionalDocuments` text,
	`status` enum('pending','approved','rejected','more_info_needed') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`rejectionReason` text,
	`notes` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verificationRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `scheduledReports` MODIFY COLUMN `name` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduledReports` MODIFY COLUMN `frequency` enum('daily','weekly','monthly','quarterly') NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduledReports` MODIFY COLUMN `format` enum('pdf','excel','csv') NOT NULL DEFAULT 'pdf';--> statement-breakpoint
ALTER TABLE `scheduledReports` MODIFY COLUMN `isActive` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD `scheduleTime` varchar(10);--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD `timezone` varchar(50) DEFAULT 'Africa/Douala';--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD `subject` varchar(300);--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD `message` text;--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD `lastStatus` enum('success','failed','pending');--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD `errorMessage` text;--> statement-breakpoint
ALTER TABLE `scheduledReports` DROP COLUMN `time`;