-- ============ COUPONS TABLE ============
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  programme TEXT NOT NULL,
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow public to select coupons (for validation check on form)
CREATE POLICY "anyone_select_coupons" ON public.coupons 
  FOR SELECT TO anon, authenticated 
  USING (true);

-- Allow admins to manage coupons
CREATE POLICY "admins_manage_coupons" ON public.coupons 
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
