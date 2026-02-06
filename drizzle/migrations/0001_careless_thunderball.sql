CREATE TABLE "import_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"file_size" integer,
	"status" text DEFAULT 'uploaded',
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"error_message" text,
	"import_summary" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metric_time_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"target_value" numeric(10, 2),
	"actual_value" numeric(10, 2),
	"status" varchar(20),
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "metric_time_series_metric_period_unique" UNIQUE("metric_id","period")
);
--> statement-breakpoint
CREATE TABLE "school_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"school_slug" text NOT NULL,
	"district_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" uuid,
	CONSTRAINT "school_admins_user_school_unique" UNIQUE("user_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "staged_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_session_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"raw_data" jsonb NOT NULL,
	"parsed_hierarchy" text,
	"goal_number" text,
	"title" text,
	"description" text,
	"level" integer,
	"owner_name" text,
	"department" text,
	"validation_status" text DEFAULT 'valid',
	"validation_messages" text[] DEFAULT '{}'::text[],
	"is_mapped" boolean DEFAULT false,
	"mapped_to_goal_id" uuid,
	"action" text DEFAULT 'create',
	"is_auto_generated" boolean DEFAULT false,
	"auto_fix_suggestions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staged_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staged_goal_id" uuid NOT NULL,
	"import_session_id" uuid NOT NULL,
	"metric_name" text NOT NULL,
	"measure_description" text,
	"metric_type" text,
	"data_source" text,
	"frequency" text,
	"baseline_value" numeric,
	"time_series_data" jsonb,
	"unit" text,
	"symbol" text,
	"validation_status" text DEFAULT 'valid',
	"validation_messages" text[] DEFAULT '{}'::text[],
	"is_mapped" boolean DEFAULT false,
	"mapped_to_metric_id" uuid,
	"action" text DEFAULT 'create',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "status_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"previous_status" varchar(20),
	"new_status" varchar(20) NOT NULL,
	"calculated_status" varchar(20),
	"override_reason" text NOT NULL,
	"override_category" varchar(50),
	"evidence_urls" text[] DEFAULT '{}'::text[],
	"created_by" uuid NOT NULL,
	"created_by_name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_outcome" varchar(50),
	"review_notes" text
);
--> statement-breakpoint
CREATE TABLE "stock_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt_text" text NOT NULL,
	"category" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "school_id" uuid;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "calculated_status" varchar(20);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_source" varchar(20) DEFAULT 'calculated';--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_override_reason" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_override_by" uuid;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_override_at" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_override_expires" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_calculation_confidence" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "status_last_calculated" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_override" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_custom_value" varchar(50);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_display_mode" varchar(20) DEFAULT 'percentage';--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_source" varchar(20) DEFAULT 'calculated';--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_last_calculated" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_override_by" uuid;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_override_at" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "overall_progress_override_reason" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "header_color" varchar(7);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "cover_photo_url" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "cover_photo_alt" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "color" varchar(20);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "show_progress_bar" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "owner_name" varchar(255);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "department" varchar(255);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "start_date" date;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "priority" varchar(20);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "executive_summary" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "indicator_text" varchar(50);--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "indicator_color" varchar(7) DEFAULT '#10b981';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "metric_name" varchar(255);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "metric_category" varchar(50) DEFAULT 'other';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "display_width" varchar(10) DEFAULT 'full';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "display_value" varchar(50);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "display_label" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "display_sublabel" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "visualization_type" varchar(50) DEFAULT 'auto';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "visualization_config" jsonb;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "show_target_line" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "show_trend" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "frequency" varchar(20) DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "aggregation_method" varchar(20) DEFAULT 'average';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "decimal_places" integer DEFAULT 2;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "is_percentage" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "is_higher_better" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "ytd_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "eoy_projection" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "last_actual_period" varchar(20);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "risk_threshold_critical" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "risk_threshold_warning" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "risk_threshold_off_target" numeric(10, 4);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "collection_frequency" varchar(20) DEFAULT 'quarterly';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "baseline_value" numeric(10, 4);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "trend_direction" varchar(20) DEFAULT 'stable';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "data_source_details" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "last_collected" timestamp;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "measurement_scale" varchar(100);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "ytd_change" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "period_over_period_change" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "period_over_period_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "calculation_method" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "data_completeness" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "confidence_level" varchar(20);--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "last_calculated_at" timestamp;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "calculation_notes" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "is_calculated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "calculation_formula" text;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "date_range_start" date;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "date_range_end" date;--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "metric_data_type" varchar(20) DEFAULT 'quantitative';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "metric_calculation_type" varchar(50) DEFAULT 'numeric';--> statement-breakpoint
ALTER TABLE "metrics" ADD COLUMN "qualitative_mapping" jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "admin_email" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "dashboard_template" varchar(50) DEFAULT 'hierarchical';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "dashboard_config" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "import_sessions" ADD CONSTRAINT "import_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_time_series" ADD CONSTRAINT "metric_time_series_metric_id_metrics_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."metrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_time_series" ADD CONSTRAINT "metric_time_series_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_goals" ADD CONSTRAINT "staged_goals_import_session_id_import_sessions_id_fk" FOREIGN KEY ("import_session_id") REFERENCES "public"."import_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_goals" ADD CONSTRAINT "staged_goals_mapped_to_goal_id_goals_id_fk" FOREIGN KEY ("mapped_to_goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_metrics" ADD CONSTRAINT "staged_metrics_staged_goal_id_staged_goals_id_fk" FOREIGN KEY ("staged_goal_id") REFERENCES "public"."staged_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_metrics" ADD CONSTRAINT "staged_metrics_import_session_id_import_sessions_id_fk" FOREIGN KEY ("import_session_id") REFERENCES "public"."import_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_metrics" ADD CONSTRAINT "staged_metrics_mapped_to_metric_id_metrics_id_fk" FOREIGN KEY ("mapped_to_metric_id") REFERENCES "public"."metrics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_overrides" ADD CONSTRAINT "status_overrides_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "import_sessions_org_id_idx" ON "import_sessions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "import_sessions_status_idx" ON "import_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "metric_time_series_metric_id_idx" ON "metric_time_series" USING btree ("metric_id");--> statement-breakpoint
CREATE INDEX "metric_time_series_org_id_idx" ON "metric_time_series" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "school_admins_user_id_idx" ON "school_admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "school_admins_school_id_idx" ON "school_admins" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "staged_goals_session_id_idx" ON "staged_goals" USING btree ("import_session_id");--> statement-breakpoint
CREATE INDEX "staged_metrics_goal_id_idx" ON "staged_metrics" USING btree ("staged_goal_id");--> statement-breakpoint
CREATE INDEX "staged_metrics_session_id_idx" ON "staged_metrics" USING btree ("import_session_id");--> statement-breakpoint
CREATE INDEX "status_overrides_goal_id_idx" ON "status_overrides" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "status_overrides_created_by_idx" ON "status_overrides" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "stock_photos_category_idx" ON "stock_photos" USING btree ("category");--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goals_organization_id_idx" ON "goals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "goals_school_id_idx" ON "goals" USING btree ("school_id");