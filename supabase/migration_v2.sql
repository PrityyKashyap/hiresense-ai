-- HireSense AI — Migration: Add Phase 2 Features
-- Run this in Supabase SQL Editor AFTER the initial schema.sql

-- Add file_url column to resumes (for Supabase Storage)
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Add job_title + job_description to scores for standalone analysis
ALTER TABLE scores ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS job_description TEXT;

-- Create Supabase Storage bucket for resumes (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can upload their own resumes
-- CREATE POLICY "Users can upload own resumes" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: Users can view their own resumes  
-- CREATE POLICY "Users can view own resumes" ON storage.objects
--   FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for faster score lookups
CREATE INDEX IF NOT EXISTS idx_scores_resume_id ON scores(resume_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
