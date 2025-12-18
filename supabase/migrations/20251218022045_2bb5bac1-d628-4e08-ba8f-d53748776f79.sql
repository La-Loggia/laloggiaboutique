-- Create function to increment all product display orders
CREATE OR REPLACE FUNCTION public.increment_all_product_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products SET display_order = display_order + 1;
END;
$$;