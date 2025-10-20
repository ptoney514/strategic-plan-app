
\restrict kjgFm75z1brxBKR1Bgtg0lQU6mO2PKFXpqwnYrlgCrevmbHU2aNav3hqBhWLMrm


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."audit_trail_logger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."audit_trail_logger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_eoy_projection"("p_metric_id" "uuid", "p_year" integer DEFAULT EXTRACT(year FROM CURRENT_DATE)) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."calculate_eoy_projection"("p_metric_id" "uuid", "p_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_goal_status_from_metrics"("p_goal_id" "uuid") RETURNS character varying
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."calculate_goal_status_from_metrics"("p_goal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_ytd_average"("p_metric_id" "uuid", "p_year" integer DEFAULT EXTRACT(year FROM CURRENT_DATE)) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."calculate_ytd_average"("p_metric_id" "uuid", "p_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_entity_audit_history"("p_entity_id" "uuid", "p_limit" integer DEFAULT 50) RETURNS TABLE("action" character varying, "field_name" character varying, "old_value" "text", "new_value" "text", "change_summary" "text", "user_name" character varying, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_entity_audit_history"("p_entity_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_actual"("p_metric_id" "uuid") RETURNS TABLE("value" numeric, "period" character varying)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_latest_actual"("p_metric_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_narrative_timeline"("p_metric_id" "uuid", "p_limit" integer DEFAULT 10) RETURNS TABLE("period" character varying, "title" character varying, "summary" character varying, "sentiment" character varying, "status_indicator" character varying, "author_name" character varying, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_narrative_timeline"("p_metric_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."suggest_visualization_type"("p_metric_id" "uuid") RETURNS character varying
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."suggest_visualization_type"("p_metric_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- If this is a manual override
    IF NEW.status_source = 'manual' THEN
      INSERT INTO spb_status_overrides (
        goal_id,
        previous_status,
        new_status,
        calculated_status,
        override_reason,
        created_by,
        created_at,
        expires_at
      ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        NEW.calculated_status,
        NEW.status_override_reason,
        NEW.status_override_by,
        NOW(),
        NEW.status_override_expires
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_metric_aggregates"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_metric_aggregates"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_metric_display_value"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
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
$_$;


ALTER FUNCTION "public"."update_metric_display_value"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."spb_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "goal_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "metric_type" character varying DEFAULT 'percent'::character varying,
    "data_source" character varying DEFAULT 'survey'::character varying,
    "current_value" numeric,
    "target_value" numeric,
    "unit" character varying,
    "status" character varying,
    "chart_type" character varying DEFAULT 'bar'::character varying,
    "display_options" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metric_name" character varying(255),
    "frequency" character varying(20) DEFAULT 'monthly'::character varying,
    "aggregation_method" character varying(20) DEFAULT 'average'::character varying,
    "decimal_places" integer DEFAULT 2,
    "is_percentage" boolean DEFAULT false,
    "is_higher_better" boolean DEFAULT true,
    "ytd_value" numeric(10,2),
    "eoy_projection" numeric(10,2),
    "last_actual_period" character varying(20),
    "risk_threshold_critical" numeric(10,2),
    "risk_threshold_warning" numeric(10,2),
    "description" "text",
    "metric_category" character varying(50) DEFAULT 'other'::character varying,
    "risk_threshold_off_target" numeric(10,4),
    "collection_frequency" character varying(20) DEFAULT 'quarterly'::character varying,
    "baseline_value" numeric(10,4),
    "trend_direction" character varying(20) DEFAULT 'stable'::character varying,
    "data_source_details" "text",
    "last_collected" timestamp with time zone,
    "display_width" "text" DEFAULT 'full'::"text",
    "visualization_type" "text" DEFAULT 'progress'::"text",
    "visualization_config" "jsonb",
    "district_id" "uuid",
    "is_primary" boolean DEFAULT false,
    "display_value" character varying(50),
    "display_label" "text",
    "display_sublabel" "text",
    "measurement_scale" character varying(100),
    "ytd_change" numeric(10,2),
    "period_over_period_change" numeric(10,2),
    "period_over_period_percent" numeric(5,2),
    "calculation_method" "text",
    "data_completeness" numeric(5,2),
    "confidence_level" character varying(20),
    "last_calculated_at" timestamp with time zone,
    "calculation_notes" "text",
    "is_calculated" boolean DEFAULT false,
    "calculation_formula" "text",
    "show_target_line" boolean DEFAULT true,
    "show_trend" boolean DEFAULT true,
    "date_range_start" "date",
    "date_range_end" "date",
    "metric_data_type" character varying(20) DEFAULT 'quantitative'::character varying,
    CONSTRAINT "spb_metrics_aggregation_method_check" CHECK ((("aggregation_method")::"text" = ANY ((ARRAY['average'::character varying, 'sum'::character varying, 'latest'::character varying, 'max'::character varying, 'min'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_category_check" CHECK ((("metric_category")::"text" = ANY ((ARRAY['enrollment'::character varying, 'achievement'::character varying, 'discipline'::character varying, 'attendance'::character varying, 'culture'::character varying, 'other'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_collection_frequency_check" CHECK ((("collection_frequency")::"text" = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'annually'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_confidence_level_check" CHECK ((("confidence_level")::"text" = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_data_source_check" CHECK ((("data_source")::"text" = ANY ((ARRAY['survey'::character varying, 'map_data'::character varying, 'state_testing'::character varying, 'total_number'::character varying, 'percent'::character varying, 'narrative'::character varying, 'link'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_display_width_check" CHECK (("display_width" = ANY (ARRAY['full'::"text", 'half'::"text", 'third'::"text", 'quarter'::"text"]))),
    CONSTRAINT "spb_metrics_frequency_check" CHECK ((("frequency")::"text" = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_metric_data_type_check" CHECK ((("metric_data_type")::"text" = ANY ((ARRAY['quantitative'::character varying, 'qualitative'::character varying, 'mixed'::character varying, 'milestone'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_metric_type_check" CHECK ((("metric_type")::"text" = ANY ((ARRAY['percent'::character varying, 'number'::character varying, 'rating'::character varying, 'currency'::character varying, 'status'::character varying, 'narrative'::character varying, 'link'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['on-target'::character varying, 'near-target'::character varying, 'off-target'::character varying])::"text"[]))),
    CONSTRAINT "spb_metrics_trend_direction_check" CHECK ((("trend_direction")::"text" = ANY ((ARRAY['improving'::character varying, 'stable'::character varying, 'declining'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_metrics" OWNER TO "postgres";


COMMENT ON COLUMN "public"."spb_metrics"."ytd_value" IS 'Year-to-date calculated value based on aggregation method';



COMMENT ON COLUMN "public"."spb_metrics"."eoy_projection" IS 'End-of-year projection based on current trend';



COMMENT ON COLUMN "public"."spb_metrics"."visualization_type" IS 'Preferred visualization type (auto will use smart selection)';



COMMENT ON COLUMN "public"."spb_metrics"."display_value" IS 'Formatted value for display (e.g., "87%", "$1.5M")';



COMMENT ON COLUMN "public"."spb_metrics"."calculation_formula" IS 'Human-readable formula explaining the calculation';



CREATE OR REPLACE VIEW "public"."metrics_with_status" AS
 SELECT "id",
    "goal_id",
    "name",
    "metric_type",
    "data_source",
    "current_value",
    "target_value",
    "unit",
    "status",
    "chart_type",
    "display_options",
    "created_at",
    "updated_at",
    "metric_name",
    "frequency",
    "aggregation_method",
    "decimal_places",
    "is_percentage",
    "is_higher_better",
    "ytd_value",
    "eoy_projection",
    "last_actual_period",
    "risk_threshold_critical",
    "risk_threshold_warning",
    "description",
    "metric_category",
    "risk_threshold_off_target",
    "collection_frequency",
    "baseline_value",
    "trend_direction",
    "data_source_details",
    "last_collected",
        CASE
            WHEN (("current_value" IS NULL) OR ("target_value" IS NULL)) THEN 'no-data'::"text"
            WHEN "is_higher_better" THEN
            CASE
                WHEN (("current_value" / "target_value") >= COALESCE("risk_threshold_off_target", 0.9)) THEN 'on-target'::"text"
                WHEN (("current_value" / "target_value") >= COALESCE("risk_threshold_critical", 0.7)) THEN 'off-target'::"text"
                ELSE 'critical'::"text"
            END
            ELSE
            CASE
                WHEN (("current_value" / "target_value") <= COALESCE("risk_threshold_off_target", 1.1)) THEN 'on-target'::"text"
                WHEN (("current_value" / "target_value") <= COALESCE("risk_threshold_critical", 1.3)) THEN 'off-target'::"text"
                ELSE 'critical'::"text"
            END
        END AS "calculated_status"
   FROM "public"."spb_metrics" "m";


ALTER VIEW "public"."metrics_with_status" OWNER TO "postgres";


COMMENT ON VIEW "public"."metrics_with_status" IS 'Metrics with automatically calculated status based on current vs target values and risk thresholds';



CREATE TABLE IF NOT EXISTS "public"."spb_audit_trail" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "action" character varying(20) NOT NULL,
    "field_name" character varying(100),
    "old_value" "text",
    "new_value" "text",
    "change_summary" "text",
    "user_id" "uuid",
    "user_email" character varying(255),
    "user_name" character varying(255),
    "user_role" character varying(50),
    "ip_address" "inet",
    "user_agent" "text",
    "session_id" character varying(255),
    "reason" "text",
    "notes" "text",
    "related_entities" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "batch_id" "uuid",
    "batch_operation" character varying(100),
    CONSTRAINT "spb_audit_trail_action_check" CHECK ((("action")::"text" = ANY ((ARRAY['create'::character varying, 'update'::character varying, 'delete'::character varying, 'import'::character varying, 'export'::character varying, 'calculate'::character varying, 'override'::character varying])::"text"[]))),
    CONSTRAINT "spb_audit_trail_entity_type_check" CHECK ((("entity_type")::"text" = ANY ((ARRAY['goal'::character varying, 'metric'::character varying, 'metric_value'::character varying, 'district'::character varying, 'status_override'::character varying, 'bulk_import'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_audit_trail" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_audit_trail" IS 'Comprehensive audit log of all data changes';



CREATE TABLE IF NOT EXISTS "public"."spb_data_validations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid",
    "validation_date" timestamp with time zone DEFAULT "now"(),
    "proposed_value" numeric(10,2),
    "previous_value" numeric(10,2),
    "validation_status" character varying(20),
    "validation_rules_applied" "jsonb",
    "validation_messages" "text"[],
    "variance_from_previous" numeric(10,2),
    "variance_percentage" numeric(5,2),
    "is_outlier" boolean,
    "outlier_severity" character varying(20),
    "user_action" character varying(20),
    "override_reason" "text",
    "final_value" numeric(10,2),
    "validated_by" "uuid",
    "validated_by_name" character varying(255),
    "validation_timestamp" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "spb_data_validations_user_action_check" CHECK ((("user_action")::"text" = ANY ((ARRAY['accepted'::character varying, 'rejected'::character varying, 'modified'::character varying, 'override_with_reason'::character varying])::"text"[]))),
    CONSTRAINT "spb_data_validations_validation_status_check" CHECK ((("validation_status")::"text" = ANY ((ARRAY['passed'::character varying, 'warning'::character varying, 'failed'::character varying, 'overridden'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_data_validations" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_data_validations" IS 'Record of all data validation checks and overrides';



CREATE TABLE IF NOT EXISTS "public"."spb_districts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "slug" character varying NOT NULL,
    "logo_url" "text",
    "primary_color" character varying(7) DEFAULT '#0099CC'::character varying,
    "secondary_color" character varying(7) DEFAULT '#51d01b'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "admin_email" character varying,
    "is_public" boolean DEFAULT true
);


ALTER TABLE "public"."spb_districts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spb_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "district_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "goal_number" character varying NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "level" integer DEFAULT 0,
    "order_position" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'not-started'::character varying,
    "calculated_status" character varying(20),
    "status_source" character varying(20) DEFAULT 'calculated'::character varying,
    "status_override_reason" "text",
    "status_override_by" "uuid",
    "status_override_at" timestamp with time zone,
    "status_override_expires" timestamp with time zone,
    "status_calculation_confidence" numeric(5,2),
    "status_last_calculated" timestamp with time zone,
    "cover_photo_url" "text",
    "cover_photo_alt" "text"
);


ALTER TABLE "public"."spb_goals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."spb_goals"."status" IS 'Current status of the goal (can be manually overridden)';



COMMENT ON COLUMN "public"."spb_goals"."calculated_status" IS 'System-calculated status based on metrics and child goals';



COMMENT ON COLUMN "public"."spb_goals"."status_source" IS 'Whether status is calculated, manually set, or hybrid';



COMMENT ON COLUMN "public"."spb_goals"."status_override_reason" IS 'Justification for manual status override';



CREATE TABLE IF NOT EXISTS "public"."spb_import_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "import_type" character varying(50),
    "file_name" character varying(255),
    "file_size_bytes" integer,
    "total_rows" integer,
    "successful_rows" integer,
    "failed_rows" integer,
    "warning_rows" integer,
    "affected_goals" "uuid"[],
    "affected_metrics" "uuid"[],
    "validation_errors" "jsonb",
    "validation_warnings" "jsonb",
    "import_mapping" "jsonb",
    "import_config" "jsonb",
    "status" character varying(20),
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "duration_seconds" integer,
    "imported_by" "uuid" NOT NULL,
    "imported_by_name" character varying(255),
    "imported_by_email" character varying(255),
    "is_reversible" boolean DEFAULT true,
    "rollback_data" "jsonb",
    "rolled_back_at" timestamp with time zone,
    "rolled_back_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "spb_import_history_import_type_check" CHECK ((("import_type")::"text" = ANY ((ARRAY['excel'::character varying, 'csv'::character varying, 'api'::character varying, 'manual_bulk'::character varying, 'scheduled'::character varying])::"text"[]))),
    CONSTRAINT "spb_import_history_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'partially_completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_import_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_import_history" IS 'History of all bulk data imports with rollback capability';



CREATE TABLE IF NOT EXISTS "public"."spb_metric_narratives" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "district_id" "uuid" NOT NULL,
    "period" character varying(20) NOT NULL,
    "period_type" character varying(20) NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "summary" character varying(500),
    "sentiment" character varying(20),
    "status_indicator" character varying(20),
    "tags" "text"[],
    "category" character varying(50),
    "attachments" "jsonb",
    "images" "jsonb",
    "links" "jsonb",
    "related_values" "jsonb",
    "author_id" "uuid" NOT NULL,
    "author_name" character varying(255),
    "author_email" character varying(255),
    "author_role" character varying(50),
    "reviewed_by" "uuid",
    "reviewed_by_name" character varying(255),
    "reviewed_at" timestamp with time zone,
    "is_published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "spb_metric_narratives_period_type_check" CHECK ((("period_type")::"text" = ANY ((ARRAY['monthly'::character varying, 'quarterly'::character varying, 'annual'::character varying, 'milestone'::character varying, 'update'::character varying])::"text"[]))),
    CONSTRAINT "spb_metric_narratives_sentiment_check" CHECK ((("sentiment")::"text" = ANY ((ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying, 'mixed'::character varying])::"text"[]))),
    CONSTRAINT "spb_metric_narratives_status_indicator_check" CHECK ((("status_indicator")::"text" = ANY ((ARRAY['on-track'::character varying, 'at-risk'::character varying, 'off-track'::character varying, 'completed'::character varying, 'blocked'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_metric_narratives" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_metric_narratives" IS 'Blog-style narrative updates for qualitative metrics';



CREATE OR REPLACE VIEW "public"."spb_latest_narratives" AS
 SELECT DISTINCT ON ("metric_id") "metric_id",
    "period",
    "title",
    "summary",
    "content",
    "sentiment",
    "status_indicator",
    "author_name",
    "created_at"
   FROM "public"."spb_metric_narratives"
  WHERE ("is_published" = true)
  ORDER BY "metric_id", "created_at" DESC;


ALTER VIEW "public"."spb_latest_narratives" OWNER TO "postgres";


COMMENT ON VIEW "public"."spb_latest_narratives" IS 'Most recent narrative for each metric';



CREATE TABLE IF NOT EXISTS "public"."spb_metric_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "calculation_date" timestamp with time zone DEFAULT "now"(),
    "calculated_value" numeric(10,2),
    "ytd_value" numeric(10,2),
    "eoy_projection" numeric(10,2),
    "calculation_inputs" "jsonb",
    "calculation_method" character varying(50),
    "data_points_used" integer,
    "data_points_expected" integer,
    "confidence_score" numeric(5,2),
    "calculation_notes" "text",
    "created_by" "uuid"
);


ALTER TABLE "public"."spb_metric_calculations" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_metric_calculations" IS 'History of all metric calculations for audit and debugging';



CREATE TABLE IF NOT EXISTS "public"."spb_metric_data_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "source_name" character varying(255) NOT NULL,
    "source_type" character varying(50),
    "source_url" "text",
    "source_description" "text",
    "collection_frequency" character varying(50),
    "last_collected_at" timestamp with time zone,
    "next_collection_due" "date",
    "responsible_user" "uuid",
    "responsible_user_name" character varying(255),
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "spb_metric_data_sources_source_type_check" CHECK ((("source_type")::"text" = ANY ((ARRAY['manual'::character varying, 'excel'::character varying, 'csv'::character varying, 'api'::character varying, 'calculated'::character varying, 'survey'::character varying, 'system'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_metric_data_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spb_metric_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "milestone_date" "date" NOT NULL,
    "milestone_name" character varying(255) NOT NULL,
    "milestone_description" "text",
    "milestone_type" character varying(50),
    "is_achieved" boolean DEFAULT false,
    "achieved_date" "date",
    "achievement_value" numeric(10,2),
    "achievement_notes" "text",
    "evidence_url" "text",
    "evidence_description" "text",
    "attachments" "jsonb",
    "depends_on_milestone_id" "uuid",
    "blocks_milestone_ids" "uuid"[],
    "importance" character varying(20),
    "risk_level" character varying(20),
    "risk_notes" "text",
    "responsible_user_id" "uuid",
    "responsible_user_name" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "spb_metric_milestones_importance_check" CHECK ((("importance")::"text" = ANY ((ARRAY['critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying])::"text"[]))),
    CONSTRAINT "spb_metric_milestones_milestone_type_check" CHECK ((("milestone_type")::"text" = ANY ((ARRAY['target'::character varying, 'checkpoint'::character varying, 'deliverable'::character varying, 'event'::character varying, 'deadline'::character varying])::"text"[]))),
    CONSTRAINT "spb_metric_milestones_risk_level_check" CHECK ((("risk_level")::"text" = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying, 'none'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_metric_milestones" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_metric_milestones" IS 'Milestone tracking for project-based metrics';



CREATE TABLE IF NOT EXISTS "public"."spb_metric_time_series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "district_id" "uuid" NOT NULL,
    "period" character varying(20) NOT NULL,
    "period_type" character varying(20) NOT NULL,
    "target_value" numeric(10,2),
    "actual_value" numeric(10,2),
    "status" character varying(20),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "spb_metric_time_series_period_type_check" CHECK ((("period_type")::"text" = ANY ((ARRAY['annual'::character varying, 'quarterly'::character varying, 'monthly'::character varying])::"text"[]))),
    CONSTRAINT "spb_metric_time_series_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['on-target'::character varying, 'off-target'::character varying, 'critical'::character varying, 'no-data'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_metric_time_series" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_metric_time_series" IS 'Time-series data for metrics tracking actual vs target values over time periods';



COMMENT ON COLUMN "public"."spb_metric_time_series"."period" IS 'Time period identifier (e.g., 2024 for annual, 2024-Q1 for quarterly, 2024-01 for monthly)';



COMMENT ON COLUMN "public"."spb_metric_time_series"."period_type" IS 'Type of period: annual, quarterly, or monthly';



CREATE TABLE IF NOT EXISTS "public"."spb_metric_values" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "value" numeric(10,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."spb_metric_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spb_qualitative_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_id" "uuid" NOT NULL,
    "goal_id" "uuid",
    "assessment_date" "date" NOT NULL,
    "assessment_period" character varying(20),
    "assessment_type" character varying(50),
    "overall_rating" character varying(20),
    "progress_rating" character varying(20),
    "strengths" "text",
    "weaknesses" "text",
    "opportunities" "text",
    "threats" "text",
    "recommendations" "text",
    "action_items" "text",
    "evidence_summary" "text",
    "supporting_documents" "jsonb",
    "stakeholder_feedback" "jsonb",
    "assessed_by" "uuid" NOT NULL,
    "assessed_by_name" character varying(255),
    "assessment_methodology" "text",
    "confidence_level" character varying(20),
    "peer_reviewed" boolean DEFAULT false,
    "peer_reviewer_id" "uuid",
    "peer_review_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "spb_qualitative_assessments_assessment_type_check" CHECK ((("assessment_type")::"text" = ANY ((ARRAY['self'::character varying, 'peer'::character varying, 'external'::character varying, 'stakeholder'::character varying, 'combined'::character varying])::"text"[]))),
    CONSTRAINT "spb_qualitative_assessments_overall_rating_check" CHECK ((("overall_rating")::"text" = ANY ((ARRAY['excellent'::character varying, 'good'::character varying, 'satisfactory'::character varying, 'needs_improvement'::character varying, 'unsatisfactory'::character varying])::"text"[]))),
    CONSTRAINT "spb_qualitative_assessments_progress_rating_check" CHECK ((("progress_rating")::"text" = ANY ((ARRAY['ahead'::character varying, 'on_track'::character varying, 'slightly_behind'::character varying, 'significantly_behind'::character varying, 'blocked'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_qualitative_assessments" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_qualitative_assessments" IS 'Structured qualitative assessments and SWOT analysis';



CREATE TABLE IF NOT EXISTS "public"."spb_status_overrides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "goal_id" "uuid" NOT NULL,
    "previous_status" character varying(20),
    "new_status" character varying(20) NOT NULL,
    "calculated_status" character varying(20),
    "override_reason" "text" NOT NULL,
    "override_category" character varying(50),
    "evidence_urls" "text"[],
    "created_by" "uuid" NOT NULL,
    "created_by_name" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_outcome" character varying(50),
    "review_notes" "text",
    CONSTRAINT "spb_status_overrides_override_category_check" CHECK ((("override_category")::"text" = ANY ((ARRAY['strategic'::character varying, 'contextual'::character varying, 'external_factors'::character varying, 'data_quality'::character varying, 'other'::character varying])::"text"[]))),
    CONSTRAINT "spb_status_overrides_review_outcome_check" CHECK ((("review_outcome")::"text" = ANY ((ARRAY['approved'::character varying, 'rejected'::character varying, 'expired'::character varying, 'superseded'::character varying])::"text"[])))
);


ALTER TABLE "public"."spb_status_overrides" OWNER TO "postgres";


COMMENT ON TABLE "public"."spb_status_overrides" IS 'History of all manual status overrides for audit trail';



CREATE TABLE IF NOT EXISTS "public"."spb_stock_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "alt_text" "text" NOT NULL,
    "category" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."spb_stock_photos" OWNER TO "postgres";


ALTER TABLE ONLY "public"."spb_audit_trail"
    ADD CONSTRAINT "spb_audit_trail_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_data_validations"
    ADD CONSTRAINT "spb_data_validations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_districts"
    ADD CONSTRAINT "spb_districts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_districts"
    ADD CONSTRAINT "spb_districts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."spb_goals"
    ADD CONSTRAINT "spb_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_import_history"
    ADD CONSTRAINT "spb_import_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metric_calculations"
    ADD CONSTRAINT "spb_metric_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metric_data_sources"
    ADD CONSTRAINT "spb_metric_data_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metric_milestones"
    ADD CONSTRAINT "spb_metric_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metric_narratives"
    ADD CONSTRAINT "spb_metric_narratives_metric_id_period_key" UNIQUE ("metric_id", "period");



ALTER TABLE ONLY "public"."spb_metric_narratives"
    ADD CONSTRAINT "spb_metric_narratives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metric_time_series"
    ADD CONSTRAINT "spb_metric_time_series_metric_id_period_key" UNIQUE ("metric_id", "period");



ALTER TABLE ONLY "public"."spb_metric_time_series"
    ADD CONSTRAINT "spb_metric_time_series_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metric_values"
    ADD CONSTRAINT "spb_metric_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_metrics"
    ADD CONSTRAINT "spb_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_qualitative_assessments"
    ADD CONSTRAINT "spb_qualitative_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_status_overrides"
    ADD CONSTRAINT "spb_status_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spb_stock_photos"
    ADD CONSTRAINT "spb_stock_photos_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_assessments_date" ON "public"."spb_qualitative_assessments" USING "btree" ("assessment_date");



CREATE INDEX "idx_assessments_goal" ON "public"."spb_qualitative_assessments" USING "btree" ("goal_id");



CREATE INDEX "idx_assessments_metric" ON "public"."spb_qualitative_assessments" USING "btree" ("metric_id");



CREATE INDEX "idx_audit_batch" ON "public"."spb_audit_trail" USING "btree" ("batch_id");



CREATE INDEX "idx_audit_created" ON "public"."spb_audit_trail" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_entity" ON "public"."spb_audit_trail" USING "btree" ("entity_id");



CREATE INDEX "idx_audit_entity_type" ON "public"."spb_audit_trail" USING "btree" ("entity_type");



CREATE INDEX "idx_audit_user" ON "public"."spb_audit_trail" USING "btree" ("user_id");



CREATE INDEX "idx_calculations_date" ON "public"."spb_metric_calculations" USING "btree" ("calculation_date");



CREATE INDEX "idx_calculations_metric" ON "public"."spb_metric_calculations" USING "btree" ("metric_id");



CREATE INDEX "idx_data_sources_metric" ON "public"."spb_metric_data_sources" USING "btree" ("metric_id");



CREATE INDEX "idx_districts_slug" ON "public"."spb_districts" USING "btree" ("slug");



CREATE INDEX "idx_goals_calculated_status" ON "public"."spb_goals" USING "btree" ("calculated_status");



CREATE INDEX "idx_goals_district_id" ON "public"."spb_goals" USING "btree" ("district_id");



CREATE INDEX "idx_goals_goal_number" ON "public"."spb_goals" USING "btree" ("goal_number");



CREATE INDEX "idx_goals_level" ON "public"."spb_goals" USING "btree" ("level");



CREATE INDEX "idx_goals_parent_id" ON "public"."spb_goals" USING "btree" ("parent_id");



CREATE INDEX "idx_goals_status" ON "public"."spb_goals" USING "btree" ("status");



CREATE INDEX "idx_goals_status_source" ON "public"."spb_goals" USING "btree" ("status_source");



CREATE INDEX "idx_imports_created" ON "public"."spb_import_history" USING "btree" ("created_at");



CREATE INDEX "idx_imports_status" ON "public"."spb_import_history" USING "btree" ("status");



CREATE INDEX "idx_imports_user" ON "public"."spb_import_history" USING "btree" ("imported_by");



CREATE INDEX "idx_metric_time_series_district_id" ON "public"."spb_metric_time_series" USING "btree" ("district_id");



CREATE INDEX "idx_metric_time_series_metric_id" ON "public"."spb_metric_time_series" USING "btree" ("metric_id");



CREATE INDEX "idx_metric_time_series_period" ON "public"."spb_metric_time_series" USING "btree" ("period");



CREATE INDEX "idx_metric_time_series_period_type" ON "public"."spb_metric_time_series" USING "btree" ("period_type");



CREATE INDEX "idx_metric_time_series_status" ON "public"."spb_metric_time_series" USING "btree" ("status");



CREATE INDEX "idx_metrics_goal_id" ON "public"."spb_metrics" USING "btree" ("goal_id");



CREATE INDEX "idx_metrics_visualization" ON "public"."spb_metrics" USING "btree" ("visualization_type");



CREATE INDEX "idx_milestones_achieved" ON "public"."spb_metric_milestones" USING "btree" ("is_achieved");



CREATE INDEX "idx_milestones_date" ON "public"."spb_metric_milestones" USING "btree" ("milestone_date");



CREATE INDEX "idx_milestones_metric" ON "public"."spb_metric_milestones" USING "btree" ("metric_id");



CREATE INDEX "idx_narratives_created" ON "public"."spb_metric_narratives" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_narratives_metric" ON "public"."spb_metric_narratives" USING "btree" ("metric_id");



CREATE INDEX "idx_narratives_period" ON "public"."spb_metric_narratives" USING "btree" ("period");



CREATE INDEX "idx_narratives_published" ON "public"."spb_metric_narratives" USING "btree" ("is_published");



CREATE INDEX "idx_overrides_created_at" ON "public"."spb_status_overrides" USING "btree" ("created_at");



CREATE INDEX "idx_overrides_created_by" ON "public"."spb_status_overrides" USING "btree" ("created_by");



CREATE INDEX "idx_overrides_goal" ON "public"."spb_status_overrides" USING "btree" ("goal_id");



CREATE INDEX "idx_spb_metrics_category" ON "public"."spb_metrics" USING "btree" ("metric_category");



CREATE INDEX "idx_spb_metrics_frequency" ON "public"."spb_metrics" USING "btree" ("collection_frequency");



CREATE INDEX "idx_validations_date" ON "public"."spb_data_validations" USING "btree" ("validation_date");



CREATE INDEX "idx_validations_metric" ON "public"."spb_data_validations" USING "btree" ("metric_id");



CREATE INDEX "idx_validations_status" ON "public"."spb_data_validations" USING "btree" ("validation_status");



CREATE OR REPLACE TRIGGER "trigger_track_status_change" AFTER UPDATE ON "public"."spb_goals" FOR EACH ROW EXECUTE FUNCTION "public"."track_status_change"();



CREATE OR REPLACE TRIGGER "trigger_update_metric_aggregates" AFTER INSERT OR UPDATE ON "public"."spb_metric_time_series" FOR EACH ROW EXECUTE FUNCTION "public"."update_metric_aggregates"();



CREATE OR REPLACE TRIGGER "trigger_update_metric_display" BEFORE INSERT OR UPDATE ON "public"."spb_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_metric_display_value"();



ALTER TABLE ONLY "public"."spb_data_validations"
    ADD CONSTRAINT "spb_data_validations_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_goals"
    ADD CONSTRAINT "spb_goals_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."spb_districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_goals"
    ADD CONSTRAINT "spb_goals_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."spb_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_calculations"
    ADD CONSTRAINT "spb_metric_calculations_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_data_sources"
    ADD CONSTRAINT "spb_metric_data_sources_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_milestones"
    ADD CONSTRAINT "spb_metric_milestones_depends_on_milestone_id_fkey" FOREIGN KEY ("depends_on_milestone_id") REFERENCES "public"."spb_metric_milestones"("id");



ALTER TABLE ONLY "public"."spb_metric_milestones"
    ADD CONSTRAINT "spb_metric_milestones_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_narratives"
    ADD CONSTRAINT "spb_metric_narratives_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."spb_districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_narratives"
    ADD CONSTRAINT "spb_metric_narratives_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_time_series"
    ADD CONSTRAINT "spb_metric_time_series_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."spb_districts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metric_time_series"
    ADD CONSTRAINT "spb_metric_time_series_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_metrics"
    ADD CONSTRAINT "spb_metrics_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."spb_districts"("id");



ALTER TABLE ONLY "public"."spb_metrics"
    ADD CONSTRAINT "spb_metrics_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."spb_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_qualitative_assessments"
    ADD CONSTRAINT "spb_qualitative_assessments_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."spb_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_qualitative_assessments"
    ADD CONSTRAINT "spb_qualitative_assessments_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "public"."spb_metrics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spb_status_overrides"
    ADD CONSTRAINT "spb_status_overrides_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."spb_goals"("id") ON DELETE CASCADE;



CREATE POLICY "Enable all access for development" ON "public"."spb_districts" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access for development" ON "public"."spb_goals" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access for development" ON "public"."spb_metric_time_series" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all access for development" ON "public"."spb_metrics" USING (true) WITH CHECK (true);



ALTER TABLE "public"."spb_districts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spb_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spb_metric_time_series" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spb_metrics" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."audit_trail_logger"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_trail_logger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_trail_logger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_eoy_projection"("p_metric_id" "uuid", "p_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_eoy_projection"("p_metric_id" "uuid", "p_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_eoy_projection"("p_metric_id" "uuid", "p_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_goal_status_from_metrics"("p_goal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_goal_status_from_metrics"("p_goal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_goal_status_from_metrics"("p_goal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_ytd_average"("p_metric_id" "uuid", "p_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_ytd_average"("p_metric_id" "uuid", "p_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_ytd_average"("p_metric_id" "uuid", "p_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_entity_audit_history"("p_entity_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_entity_audit_history"("p_entity_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_entity_audit_history"("p_entity_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_actual"("p_metric_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_actual"("p_metric_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_actual"("p_metric_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_narrative_timeline"("p_metric_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_narrative_timeline"("p_metric_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_narrative_timeline"("p_metric_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."suggest_visualization_type"("p_metric_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."suggest_visualization_type"("p_metric_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."suggest_visualization_type"("p_metric_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_metric_aggregates"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_metric_aggregates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_metric_aggregates"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_metric_display_value"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_metric_display_value"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_metric_display_value"() TO "service_role";


















GRANT ALL ON TABLE "public"."spb_metrics" TO "anon";
GRANT ALL ON TABLE "public"."spb_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."metrics_with_status" TO "anon";
GRANT ALL ON TABLE "public"."metrics_with_status" TO "authenticated";
GRANT ALL ON TABLE "public"."metrics_with_status" TO "service_role";



GRANT ALL ON TABLE "public"."spb_audit_trail" TO "anon";
GRANT ALL ON TABLE "public"."spb_audit_trail" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_audit_trail" TO "service_role";



GRANT ALL ON TABLE "public"."spb_data_validations" TO "anon";
GRANT ALL ON TABLE "public"."spb_data_validations" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_data_validations" TO "service_role";



GRANT ALL ON TABLE "public"."spb_districts" TO "anon";
GRANT ALL ON TABLE "public"."spb_districts" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_districts" TO "service_role";



GRANT ALL ON TABLE "public"."spb_goals" TO "anon";
GRANT ALL ON TABLE "public"."spb_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_goals" TO "service_role";



GRANT ALL ON TABLE "public"."spb_import_history" TO "anon";
GRANT ALL ON TABLE "public"."spb_import_history" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_import_history" TO "service_role";



GRANT ALL ON TABLE "public"."spb_metric_narratives" TO "anon";
GRANT ALL ON TABLE "public"."spb_metric_narratives" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metric_narratives" TO "service_role";



GRANT ALL ON TABLE "public"."spb_latest_narratives" TO "anon";
GRANT ALL ON TABLE "public"."spb_latest_narratives" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_latest_narratives" TO "service_role";



GRANT ALL ON TABLE "public"."spb_metric_calculations" TO "anon";
GRANT ALL ON TABLE "public"."spb_metric_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metric_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."spb_metric_data_sources" TO "anon";
GRANT ALL ON TABLE "public"."spb_metric_data_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metric_data_sources" TO "service_role";



GRANT ALL ON TABLE "public"."spb_metric_milestones" TO "anon";
GRANT ALL ON TABLE "public"."spb_metric_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metric_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."spb_metric_time_series" TO "anon";
GRANT ALL ON TABLE "public"."spb_metric_time_series" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metric_time_series" TO "service_role";



GRANT ALL ON TABLE "public"."spb_metric_values" TO "anon";
GRANT ALL ON TABLE "public"."spb_metric_values" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_metric_values" TO "service_role";



GRANT ALL ON TABLE "public"."spb_qualitative_assessments" TO "anon";
GRANT ALL ON TABLE "public"."spb_qualitative_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_qualitative_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."spb_status_overrides" TO "anon";
GRANT ALL ON TABLE "public"."spb_status_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_status_overrides" TO "service_role";



GRANT ALL ON TABLE "public"."spb_stock_photos" TO "anon";
GRANT ALL ON TABLE "public"."spb_stock_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."spb_stock_photos" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























\unrestrict kjgFm75z1brxBKR1Bgtg0lQU6mO2PKFXpqwnYrlgCrevmbHU2aNav3hqBhWLMrm

RESET ALL;
