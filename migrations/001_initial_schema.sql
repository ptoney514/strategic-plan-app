-- Initial schema setup for Strategic Plan Builder
-- Creates the base tables with spb_ prefix

-- Create districts table
CREATE TABLE IF NOT EXISTS public.spb_districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#0099CC',
    secondary_color VARCHAR(7) DEFAULT '#51d01b',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_email VARCHAR,
    is_public BOOLEAN DEFAULT true
);

-- Create goals table with hierarchical structure
CREATE TABLE IF NOT EXISTS public.spb_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    goal_number VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 0,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS public.spb_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    metric_type VARCHAR CHECK (metric_type IN ('percent', 'number', 'rating', 'currency', 'status', 'narrative', 'link')) DEFAULT 'percent',
    data_source VARCHAR CHECK (data_source IN ('survey', 'map_data', 'state_testing', 'total_number', 'percent', 'narrative', 'link')) DEFAULT 'survey',
    current_value DECIMAL,
    target_value DECIMAL,
    unit VARCHAR,
    status VARCHAR CHECK (status IN ('on-target', 'near-target', 'off-target')),
    chart_type VARCHAR DEFAULT 'bar',
    display_options TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON public.spb_goals(parent_id);
CREATE INDEX IF NOT EXISTS idx_goals_level ON public.spb_goals(level);
CREATE INDEX IF NOT EXISTS idx_goals_goal_number ON public.spb_goals(goal_number);
CREATE INDEX IF NOT EXISTS idx_goals_district_id ON public.spb_goals(district_id);
CREATE INDEX IF NOT EXISTS idx_metrics_goal_id ON public.spb_metrics(goal_id);
CREATE INDEX IF NOT EXISTS idx_districts_slug ON public.spb_districts(slug);

-- Enable RLS
ALTER TABLE public.spb_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_metrics ENABLE ROW LEVEL SECURITY;

-- Create development policies (permissive for now)
CREATE POLICY "Enable all access for development" ON public.spb_districts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_metrics FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon role
GRANT ALL ON public.spb_districts TO anon;
GRANT ALL ON public.spb_goals TO anon;
GRANT ALL ON public.spb_metrics TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;