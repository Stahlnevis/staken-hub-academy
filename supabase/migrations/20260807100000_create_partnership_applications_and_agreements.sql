-- ============================================================
-- PARTNERSHIP APPLICATIONS & STUDENT AGREEMENTS SCHEMA
-- ============================================================

-- 1. ACADEMY APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.academy_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  position TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  physical_address TEXT,
  org_type TEXT,
  year_established TEXT,
  num_students TEXT,
  num_instructors TEXT,
  training_areas TEXT[],
  uses_lms TEXT,
  partner_rationale TEXT,
  hear_about_us TEXT,
  documents_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  terms_accepted BOOLEAN NOT NULL DEFAULT true,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  date_applied TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_notes TEXT,
  full_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INSTRUCTOR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.instructor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  education_level TEXT,
  occupation TEXT,
  teaching_experience_years TEXT,
  teaching_areas TEXT[],
  certifications TEXT,
  teaching_experience_details TEXT,
  cv_link TEXT,
  linkedin_profile TEXT,
  portfolio_website TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  terms_accepted BOOLEAN NOT NULL DEFAULT true,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  date_applied TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_notes TEXT,
  full_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. STUDENT AGREEMENTS AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.student_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  full_name TEXT,
  policy_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. UPDATE PROFILES TABLE FOR QUICK TERMS STATUS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_policy_version TEXT;

-- 5. ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.academy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_agreements ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/authenticated) to insert partnership applications
CREATE POLICY "anyone_insert_academy_apps" ON public.academy_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anyone_insert_instructor_apps" ON public.instructor_applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anyone_insert_student_agreements" ON public.student_agreements
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow admins full control over applications and agreements
CREATE POLICY "admins_manage_academy_apps" ON public.academy_applications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins_manage_instructor_apps" ON public.instructor_applications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins_manage_student_agreements" ON public.student_agreements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also grant public select/insert access permissions
GRANT SELECT, INSERT, UPDATE ON public.academy_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.instructor_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_agreements TO anon, authenticated;
GRANT ALL ON public.academy_applications TO service_role;
GRANT ALL ON public.instructor_applications TO service_role;
GRANT ALL ON public.student_agreements TO service_role;
