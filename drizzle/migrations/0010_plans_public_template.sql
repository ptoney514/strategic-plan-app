-- Phase 4 template system: per-plan public-facing template selector.
-- Each plan picks which public surface layout to render at /district/[slug].
-- Default 'sidebar-tree' preserves today's left-sidebar drill-down behavior for every
-- existing plan. 'editorial-onepager' is the new long-scroll editorial layout added in
-- Phase 4. Future templates extend the CHECK constraint.

-- 1. Add the column, default backfills all existing rows with 'sidebar-tree'.
ALTER TABLE "plans"
  ADD COLUMN IF NOT EXISTS "public_template" varchar(64) DEFAULT 'sidebar-tree' NOT NULL;--> statement-breakpoint

-- 2. Lock to known template ids. Drop-then-add so re-runs are idempotent.
ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_public_template_check";--> statement-breakpoint
ALTER TABLE "plans"
  ADD CONSTRAINT "plans_public_template_check"
  CHECK ("public_template" IN ('sidebar-tree', 'editorial-onepager'));
