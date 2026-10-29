CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 username text NOT NULL UNIQUE,
 display_name text NOT NULL,
 CONSTRAINT username_format CHECK (username ~ '^[a-z0-9]+([.][a-z0-9]+)*$')
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own staff profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
CREATE OR REPLACE FUNCTION public.deny_reader_writes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF public.has_role(auth.uid(), 'submissions_reader') THEN
  RAISE EXCEPTION 'Read-only account cannot modify data' USING ERRCODE = '42501';
 END IF;
 IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER deny_reader_writes BEFORE INSERT OR UPDATE OR DELETE ON public.outfit_submissions FOR EACH ROW EXECUTE FUNCTION public.deny_reader_writes();
CREATE TRIGGER deny_reader_writes BEFORE INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.deny_reader_writes();
CREATE TRIGGER deny_reader_writes BEFORE INSERT OR UPDATE OR DELETE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.deny_reader_writes();
CREATE TRIGGER deny_reader_writes BEFORE INSERT OR UPDATE OR DELETE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.deny_reader_writes();
CREATE TRIGGER deny_reader_writes BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.deny_reader_writes();
CREATE POLICY "Readers cannot upload files" ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (NOT public.has_role(auth.uid(), 'submissions_reader'));
CREATE POLICY "Readers cannot update files" ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING (NOT public.has_role(auth.uid(), 'submissions_reader')) WITH CHECK (NOT public.has_role(auth.uid(), 'submissions_reader'));
CREATE POLICY "Readers cannot delete files" ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING (NOT public.has_role(auth.uid(), 'submissions_reader'));
