-- Enhanced Time-Series Metrics Support for Strategic Plan Vite
-- Adds support for quarterly/monthly/annual tracking with actual vs target values

-- Create a table for time-series metric data
CREATE TABLE IF NOT EXISTS public.spb_metric_time_series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- '2024', '2024-Q1', '2024-01', etc.
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('annual', 'quarterly', 'monthly')),
    target_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('on-target', 'off-target', 'critical', 'no-data')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    UNIQUE(metric_id, period)
);

-- Add additional columns to spb_metrics for enhanced tracking
ALTER TABLE public.spb_metrics 
ADD COLUMN IF NOT EXISTS metric_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN IF NOT EXISTS aggregation_method VARCHAR(20) DEFAULT 'average' CHECK (aggregation_method IN ('average', 'sum', 'latest', 'max', 'min')),
ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS is_percentage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_higher_better BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ytd_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS eoy_projection DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_actual_period VARCHAR(20),
ADD COLUMN IF NOT EXISTS risk_threshold_critical DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS risk_threshold_warning DECIMAL(10,2);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metric_time_series_metric_id ON public.spb_metric_time_series(metric_id);
CREATE INDEX IF NOT EXISTS idx_metric_time_series_district_id ON public.spb_metric_time_series(district_id);
CREATE INDEX IF NOT EXISTS idx_metric_time_series_period ON public.spb_metric_time_series(period);
CREATE INDEX IF NOT EXISTS idx_metric_time_series_period_type ON public.spb_metric_time_series(period_type);
CREATE INDEX IF NOT EXISTS idx_metric_time_series_status ON public.spb_metric_time_series(status);

-- Enable RLS
ALTER TABLE public.spb_metric_time_series ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
CREATE POLICY "Enable all access for development" 
ON public.spb_metric_time_series FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.spb_metric_time_series TO anon, authenticated;

-- Function to calculate YTD average
CREATE OR REPLACE FUNCTION calculate_ytd_average(
    p_metric_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
) RETURNS DECIMAL AS $$
DECLARE
    ytd_avg DECIMAL;
BEGIN
    SELECT AVG(actual_value) INTO ytd_avg
    FROM spb_metric_time_series
    WHERE metric_id = p_metric_id
    AND period LIKE p_year::TEXT || '%'
    AND actual_value IS NOT NULL;
    
    RETURN COALESCE(ytd_avg, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate EOY projection based on current trend
CREATE OR REPLACE FUNCTION calculate_eoy_projection(
    p_metric_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
) RETURNS DECIMAL AS $$
DECLARE
    current_avg DECIMAL;
    periods_with_data INTEGER;
    total_periods INTEGER;
    frequency VARCHAR(20);
    projection DECIMAL;
BEGIN
    -- Get metric frequency
    SELECT m.frequency INTO frequency
    FROM spb_metrics m
    WHERE m.id = p_metric_id;
    
    -- Determine total periods based on frequency
    CASE frequency
        WHEN 'monthly' THEN total_periods := 12;
        WHEN 'quarterly' THEN total_periods := 4;
        WHEN 'yearly' THEN total_periods := 1;
        ELSE total_periods := 12; -- Default to monthly
    END CASE;
    
    -- Get current average and count of periods with data
    SELECT AVG(actual_value), COUNT(*) 
    INTO current_avg, periods_with_data
    FROM spb_metric_time_series
    WHERE metric_id = p_metric_id
    AND period LIKE p_year::TEXT || '%'
    AND actual_value IS NOT NULL;
    
    -- If we have data, project based on current trend
    IF periods_with_data > 0 AND current_avg IS NOT NULL THEN
        -- Simple projection: current average maintained for remaining periods
        projection := current_avg;
    ELSE
        projection := NULL;
    END IF;
    
    RETURN projection;
END;
$$ LANGUAGE plpgsql;

-- Function to get the latest actual value and period
CREATE OR REPLACE FUNCTION get_latest_actual(
    p_metric_id UUID
) RETURNS TABLE(value DECIMAL, period VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT actual_value, period
    FROM spb_metric_time_series
    WHERE metric_id = p_metric_id
    AND actual_value IS NOT NULL
    ORDER BY 
        CASE 
            WHEN period_type = 'annual' THEN period || '-12-31'
            WHEN period_type = 'quarterly' THEN 
                CASE 
                    WHEN period LIKE '%-Q1' THEN SUBSTRING(period, 1, 4) || '-03-31'
                    WHEN period LIKE '%-Q2' THEN SUBSTRING(period, 1, 4) || '-06-30'
                    WHEN period LIKE '%-Q3' THEN SUBSTRING(period, 1, 4) || '-09-30'
                    WHEN period LIKE '%-Q4' THEN SUBSTRING(period, 1, 4) || '-12-31'
                END
            WHEN period_type = 'monthly' THEN period || '-01'
        END::DATE DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metric's YTD and EOY values when time series data changes
CREATE OR REPLACE FUNCTION update_metric_aggregates()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER;
    ytd_val DECIMAL;
    eoy_val DECIMAL;
    latest_period VARCHAR;
    latest_val DECIMAL;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Calculate YTD average
    ytd_val := calculate_ytd_average(NEW.metric_id, current_year);
    
    -- Calculate EOY projection
    eoy_val := calculate_eoy_projection(NEW.metric_id, current_year);
    
    -- Get latest actual
    SELECT value, period INTO latest_val, latest_period
    FROM get_latest_actual(NEW.metric_id);
    
    -- Update the metric with aggregated values
    UPDATE spb_metrics
    SET 
        ytd_value = ytd_val,
        eoy_projection = eoy_val,
        current_value = COALESCE(latest_val, current_value),
        last_actual_period = latest_period,
        updated_at = NOW()
    WHERE id = NEW.metric_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_metric_aggregates
AFTER INSERT OR UPDATE ON spb_metric_time_series
FOR EACH ROW
EXECUTE FUNCTION update_metric_aggregates();

-- Sample data structure comment
COMMENT ON TABLE public.spb_metric_time_series IS 'Time-series data for metrics tracking actual vs target values over time periods';
COMMENT ON COLUMN public.spb_metric_time_series.period IS 'Time period identifier (e.g., 2024 for annual, 2024-Q1 for quarterly, 2024-01 for monthly)';
COMMENT ON COLUMN public.spb_metric_time_series.period_type IS 'Type of period: annual, quarterly, or monthly';
COMMENT ON COLUMN public.spb_metrics.ytd_value IS 'Year-to-date calculated value based on aggregation method';
COMMENT ON COLUMN public.spb_metrics.eoy_projection IS 'End-of-year projection based on current trend';

SELECT 'Metric time-series migration completed successfully!' as message;