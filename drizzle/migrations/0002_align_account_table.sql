-- Align account table with Better Auth 1.4.x expected columns.
-- The actual DB was already modified by Better Auth at runtime;
-- this migration makes Drizzle aware of the real column layout.

ALTER TABLE "account" RENAME COLUMN "provider" TO "provider_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "provider_account_id" TO "account_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "expires_at" TO "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
