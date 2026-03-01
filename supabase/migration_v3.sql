-- HireSense AI — Migration v3
-- Run this in Supabase SQL Editor after schema.sql + migration_v2.sql

-- ─── Interviews table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  interview_score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 5,
  feedback TEXT,
  qa_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── GitHub analysis table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  repo_count INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  github_score INTEGER DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  top_languages TEXT[] DEFAULT '{}',
  summary TEXT,
  resume_tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE github_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own github analysis" ON github_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own github analysis" ON github_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Candidate rankings table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score INTEGER DEFAULT 0,
  ats_score INTEGER DEFAULT 0,
  github_score INTEGER DEFAULT 0,
  interview_score INTEGER DEFAULT 0,
  skill_match_breakdown JSONB DEFAULT '{}',
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidate_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies can view rankings for own jobs" ON candidate_rankings FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = candidate_rankings.job_id AND jobs.company_id = auth.uid()));
CREATE POLICY "Service role can insert rankings" ON candidate_rankings FOR INSERT WITH CHECK (true);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_github_analysis_user_id ON github_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_job_id ON candidate_rankings(job_id);

SELECT 'Migration v3 complete ✅' AS status;
