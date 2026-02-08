-- Update account table to match Better Auth v2 schema
ALTER TABLE "account" RENAME COLUMN "provider" TO "provider_id";
ALTER TABLE "account" RENAME COLUMN "provider_account_id" TO "account_id";
ALTER TABLE "account" RENAME COLUMN "expires_at" TO "access_token_expires_at";
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id_token" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
