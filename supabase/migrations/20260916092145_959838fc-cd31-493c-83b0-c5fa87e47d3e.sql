ALTER TABLE public.products ADD COLUMN IF NOT EXISTS on_sale boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS products_on_sale_idx ON public.products (on_sale) WHERE on_sale = true;

CREATE OR REPLACE FUNCTION public.set_products_sale(_ids uuid[], _on_sale boolean)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  WITH updated AS (
    UPDATE public.products
    SET on_sale = _on_sale
    WHERE id = ANY(_ids) AND deleted_at IS NULL
    RETURNING id
  )
  SELECT count(*) INTO updated_count FROM updated;
  RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.reorder_products(_ids uuid[], _orders integer[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF array_length(_ids, 1) IS DISTINCT FROM array_length(_orders, 1) THEN
    RAISE EXCEPTION 'ids and orders must have the same length';
  END IF;

  WITH pairs AS (
    SELECT unnest(_ids) AS id, unnest(_orders) AS display_order
  ), updated AS (
    UPDATE public.products p
    SET display_order = pairs.display_order
    FROM pairs
    WHERE p.id = pairs.id AND p.deleted_at IS NULL
    RETURNING p.id
  )
  SELECT count(*) INTO updated_count FROM updated;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_products_sale(uuid[], boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reorder_products(uuid[], integer[]) TO anon, authenticated, service_role;