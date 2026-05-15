CREATE TABLE public.outfit_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  top_image_url TEXT NOT NULL,
  bottom_image_url TEXT NOT NULL,
  brand brand_type,
  notes TEXT,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.outfit_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit outfits"
ON public.outfit_submissions FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read submissions"
ON public.outfit_submissions FOR SELECT
TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions"
ON public.outfit_submissions FOR UPDATE
TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete submissions"
ON public.outfit_submissions FOR DELETE
TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO storage.buckets (id, name, public)
VALUES ('outfit-submissions', 'outfit-submissions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload outfit submission images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'outfit-submissions');

CREATE POLICY "Anyone can view outfit submission images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'outfit-submissions');

CREATE POLICY "Admins can delete outfit submission images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'outfit-submissions' AND has_role(auth.uid(), 'admin'::app_role));