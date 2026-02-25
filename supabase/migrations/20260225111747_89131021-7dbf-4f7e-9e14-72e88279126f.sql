
-- Add 3 boolean visibility columns
ALTER TABLE public.products 
  ADD COLUMN show_in_latest boolean NOT NULL DEFAULT true,
  ADD COLUMN show_in_section boolean NOT NULL DEFAULT true,
  ADD COLUMN show_in_brand boolean NOT NULL DEFAULT true;

-- Migrate existing data from visibility enum
UPDATE public.products SET
  show_in_latest = CASE 
    WHEN visibility = 'all' THEN true
    WHEN visibility = 'latest_only' THEN true
    ELSE false
  END,
  show_in_section = CASE 
    WHEN visibility = 'all' THEN true
    WHEN visibility = 'brand_only' THEN false
    ELSE false
  END,
  show_in_brand = CASE 
    WHEN visibility = 'all' THEN true
    WHEN visibility = 'brand_only' THEN true
    ELSE false
  END;
