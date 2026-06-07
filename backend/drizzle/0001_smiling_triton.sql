CREATE TYPE "public"."hackathon_status" AS ENUM('PLANNING', 'LIVE', 'REVIEW', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."participation_type" AS ENUM('INDIVIDUAL', 'TEAM');--> statement-breakpoint
CREATE TABLE "hackathon_registration_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"hackathon_id" text NOT NULL,
	"label" text NOT NULL,
	"is_default" integer DEFAULT 0 NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"hackathon_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"overview_html" text NOT NULL,
	"overview_text" text NOT NULL,
	"logo_data_url" text NOT NULL,
	"cover_image_data_url" text NOT NULL,
	"registration_start" text NOT NULL,
	"registration_end" text NOT NULL,
	"participation_type" "participation_type" NOT NULL,
	"min_team_size" integer,
	"max_team_size" integer,
	"status" "hackathon_status" DEFAULT 'PLANNING' NOT NULL,
	"organization_name" text,
	"prize_pool" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hackathons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "hackathon_registration_fields" ADD CONSTRAINT "hackathon_registration_fields_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_tracks" ADD CONSTRAINT "hackathon_tracks_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_registration_field_label_idx" ON "hackathon_registration_fields" USING btree ("hackathon_id","label");--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_track_name_idx" ON "hackathon_tracks" USING btree ("hackathon_id","name");