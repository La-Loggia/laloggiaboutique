-- Add new categories to product_category enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'plumiferos';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'camisetas';