-- Add description column to corporate_clients table
ALTER TABLE public.corporate_clients ADD COLUMN IF NOT EXISTS description TEXT;
