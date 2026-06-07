CREATE TYPE "public"."hackathon_submission_status" AS ENUM('IN_PROGRESS', 'SHORTLISTED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "hackathon_stage_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"stage_id" text NOT NULL,
	"project_title" text,
	"summary" text,
	"demo_url" text,
	"repository_url" text,
	"video_url" text,
	"deck_url" text,
	"additional_notes" text,
	"submitted" boolean DEFAULT false NOT NULL,
	"status" "hackathon_submission_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"score" text,
	"panel" text,
	"decision_note" text,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "hackathon_stage_submissions" ADD CONSTRAINT "hackathon_stage_submissions_registration_id_hackathon_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."hackathon_registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_stage_submissions" ADD CONSTRAINT "hackathon_stage_submissions_stage_id_hackathon_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."hackathon_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_stage_submission_idx" ON "hackathon_stage_submissions" USING btree ("registration_id","stage_id");
