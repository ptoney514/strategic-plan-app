-- Comprehensive Audit Trail System
-- Tracks all changes to goals, metrics, and data points for compliance and debugging

-- Create main audit trail table
CREATE TABLE IF NOT EXISTS public.spb_audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN 
    ('goal', 'metric', 'metric_value', 'district', 'status_override', 'bulk_import')),
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN 
    ('create', 'update', 'delete', 'import', 'export', 'calculate', 'override')),
  
  -- Change details
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  change_summary TEXT,
  
  -- Context information
  user_id UUID,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  
  -- Session information
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Additional context
  reason TEXT,
  notes TEXT,
  related_entities JSONB, -- Links to other affected entities
  metadata JSONB, -- Any additional context
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Batch operation tracking
  batch_id UUID,
  batch_operation VARCHAR(100)
);

-- Create table for data entry validations
CREATE TABLE IF NOT EXISTS public.spb_data_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Value being validated
  proposed_value DECIMAL(10,2),
  previous_value DECIMAL(10,2),
  
  -- Validation results
  validation_status VARCHAR(20) CHECK (validation_status IN 
    ('passed', 'warning', 'failed', 'overridden')),
  validation_rules_applied JSONB,
  validation_messages TEXT[],
  
  -- Variance analysis
  variance_from_previous DECIMAL(10,2),
  variance_percentage DECIMAL(5,2),
  is_outlier BOOLEAN,
  outlier_severity VARCHAR(20),
  
  -- User decision
  user_action VARCHAR(20) CHECK (user_action IN 
    ('accepted', 'rejected', 'modified', 'override_with_reason')),
  override_reason TEXT,
  final_value DECIMAL(10,2),
  
  -- User info
  validated_by UUID,
  validated_by_name VARCHAR(255),
  validation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for bulk import history
CREATE TABLE IF NOT EXISTS public.spb_import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type VARCHAR(50) CHECK (import_type IN 
    ('excel', 'csv', 'api', 'manual_bulk', 'scheduled')),
  file_name VARCHAR(255),
  file_size_bytes INTEGER,
  
  -- Import statistics
  total_rows INTEGER,
  successful_rows INTEGER,
  failed_rows INTEGER,
  warning_rows INTEGER,
  
  -- Affected entities
  affected_goals UUID[],
  affected_metrics UUID[],
  
  -- Validation summary
  validation_errors JSONB,
  validation_warnings JSONB,
  
  -- Import details
  import_mapping JSONB, -- How columns were mapped
  import_config JSONB, -- Settings used for import
  
  -- Status and timing
  status VARCHAR(20) CHECK (status IN 
    ('pending', 'processing', 'completed', 'failed', 'partially_completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- User info
  imported_by UUID NOT NULL,
  imported_by_name VARCHAR(255),
  imported_by_email VARCHAR(255),
  
  -- Rollback capability
  is_reversible BOOLEAN DEFAULT true,
  rollback_data JSONB,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  rolled_back_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function for comprehensive audit logging
CREATE OR REPLACE FUNCTION audit_trail_logger()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changed_fields JSONB;
  v_user_id UUID;
  v_entity_type VARCHAR(50);
BEGIN
  -- Determine entity type from table name
  v_entity_type := CASE TG_TABLE_NAME
    WHEN 'spb_goals' THEN 'goal'
    WHEN 'spb_metrics' THEN 'metric'
    WHEN 'spb_metric_time_series' THEN 'metric_value'
    WHEN 'spb_districts' THEN 'district'
    ELSE TG_TABLE_NAME
  END;
  
  -- Get user ID from context (would be set by application)
  v_user_id := current_setting('app.current_user_id', true)::UUID;
  
  -- Handle different operations
  IF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    
    INSERT INTO spb_audit_trail (
      entity_type, entity_id, action, 
      old_value, change_summary,
      user_id, created_at
    ) VALUES (
      v_entity_type, OLD.id, 'delete',
      v_old_data::TEXT, 'Record deleted',
      v_user_id, NOW()
    );
    
    RETURN OLD;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    -- Calculate changed fields
    SELECT jsonb_object_agg(key, value)
    INTO v_changed_fields
    FROM (
      SELECT key, v_new_data->key as value
      FROM jsonb_each(v_new_data)
      WHERE v_new_data->key IS DISTINCT FROM v_old_data->key
    ) changes;
    
    -- Only log if there were actual changes
    IF v_changed_fields IS NOT NULL THEN
      INSERT INTO spb_audit_trail (
        entity_type, entity_id, action,
        old_value, new_value, change_summary,
        metadata, user_id, created_at
      ) VALUES (
        v_entity_type, NEW.id, 'update',
        v_old_data::TEXT, v_new_data::TEXT,
        'Updated fields: ' || jsonb_object_keys(v_changed_fields),
        v_changed_fields, v_user_id, NOW()
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    
    INSERT INTO spb_audit_trail (
      entity_type, entity_id, action,
      new_value, change_summary,
      user_id, created_at
    ) VALUES (
      v_entity_type, NEW.id, 'create',
      v_new_data::TEXT, 'Record created',
      v_user_id, NOW()
    );
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for main tables (optional - enable as needed)
-- Commented out by default to avoid performance impact until explicitly needed
/*
CREATE TRIGGER audit_goals
AFTER INSERT OR UPDATE OR DELETE ON public.spb_goals
FOR EACH ROW EXECUTE FUNCTION audit_trail_logger();

CREATE TRIGGER audit_metrics
AFTER INSERT OR UPDATE OR DELETE ON public.spb_metrics
FOR EACH ROW EXECUTE FUNCTION audit_trail_logger();

CREATE TRIGGER audit_metric_values
AFTER INSERT OR UPDATE OR DELETE ON public.spb_metric_time_series
FOR EACH ROW EXECUTE FUNCTION audit_trail_logger();
*/

-- Create function to get audit history for an entity
CREATE OR REPLACE FUNCTION get_entity_audit_history(
  p_entity_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  action VARCHAR,
  field_name VARCHAR,
  old_value TEXT,
  new_value TEXT,
  change_summary TEXT,
  user_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.action,
    a.field_name,
    a.old_value,
    a.new_value,
    a.change_summary,
    a.user_name,
    a.created_at
  FROM spb_audit_trail a
  WHERE a.entity_id = p_entity_id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.spb_audit_trail(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity_type ON public.spb_audit_trail(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.spb_audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.spb_audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_batch ON public.spb_audit_trail(batch_id);

CREATE INDEX IF NOT EXISTS idx_validations_metric ON public.spb_data_validations(metric_id);
CREATE INDEX IF NOT EXISTS idx_validations_date ON public.spb_data_validations(validation_date);
CREATE INDEX IF NOT EXISTS idx_validations_status ON public.spb_data_validations(validation_status);

CREATE INDEX IF NOT EXISTS idx_imports_user ON public.spb_import_history(imported_by);
CREATE INDEX IF NOT EXISTS idx_imports_created ON public.spb_import_history(created_at);
CREATE INDEX IF NOT EXISTS idx_imports_status ON public.spb_import_history(status);

-- Grant permissions
GRANT ALL ON public.spb_audit_trail TO anon, authenticated;
GRANT ALL ON public.spb_data_validations TO anon, authenticated;
GRANT ALL ON public.spb_import_history TO anon, authenticated;

-- Add helpful comments
COMMENT ON TABLE public.spb_audit_trail IS 'Comprehensive audit log of all data changes';
COMMENT ON TABLE public.spb_data_validations IS 'Record of all data validation checks and overrides';
COMMENT ON TABLE public.spb_import_history IS 'History of all bulk data imports with rollback capability';

SELECT 'Audit trail system created successfully!' as message;