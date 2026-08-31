ALTER TABLE public.outfit_submissions
  ADD COLUMN IF NOT EXISTS published_product_id uuid,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;
CREATE INDEX IF NOT EXISTS outfit_submissions_published_product_id_idx ON public.outfit_submissions (published_product_id);