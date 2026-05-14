WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id) AS rn
  FROM public.products
)
UPDATE public.products p
SET display_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id;