ALTER TABLE public.outfit_submissions
  ADD COLUMN IF NOT EXISTS top_image_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bottom_image_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS full_outfit_image_urls text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.outfit_submissions ALTER COLUMN top_image_url DROP NOT NULL;
ALTER TABLE public.outfit_submissions ALTER COLUMN bottom_image_url DROP NOT NULL;