-- Create visibility type enum for products
CREATE TYPE public.product_visibility AS ENUM ('all', 'brand_only', 'latest_only');

-- Add visibility column to products table with default 'all'
ALTER TABLE public.products 
ADD COLUMN visibility public.product_visibility NOT NULL DEFAULT 'all';