CREATE TABLE IF NOT EXISTS `service_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`request_type` text NOT NULL,
	`fulfilment` text,
	`status` text NOT NULL,
	`contact_name` text,
	`contact_email` text,
	`currency` text DEFAULT 'CAD' NOT NULL,
	`subtotal_cents` integer,
	`payload_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `service_requests_reference_uq` ON `service_requests` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `service_requests_type_idempotency_uq` ON `service_requests` (`request_type`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `service_requests_type_status_idx` ON `service_requests` (`request_type`,`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `service_requests_created_at_idx` ON `service_requests` (`created_at`);
