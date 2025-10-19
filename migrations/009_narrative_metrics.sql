-- Support for Narrative and Qualitative Metrics
-- Enables blog-style updates, milestones, and text-based metrics

-- Add data type classification to metrics
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS metric_data_type VARCHAR(20) DEFAULT 'quantitative'
  CHECK (metric_data_type IN ('quantitative', 'qualitative', 'mixed', 'milestone'));

-- Create table for narrative/blog-style metric updates
CREATE TABLE IF NOT EXISTS public.spb_metric_narratives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
  
  -- Narrative content
  period VARCHAR(20) NOT NULL, -- '2024-Q1', '2024-01', '2024'
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN 
    ('monthly', 'quarterly', 'annual', 'milestone', 'update')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(500), -- Brief summary for list views
  
  -- Sentiment and categorization
  sentiment VARCHAR(20) CHECK (sentiment IN 
    ('positive', 'neutral', 'negative', 'mixed')),
  status_indicator VARCHAR(20) CHECK (status_indicator IN 
    ('on-track', 'at-risk', 'off-track', 'completed', 'blocked')),
  tags TEXT[],
  category VARCHAR(50),
  
  -- Rich content support
  attachments JSONB, -- Array of {url, type, name, size}
  images JSONB, -- Array of {url, caption, alt_text}
  links JSONB, -- Array of {url, text, description}
  
  -- Metrics mentioned (for mixed type)
  related_values JSONB, -- {metric_name: value} pairs mentioned in narrative
  
  -- Author information
  author_id UUID NOT NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_role VARCHAR(50),
  
  -- Review/approval
  reviewed_by UUID,
  reviewed_by_name VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Make sure each period has only one entry per metric
  UNIQUE(metric_id, period)
);

-- Create table for milestone-based metrics
CREATE TABLE IF NOT EXISTS public.spb_metric_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  
  -- Milestone details
  milestone_date DATE NOT NULL,
  milestone_name VARCHAR(255) NOT NULL,
  milestone_description TEXT,
  milestone_type VARCHAR(50) CHECK (milestone_type IN 
    ('target', 'checkpoint', 'deliverable', 'event', 'deadline')),
  
  -- Status tracking
  is_achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  achievement_value DECIMAL(10,2), -- If there's a quantitative component
  achievement_notes TEXT,
  
  -- Evidence and documentation
  evidence_url TEXT,
  evidence_description TEXT,
  attachments JSONB,
  
  -- Dependencies and relationships
  depends_on_milestone_id UUID REFERENCES public.spb_metric_milestones(id),
  blocks_milestone_ids UUID[],
  
  -- Risk and importance
  importance VARCHAR(20) CHECK (importance IN ('critical', 'high', 'medium', 'low')),
  risk_level VARCHAR(20) CHECK (risk_level IN ('high', 'medium', 'low', 'none')),
  risk_notes TEXT,
  
  -- Ownership
  responsible_user_id UUID,
  responsible_user_name VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create table for qualitative assessments
CREATE TABLE IF NOT EXISTS public.spb_qualitative_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.spb_goals(id) ON DELETE CASCADE,
  
  -- Assessment details
  assessment_date DATE NOT NULL,
  assessment_period VARCHAR(20),
  assessment_type VARCHAR(50) CHECK (assessment_type IN 
    ('self', 'peer', 'external', 'stakeholder', 'combined')),
  
  -- Qualitative ratings
  overall_rating VARCHAR(20) CHECK (overall_rating IN 
    ('excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory')),
  progress_rating VARCHAR(20) CHECK (progress_rating IN 
    ('ahead', 'on_track', 'slightly_behind', 'significantly_behind', 'blocked')),
  
  -- Text assessments
  strengths TEXT,
  weaknesses TEXT,
  opportunities TEXT,
  threats TEXT,
  recommendations TEXT,
  action_items TEXT,
  
  -- Evidence and support
  evidence_summary TEXT,
  supporting_documents JSONB,
  
  -- Stakeholder feedback
  stakeholder_feedback JSONB, -- Array of {stakeholder, feedback, date}
  
  -- Assessment metadata
  assessed_by UUID NOT NULL,
  assessed_by_name VARCHAR(255),
  assessment_methodology TEXT,
  confidence_level VARCHAR(20),
  
  -- Review process
  peer_reviewed BOOLEAN DEFAULT false,
  peer_reviewer_id UUID,
  peer_review_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for latest narrative per metric
CREATE OR REPLACE VIEW spb_latest_narratives AS
SELECT DISTINCT ON (metric_id)
  metric_id,
  period,
  title,
  summary,
  content,
  sentiment,
  status_indicator,
  author_name,
  created_at
FROM spb_metric_narratives
WHERE is_published = true
ORDER BY metric_id, created_at DESC;

-- Function to get narrative timeline for a metric
CREATE OR REPLACE FUNCTION get_narrative_timeline(
  p_metric_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  period VARCHAR,
  title VARCHAR,
  summary VARCHAR,
  sentiment VARCHAR,
  status_indicator VARCHAR,
  author_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.period,
    n.title,
    n.summary,
    n.sentiment,
    n.status_indicator,
    n.author_name,
    n.created_at
  FROM spb_metric_narratives n
  WHERE n.metric_id = p_metric_id
    AND n.is_published = true
  ORDER BY n.period DESC, n.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to determine best visualization for a metric
CREATE OR REPLACE FUNCTION suggest_visualization_type(p_metric_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_metric_type VARCHAR;
  v_data_type VARCHAR;
  v_data_points INTEGER;
  v_has_time_series BOOLEAN;
  v_has_narratives BOOLEAN;
  v_suggestion VARCHAR;
BEGIN
  -- Get metric information
  SELECT 
    metric_type,
    metric_data_type
  INTO v_metric_type, v_data_type
  FROM spb_metrics
  WHERE id = p_metric_id;
  
  -- Count data points
  SELECT COUNT(*) INTO v_data_points
  FROM spb_metric_time_series
  WHERE metric_id = p_metric_id;
  
  -- Check for narratives
  SELECT EXISTS(
    SELECT 1 FROM spb_metric_narratives 
    WHERE metric_id = p_metric_id
  ) INTO v_has_narratives;
  
  -- Determine suggestion based on data characteristics
  v_suggestion := CASE
    -- Qualitative metrics
    WHEN v_data_type = 'qualitative' THEN 'timeline'
    WHEN v_has_narratives AND v_data_points = 0 THEN 'blog'
    
    -- Mixed metrics
    WHEN v_data_type = 'mixed' THEN 'combination'
    
    -- Milestone metrics
    WHEN v_data_type = 'milestone' THEN 'gantt'
    
    -- Single point metrics
    WHEN v_data_points = 1 AND v_metric_type = 'percent' THEN 'gauge'
    WHEN v_data_points = 1 THEN 'number'
    
    -- Time series metrics
    WHEN v_data_points > 6 THEN 'line'
    WHEN v_data_points BETWEEN 2 AND 6 THEN 'bar'
    
    -- Default
    ELSE 'auto'
  END;
  
  RETURN v_suggestion;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_narratives_metric ON public.spb_metric_narratives(metric_id);
CREATE INDEX IF NOT EXISTS idx_narratives_period ON public.spb_metric_narratives(period);
CREATE INDEX IF NOT EXISTS idx_narratives_published ON public.spb_metric_narratives(is_published);
CREATE INDEX IF NOT EXISTS idx_narratives_created ON public.spb_metric_narratives(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_milestones_metric ON public.spb_metric_milestones(metric_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON public.spb_metric_milestones(milestone_date);
CREATE INDEX IF NOT EXISTS idx_milestones_achieved ON public.spb_metric_milestones(is_achieved);

CREATE INDEX IF NOT EXISTS idx_assessments_metric ON public.spb_qualitative_assessments(metric_id);
CREATE INDEX IF NOT EXISTS idx_assessments_goal ON public.spb_qualitative_assessments(goal_id);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON public.spb_qualitative_assessments(assessment_date);

-- Grant permissions
GRANT ALL ON public.spb_metric_narratives TO anon, authenticated;
GRANT ALL ON public.spb_metric_milestones TO anon, authenticated;
GRANT ALL ON public.spb_qualitative_assessments TO anon, authenticated;
GRANT SELECT ON spb_latest_narratives TO anon, authenticated;

-- Add helpful comments
COMMENT ON TABLE public.spb_metric_narratives IS 'Blog-style narrative updates for qualitative metrics';
COMMENT ON TABLE public.spb_metric_milestones IS 'Milestone tracking for project-based metrics';
COMMENT ON TABLE public.spb_qualitative_assessments IS 'Structured qualitative assessments and SWOT analysis';
COMMENT ON VIEW spb_latest_narratives IS 'Most recent narrative for each metric';

SELECT 'Narrative and qualitative metrics support added successfully!' as message;