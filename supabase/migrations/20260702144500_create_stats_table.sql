-- Create public.stats table
CREATE TABLE IF NOT EXISTS public.stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  suffix TEXT NOT NULL DEFAULT '+',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and grant permissions
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.stats TO anon, authenticated;
GRANT ALL ON public.stats TO service_role;

-- RLS policies
CREATE POLICY "stats public read" ON public.stats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "stats admin write" ON public.stats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Touch trigger
CREATE OR REPLACE TRIGGER stats_touch BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Insert initial values
INSERT INTO public.stats (label, value, suffix, sort_order) VALUES
  ('Students Trained', 2500, '+', 0),
  ('Courses Offered', 18, '+', 1),
  ('Industry Mentors', 45, '+', 2),
  ('Graduates Certified', 92, '%', 3)
ON CONFLICT DO NOTHING;
