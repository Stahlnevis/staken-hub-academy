ALTER TABLE public.announcements 
ADD COLUMN category TEXT CHECK (category IN ('previous', 'current', 'future')) DEFAULT 'current';
