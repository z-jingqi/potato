CREATE TABLE `ai_analysis` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`collectionIds` text NOT NULL,
	`query` text NOT NULL,
	`response` text NOT NULL,
	`context` text,
	`analysisType` text,
	`model` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_analysis_userId_idx` ON `ai_analysis` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_analysis_collectionIds_idx` ON `ai_analysis` (`collectionIds`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `collections_userId_idx` ON `collections` (`userId`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`collectionId` text NOT NULL,
	`recordDate` integer NOT NULL,
	`data` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `records_collectionId_idx` ON `records` (`collectionId`);--> statement-breakpoint
CREATE INDEX `records_recordDate_idx` ON `records` (`recordDate`);