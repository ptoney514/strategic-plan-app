-- Migration: Add contact form submissions table
-- Purpose: Store contact form submissions from the marketing landing page

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS spb_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  topic TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on created_at for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON spb_contact_submissions(created_at DESC);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON spb_contact_submissions(status);

-- Enable RLS
ALTER TABLE spb_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can submit contact form" ON spb_contact_submissions;
DROP POLICY IF EXISTS "System admins can view contact submissions" ON spb_contact_submissions;
DROP POLICY IF EXISTS "System admins can update contact submissions" ON spb_contact_submissions;
DROP POLICY IF EXISTS "System admins can delete contact submissions" ON spb_contact_submissions;

-- Policy: Allow anonymous users to INSERT (submit contact forms)
CREATE POLICY "Anyone can submit contact form"
  ON spb_contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only system admins can view submissions (using JWT role check)
CREATE POLICY "System admins can view contact submissions"
  ON spb_contact_submissions
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- Policy: Only system admins can update submissions (e.g., mark as contacted)
CREATE POLICY "System admins can update contact submissions"
  ON spb_contact_submissions
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- Policy: Only system admins can delete submissions
CREATE POLICY "System admins can delete contact submissions"
  ON spb_contact_submissions
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'system_admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'system_admin'
  );

-- Add comment for documentation
COMMENT ON TABLE spb_contact_submissions IS 'Stores contact form submissions from the marketing landing page';
