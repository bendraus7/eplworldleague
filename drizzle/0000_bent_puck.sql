CREATE TABLE `player_identities` (
	`player_id` text PRIMARY KEY NOT NULL,
	`dupr_code` text NOT NULL,
	`profile_id` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `player_profiles` (
	`player_id` text PRIMARY KEY NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_cache` (
	`cache_key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`fetched_at` text NOT NULL
);
