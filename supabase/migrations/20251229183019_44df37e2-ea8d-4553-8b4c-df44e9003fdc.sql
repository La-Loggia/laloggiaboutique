-- Create an enum for product categories
CREATE TYPE public.product_category AS ENUM ('ropa', 'bolsos');

-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN category public.product_category NOT NULL DEFAULT 'ropa';