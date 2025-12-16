-- Fix issue 2: Remove self-read capability from user_roles
-- Role checks happen server-side via has_role() function, no need for users to query their own roles
DROP POLICY IF EXISTS "Admins can read user roles" ON public.user_roles;

CREATE POLICY "Only admins can read user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix issue 3: Restrict campaigns table to admins only
-- Public users only need to see products (which have their own is_active field)
DROP POLICY IF EXISTS "Anyone can read campaigns" ON public.campaigns;

CREATE POLICY "Only admins can read campaigns" 
ON public.campaigns 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));