CREATE TABLE `elec` (
	`timestamp` integer NOT NULL,
	`room_id` integer NOT NULL,
	`power` real NOT NULL,
	PRIMARY KEY(`timestamp`, `room_id`)
);
--> statement-breakpoint
CREATE INDEX `time_room_idx` ON `elec` (`timestamp`,`room_id`);--> statement-breakpoint
CREATE TABLE `subscribe` (
	`room_id` integer NOT NULL,
	`user` text NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `webpush`(`user`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `room_idx` ON `subscribe` (`room_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `subscribe` (`user`);--> statement-breakpoint
CREATE TABLE `webpush` (
	`user` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`expiration_time` integer,
	`keys_auth` text NOT NULL,
	`keys_p256dh` text NOT NULL
);
