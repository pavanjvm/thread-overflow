CREATE TYPE "public"."hackathon_stage_type" AS ENUM('REGISTRATION', 'SUBMISSION');--> statement-breakpoint
CREATE TABLE "hackathon_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"hackathon_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" "hackathon_stage_type" NOT NULL,
	"source_stage_id" text,
	"sort_order" integer NOT NULL,
	"evaluation_enabled" boolean DEFAULT true NOT NULL,
	"evaluation_max_score" integer DEFAULT 0 NOT NULL,
	"evaluation_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hackathon_stages" ADD CONSTRAINT "hackathon_stages_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_stage_code_idx" ON "hackathon_stages" USING btree ("hackathon_id","code");--> statement-breakpoint
INSERT INTO "hackathon_stages" ("id", "hackathon_id", "name", "code", "type", "source_stage_id", "sort_order", "evaluation_enabled", "evaluation_max_score", "evaluation_criteria")
SELECT
  'hackathon-stage-reg-' || "id",
  "id",
  'Registrations',
  'REG',
  'REGISTRATION'::"hackathon_stage_type",
  NULL,
  0,
  false,
  0,
  '[]'::jsonb
FROM "hackathons";
