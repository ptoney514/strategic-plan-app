-- Migration: Create staging tables for Excel import system
-- Purpose: Allow client admins to upload, parse, review, and import Excel goal data

-- ============================================================================
-- Import Sessions - Track each upload attempt
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.spb_import_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INTEGER,
    status TEXT CHECK (status IN ('uploaded', 'parsing', 'parsed', 'mapping', 'importing', 'completed', 'failed')) DEFAULT 'uploaded',
    uploaded_by TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    import_summary JSONB, -- stats: {goals_created: X, metrics_created: Y, goals_updated: Z}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Staged Goals - Parsed Excel rows ready for review/mapping
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.spb_staged_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    import_session_id UUID NOT NULL REFERENCES public.spb_import_sessions(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    raw_data JSONB NOT NULL, -- original Excel row as JSON
    parsed_hierarchy TEXT, -- e.g., "|1.1.1|"
    goal_number TEXT,
    title TEXT,
    description TEXT,
    level INTEGER CHECK (level IN (0, 1, 2)),
    owner_name TEXT,
    department TEXT,
    validation_status TEXT CHECK (validation_status IN ('valid', 'warning', 'error')) DEFAULT 'valid',
    validation_messages TEXT[], -- ["Missing owner", "Duplicate goal number"]
    is_mapped BOOLEAN DEFAULT false,
    mapped_to_goal_id UUID REFERENCES public.spb_goals(id) ON DELETE SET NULL,
    action TEXT CHECK (action IN ('create', 'update', 'skip')) DEFAULT 'create',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Staged Metrics - Extracted metrics from Excel
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.spb_staged_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staged_goal_id UUID NOT NULL REFERENCES public.spb_staged_goals(id) ON DELETE CASCADE,
    import_session_id UUID NOT NULL REFERENCES public.spb_import_sessions(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    measure_description TEXT,
    metric_type TEXT,
    data_source TEXT,
    frequency TEXT,
    baseline_value DECIMAL,
    time_series_data JSONB, -- [{period: '2022-06', target: X, actual: Y}]
    unit TEXT,
    symbol TEXT, -- "%", "$", etc.
    validation_status TEXT CHECK (validation_status IN ('valid', 'warning', 'error')) DEFAULT 'valid',
    validation_messages TEXT[],
    is_mapped BOOLEAN DEFAULT false,
    mapped_to_metric_id UUID REFERENCES public.spb_metrics(id) ON DELETE SET NULL,
    action TEXT CHECK (action IN ('create', 'update', 'skip')) DEFAULT 'create',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_import_sessions_district ON public.spb_import_sessions(district_id);
CREATE INDEX IF NOT EXISTS idx_import_sessions_status ON public.spb_import_sessions(status);
CREATE INDEX IF NOT EXISTS idx_staged_goals_session ON public.spb_staged_goals(import_session_id);
CREATE INDEX IF NOT EXISTS idx_staged_goals_validation ON public.spb_staged_goals(validation_status);
CREATE INDEX IF NOT EXISTS idx_staged_metrics_goal ON public.spb_staged_metrics(staged_goal_id);
CREATE INDEX IF NOT EXISTS idx_staged_metrics_session ON public.spb_staged_metrics(import_session_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.spb_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_staged_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_staged_metrics ENABLE ROW LEVEL SECURITY;

-- Development policies (permissive)
CREATE POLICY "Enable all access for development" ON public.spb_import_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_staged_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_staged_metrics FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.spb_import_sessions TO anon;
GRANT ALL ON public.spb_staged_goals TO anon;
GRANT ALL ON public.spb_staged_metrics TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================
COMMENT ON TABLE public.spb_import_sessions IS 'Tracks Excel import attempts and their status';
COMMENT ON TABLE public.spb_staged_goals IS 'Parsed goal data from Excel, ready for review and mapping';
COMMENT ON TABLE public.spb_staged_metrics IS 'Parsed metric data from Excel, linked to staged goals';
COMMENT ON COLUMN public.spb_staged_goals.action IS 'What to do with this row: create new, update existing, or skip';
COMMENT ON COLUMN public.spb_staged_metrics.time_series_data IS 'Array of time-period targets/actuals extracted from Excel columns';
