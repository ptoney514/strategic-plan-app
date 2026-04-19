-- v4 public dashboard schema reconcile (design.md §5.3, §5.7, §5.8, §5.13, §6.2)
-- Adds per-goal narrative, per-objective pull quote + highlight stats + signature-metric
-- pointer, and locks goals.status to the design's allowed set via a CHECK constraint.
-- Statement-breakpoint'd so drizzle-kit migrate can run each piece independently.

-- 1. Per-goal narrative text (expanded Pattern A row green-tinted callout — any level)
ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "narrative" text;--> statement-breakpoint

-- 2. Per-objective pull quote (design.md §5.13 — intended for level-0 rows)
ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "pull_quote_text" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "pull_quote_attribution" varchar(255);--> statement-breakpoint

-- 3. 3-up stat callouts under the left narrative column (design.md §6.2 "47 · 124 · 4.1/5")
--    Shape: jsonb array of { label: text, value: text|number, unit?: text }.
--    Kept on the goal row so an objective fetch returns it in one round trip.
ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "highlight_stats" jsonb;--> statement-breakpoint

-- 4. Signature metric pointer (design.md §5.7 right-column hero card).
--    FK to widgets so we render an existing widget as the signature card. ON DELETE SET NULL
--    so deleting the underlying widget doesn't cascade-delete the goal.
ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "signature_widget_id" uuid;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goals_signature_widget_id_widgets_id_fk'
  ) THEN
    ALTER TABLE "goals"
      ADD CONSTRAINT "goals_signature_widget_id_widgets_id_fk"
      FOREIGN KEY ("signature_widget_id") REFERENCES "public"."widgets"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goals_signature_widget_id_idx" ON "goals" USING btree ("signature_widget_id");--> statement-breakpoint

-- 5. Lock goals.status to the design.md §5.3 allowed set.
--    First, re-map legacy values so the CHECK constraint can be applied without NOT VALID.
--      completed → complete   (design uses "complete"; see §5.3 chip table)
--      on_hold   → in_progress (closest design-set analog for paused work)
--    Any other stray values (historical free-form text) are coerced to not_started as a safety net.
UPDATE "goals" SET "status" = 'complete' WHERE "status" = 'completed';--> statement-breakpoint
UPDATE "goals" SET "status" = 'in_progress' WHERE "status" = 'on_hold';--> statement-breakpoint
UPDATE "goals" SET "status" = 'not_started'
  WHERE "status" IS NULL
     OR "status" NOT IN ('on_track','in_progress','off_track','complete','not_started');--> statement-breakpoint

-- Drop any prior incarnation of this constraint so re-runs don't trip.
ALTER TABLE "goals" DROP CONSTRAINT IF EXISTS "goals_status_check";--> statement-breakpoint
ALTER TABLE "goals"
  ADD CONSTRAINT "goals_status_check"
  CHECK ("status" IN ('on_track','in_progress','off_track','complete','not_started'));
