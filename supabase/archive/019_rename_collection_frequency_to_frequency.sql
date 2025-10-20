-- Migration 019: Rename collection_frequency to frequency
-- Fixes issue #2: Schema mismatch between TypeScript (frequency) and database (collection_frequency)
--
-- Background:
-- The TypeScript interface uses 'frequency' but the database column is named 'collection_frequency'
-- This causes "Could not find the 'frequency' column" errors when saving metrics
--
-- Solution:
-- Rename the column to match the TypeScript interface and simplify the schema

-- Rename the column
ALTER TABLE public.spb_metrics
RENAME COLUMN collection_frequency TO frequency;

-- Update the constraint to reference the new column name
ALTER TABLE public.spb_metrics
DROP CONSTRAINT IF EXISTS spb_metrics_collection_frequency_check;

ALTER TABLE public.spb_metrics
ADD CONSTRAINT spb_metrics_frequency_check
CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually'));

-- Drop old index and create new one with updated name
DROP INDEX IF EXISTS idx_spb_metrics_frequency;
CREATE INDEX idx_spb_metrics_frequency ON public.spb_metrics(frequency);

-- Verify the change
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'spb_metrics'
  AND table_schema = 'public'
  AND column_name = 'frequency';

-- Success message
SELECT 'Migration 019: Successfully renamed collection_frequency to frequency' as message;
