ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS products_deleted_at_idx ON public.products (deleted_at);

CREATE OR REPLACE FUNCTION public.purge_expired_deleted_products()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH removed AS (
    DELETE FROM public.products
    WHERE deleted_at IS NOT NULL
      AND deleted_at < now() - interval '30 days'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM removed;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.soft_delete_products(_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  PERFORM public.purge_expired_deleted_products();

  WITH updated AS (
    UPDATE public.products
    SET deleted_at = now(), is_active = false
    WHERE id = ANY(_ids) AND deleted_at IS NULL
    RETURNING id
  )
  SELECT count(*) INTO updated_count FROM updated;
  RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_products(_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH updated AS (
    UPDATE public.products
    SET deleted_at = NULL, is_active = true
    WHERE id = ANY(_ids) AND deleted_at IS NOT NULL
    RETURNING id
  )
  SELECT count(*) INTO updated_count FROM updated;
  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_deleted_products() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.soft_delete_products(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.restore_products(uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.purge_expired_deleted_products() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.soft_delete_products(uuid[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_products(uuid[]) TO authenticated, service_role;