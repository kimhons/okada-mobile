-- Custom SQL migration file, put your code below! --

-- Add languages table for multi-language support
CREATE TABLE IF NOT EXISTS `languages` (
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

-- Add translations table for storing translated strings
CREATE TABLE IF NOT EXISTS `translations` (
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

-- Add indexes for translations table
CREATE UNIQUE INDEX `idx_translations_unique` ON `translations` (`languageCode`, `namespace`, `key`);
CREATE INDEX `idx_translations_language` ON `translations` (`languageCode`);
CREATE INDEX `idx_translations_namespace` ON `translations` (`namespace`);