
-- 1. UPDATE policy en outfit-submissions solo para admins
CREATE POLICY "Admins can update outfit-submissions objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'outfit-submissions' AND has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'outfit-submissions' AND has_role(auth.uid(), 'admin'));

-- 2-4. Revocar EXECUTE público de funciones SECURITY DEFINER.
-- Las policies RLS siguen pudiendo invocar has_role porque se ejecutan como SECURITY DEFINER del owner.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_all_product_orders() FROM PUBLIC, anon, authenticated;
