-- HireSense AI — Fix Auth 500 Error
-- Run this ENTIRE block in Supabase SQL Editor → New Query → Run

-- ─── Step 1: Drop and recreate trigger with proper security ───────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Step 2: Grant trigger function access to profiles table ──────────────
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ─── Step 3: Add missing file_url column to resumes (migration_v2) ────────
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_url TEXT;

-- ─── Step 4: Add indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scores_resume_id ON public.scores(resume_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id  ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created   ON public.scores(created_at DESC);

-- ─── Step 5: Verify ───────────────────────────────────────────────────────
SELECT 'Trigger recreated successfully' AS status;
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';
