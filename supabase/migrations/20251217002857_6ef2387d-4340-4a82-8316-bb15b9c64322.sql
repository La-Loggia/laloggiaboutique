-- Add display_order column to products table
ALTER TABLE public.products 
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Set initial display_order based on created_at (newest = lowest number = first)
WITH ordered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM public.products
)
UPDATE public.products p
SET display_order = op.rn
FROM ordered_products op
WHERE p.id = op.id;