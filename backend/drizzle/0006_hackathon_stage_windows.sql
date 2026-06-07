ALTER TABLE "hackathon_stages"
ADD COLUMN IF NOT EXISTS "start_at" text,
ADD COLUMN IF NOT EXISTS "end_at" text;
