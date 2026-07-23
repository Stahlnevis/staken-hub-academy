-- Add category column to coupons table
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'programme';
