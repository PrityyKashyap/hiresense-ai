-- HireSense AI — Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'company')) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'entry',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores / Analysis Results
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  job_title TEXT,
  job_description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  match_score INTEGER DEFAULT 0,
  experience_score INTEGER DEFAULT 0,
  ats_score INTEGER DEFAULT 0,
  keyword_density INTEGER DEFAULT 0,
  missing_skills TEXT[] DEFAULT '{}',
  suggestions TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  skill_breakdown JSONB DEFAULT '{}',
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Companies can insert jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Companies can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "Companies can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = company_id);

-- Scores policies
CREATE POLICY "Users can view scores for own resumes" ON scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM resumes WHERE resumes.id = scores.resume_id AND resumes.user_id = auth.uid()));
CREATE POLICY "Users can insert scores" ON scores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM resumes WHERE resumes.id = scores.resume_id AND resumes.user_id = auth.uid())
);
CREATE POLICY "Companies can view scores for their jobs" ON scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = scores.job_id AND jobs.company_id = auth.uid()));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
