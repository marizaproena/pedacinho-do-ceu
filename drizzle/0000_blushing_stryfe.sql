CREATE TABLE `customers` (
	`phone` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`token` text NOT NULL,
	`phone` text NOT NULL,
	`name` text NOT NULL,
	`created` text NOT NULL,
	`status` text NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`subtotal` integer NOT NULL,
	`fee` integer,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_key_unique` ON `orders` (`request_key`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
