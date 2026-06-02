-- Allow public read of outfit submissions so uploaders can see the shared history
CREATE POLICY "Anyone can view submissions"
ON public.outfit_submissions
FOR SELECT
USING (true);

GRANT SELECT ON public.outfit_submissions TO anon;