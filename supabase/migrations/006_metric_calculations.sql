-- Enhanced Metric Calculations and Display Support
-- Adds fields for better calculation tracking and display configuration

-- Enhance metrics table with calculation and display fields
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS display_value VARCHAR(50),
ADD COLUMN IF NOT EXISTS display_label TEXT,
ADD COLUMN IF NOT EXISTS display_sublabel TEXT,
ADD COLUMN IF NOT EXISTS measurement_scale VARCHAR(100),
ADD COLUMN IF NOT EXISTS ytd_change DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS period_over_period_change DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS period_over_period_percent DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS calculation_method TEXT,
ADD COLUMN IF NOT EXISTS data_completeness DECIMAL(5,2), -- percentage of expected data points
ADD COLUMN IF NOT EXISTS confidence_level VARCHAR(20) CHECK (confidence_level IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS last_calculated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS calculation_notes TEXT,
ADD COLUMN IF NOT EXISTS is_calculated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calculation_formula TEXT,
ADD COLUMN IF NOT EXISTS visualization_type VARCHAR(50) DEFAULT 'auto'
  CHECK (visualization_type IN ('auto', 'line', 'bar', 'gauge', 'donut', 'timeline', 'blog', 'number', 'progress')),
ADD COLUMN IF NOT EXISTS visualization_config JSONB,
ADD COLUMN IF NOT EXISTS show_target_line BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_trend BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS date_range_start DATE,
ADD COLUMN IF NOT EXISTS date_range_end DATE;

-- Create table for metric calculation history
CREATE TABLE IF NOT EXISTS public.spb_metric_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculated_value DECIMAL(10,2),
  ytd_value DECIMAL(10,2),
  eoy_projection DECIMAL(10,2),
  calculation_inputs JSONB, -- Store all inputs used in calculation
  calculation_method VARCHAR(50),
  data_points_used INTEGER,
  data_points_expected INTEGER,
  confidence_score DECIMAL(5,2),
  calculation_notes TEXT,
  created_by UUID
);

-- Create table for tracking metric data sources
CREATE TABLE IF NOT EXISTS public.spb_metric_data_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) CHECK (source_type IN 
    ('manual', 'excel', 'csv', 'api', 'calculated', 'survey', 'system')),
  source_url TEXT,
  source_description TEXT,
  collection_frequency VARCHAR(50),
  last_collected_at TIMESTAMP WITH TIME ZONE,
  next_collection_due DATE,
  responsible_user UUID,
  responsible_user_name VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to calculate status from metrics
CREATE OR REPLACE FUNCTION calculate_goal_status_from_metrics(p_goal_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_status VARCHAR(20);
  v_on_target_count INTEGER;
  v_off_target_count INTEGER;
  v_critical_count INTEGER;
  v_total_metrics INTEGER;
  v_weighted_score DECIMAL(5,2);
BEGIN
  -- Count metrics by their implied status
  SELECT 
    COUNT(*) FILTER (WHERE 
      current_value >= target_value * 0.95 OR 
      (is_higher_better = false AND current_value <= target_value * 1.05)
    ) as on_target,
    COUNT(*) FILTER (WHERE 
      (current_value < target_value * 0.95 AND current_value >= target_value * 0.8) OR
      (is_higher_better = false AND current_value > target_value * 1.05 AND current_value <= target_value * 1.2)
    ) as off_target,
    COUNT(*) FILTER (WHERE 
      current_value < target_value * 0.8 OR
      (is_higher_better = false AND current_value > target_value * 1.2)
    ) as critical,
    COUNT(*) as total
  INTO v_on_target_count, v_off_target_count, v_critical_count, v_total_metrics
  FROM spb_metrics
  WHERE goal_id = p_goal_id
    AND current_value IS NOT NULL
    AND target_value IS NOT NULL;
  
  -- Calculate weighted score (critical metrics have more weight)
  IF v_total_metrics > 0 THEN
    v_weighted_score := (
      (v_on_target_count::DECIMAL * 1.0) + 
      (v_off_target_count::DECIMAL * 0.5) - 
      (v_critical_count::DECIMAL * 1.5)
    ) / v_total_metrics * 100;
    
    -- Determine status based on rules
    IF v_critical_count > 0 THEN
      v_status := 'critical';
    ELSIF v_weighted_score >= 80 THEN
      v_status := 'on-target';
    ELSIF v_weighted_score >= 60 THEN
      v_status := 'at-risk';
    ELSE
      v_status := 'off-target';
    END IF;
  ELSE
    v_status := 'not-started';
  END IF;
  
  -- Update the goal's calculated status
  UPDATE spb_goals
  SET 
    calculated_status = v_status,
    status_calculation_confidence = CASE 
      WHEN v_total_metrics >= 3 THEN 90
      WHEN v_total_metrics >= 1 THEN 70
      ELSE 30
    END,
    status_last_calculated = NOW()
  WHERE id = p_goal_id;
  
  RETURN v_status;
END;
$$ LANGUAGE plpgsql;

-- Create function to update metric display values
CREATE OR REPLACE FUNCTION update_metric_display_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Format display value based on metric type
  NEW.display_value := CASE
    WHEN NEW.metric_type = 'percent' THEN 
      CONCAT(ROUND(NEW.current_value, 1)::TEXT, '%')
    WHEN NEW.metric_type = 'currency' THEN 
      CONCAT('$', TO_CHAR(NEW.current_value, 'FM999,999,990.00'))
    WHEN NEW.metric_type = 'rating' THEN 
      CONCAT(ROUND(NEW.current_value, 2)::TEXT, '/5')
    ELSE 
      ROUND(NEW.current_value, 2)::TEXT
  END;
  
  -- Calculate period over period change
  IF OLD.current_value IS NOT NULL AND OLD.current_value > 0 THEN
    NEW.period_over_period_change := NEW.current_value - OLD.current_value;
    NEW.period_over_period_percent := 
      ((NEW.current_value - OLD.current_value) / OLD.current_value * 100);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic display value updates
DROP TRIGGER IF EXISTS trigger_update_metric_display ON public.spb_metrics;
CREATE TRIGGER trigger_update_metric_display
BEFORE INSERT OR UPDATE ON public.spb_metrics
FOR EACH ROW
EXECUTE FUNCTION update_metric_display_value();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_goal_id ON public.spb_metrics(goal_id);
CREATE INDEX IF NOT EXISTS idx_metrics_visualization ON public.spb_metrics(visualization_type);
CREATE INDEX IF NOT EXISTS idx_calculations_metric ON public.spb_metric_calculations(metric_id);
CREATE INDEX IF NOT EXISTS idx_calculations_date ON public.spb_metric_calculations(calculation_date);
CREATE INDEX IF NOT EXISTS idx_data_sources_metric ON public.spb_metric_data_sources(metric_id);

-- Grant permissions
GRANT ALL ON public.spb_metric_calculations TO anon, authenticated;
GRANT ALL ON public.spb_metric_data_sources TO anon, authenticated;

-- Add helpful comments
COMMENT ON COLUMN public.spb_metrics.display_value IS 'Formatted value for display (e.g., "87%", "$1.5M")';
COMMENT ON COLUMN public.spb_metrics.visualization_type IS 'Preferred visualization type (auto will use smart selection)';
COMMENT ON COLUMN public.spb_metrics.calculation_formula IS 'Human-readable formula explaining the calculation';
COMMENT ON TABLE public.spb_metric_calculations IS 'History of all metric calculations for audit and debugging';

SELECT 'Enhanced metric calculation support added successfully!' as message;