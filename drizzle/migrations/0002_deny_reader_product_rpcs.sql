DO $$
DECLARE fn record; definition text;
BEGIN
 FOR fn IN SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('increment_all_product_orders','purge_expired_deleted_products','reorder_products','restore_products','set_products_sale','soft_delete_products') LOOP
  definition := pg_get_functiondef(fn.oid);
  definition := regexp_replace(definition, '\mBEGIN\M', E'BEGIN\n  IF public.has_role(auth.uid(), ''submissions_reader'') THEN\n    RAISE EXCEPTION ''Read-only account cannot modify products'' USING ERRCODE = ''42501'';\n  END IF;', 'i');
  EXECUTE definition;
 END LOOP;
END $$;