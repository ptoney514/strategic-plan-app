-- Align account table with Better Auth 1.4.x expected columns.
-- The actual DB may already have been modified by Better Auth at runtime,
-- so all renames are guarded to succeed on both old and updated schemas.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'account' AND column_name = 'provider') THEN
    ALTER TABLE "account" RENAME COLUMN "provider" TO "provider_id";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'account' AND column_name = 'provider_account_id') THEN
    ALTER TABLE "account" RENAME COLUMN "provider_account_id" TO "account_id";
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'account' AND column_name = 'expires_at') THEN
    ALTER TABLE "account" RENAME COLUMN "expires_at" TO "access_token_expires_at";
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
