ALTER TABLE "widgets" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "widgets_goal_id_idx" ON "widgets" USING btree ("goal_id");
