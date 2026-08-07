-- ============================================================
-- BULK ENROLLMENT REQUESTS TABLE
-- Allows Instructors / Academies to submit bulk student credentials documents to Admin
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bulk_enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID,
  instructor_name TEXT NOT NULL,
  instructor_email TEXT NOT NULL,
  institution_id UUID,
  institution_name TEXT NOT NULL,
  program TEXT NOT NULL,
  cohort TEXT,
  document_title TEXT NOT NULL,
  document_url TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bulk_enrollment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_insert_bulk_enrollments" ON public.bulk_enrollment_requests
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "instructors_view_own_bulk_enrollments" ON public.bulk_enrollment_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admins_manage_bulk_enrollments" ON public.bulk_enrollment_requests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.bulk_enrollment_requests TO anon, authenticated;
GRANT ALL ON public.bulk_enrollment_requests TO service_role;
