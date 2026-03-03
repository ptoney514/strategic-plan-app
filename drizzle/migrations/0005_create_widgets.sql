CREATE TABLE IF NOT EXISTS "widgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" varchar(255),
	"config" jsonb DEFAULT '{}'::jsonb,
	"position" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "widgets_organization_id_idx" ON "widgets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "widgets_plan_id_idx" ON "widgets" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "widgets_org_position_idx" ON "widgets" USING btree ("organization_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "widgets_is_active_idx" ON "widgets" USING btree ("is_active");
