ALTER TABLE "hackathons"
  ADD COLUMN "logo_object_key" text,
  ADD COLUMN "logo_url" text,
  ADD COLUMN "cover_image_object_key" text,
  ADD COLUMN "cover_image_url" text;

UPDATE "hackathons"
SET
  "logo_object_key" = 'legacy-inline',
  "logo_url" = "logo_data_url",
  "cover_image_object_key" = 'legacy-inline',
  "cover_image_url" = "cover_image_data_url";

ALTER TABLE "hackathons"
  ALTER COLUMN "logo_object_key" SET NOT NULL,
  ALTER COLUMN "logo_url" SET NOT NULL,
  ALTER COLUMN "cover_image_object_key" SET NOT NULL,
  ALTER COLUMN "cover_image_url" SET NOT NULL;

ALTER TABLE "hackathons"
  DROP COLUMN "logo_data_url",
  DROP COLUMN "cover_image_data_url";
