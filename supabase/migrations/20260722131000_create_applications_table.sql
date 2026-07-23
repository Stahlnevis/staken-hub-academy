-- ============ APPLICATIONS & TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  programme TEXT NOT NULL,
  mode TEXT NOT NULL,
  goals TEXT,
  coupon_code TEXT,
  child_name TEXT,
  child_age TEXT,
  payment_method TEXT NOT NULL,
  amount_paid TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  mpesa_reference TEXT,
  checkout_request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.applications TO anon, authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (for students applying)
CREATE POLICY "anyone_insert_applications" ON public.applications 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

-- Allow admins to perform all operations
CREATE POLICY "admins_manage_applications" ON public.applications 
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
