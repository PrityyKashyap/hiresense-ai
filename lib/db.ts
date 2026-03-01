import { supabase } from '@/lib/supabase';
import type { AnalysisResult } from '@/lib/openai';

export interface ResumeRecord {
    id: string;
    user_id: string;
    file_name: string;
    resume_text: string;
    file_url?: string;
    uploaded_at: string;
}

export interface ScoreRecord {
    id: string;
    resume_id: string;
    job_id?: string;
    job_title?: string;
    job_description?: string;
    required_skills?: string[];
    match_score: number;
    experience_score: number;
    ats_score: number;
    keyword_density: number;
    missing_skills: string[];
    suggestions: string[];
    strengths: string[];
    skill_breakdown: Record<string, number>;
    feedback: Record<string, unknown>;
    created_at: string;
}

// ─── Resume CRUD ───────────────────────────────────────────────

export async function saveResume(
    userId: string,
    fileName: string,
    resumeText: string,
    fileUrl?: string
): Promise<ResumeRecord | null> {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .insert({ user_id: userId, file_name: fileName, resume_text: resumeText, file_url: fileUrl })
            .select()
            .single();
        if (error) throw error;
        return data as ResumeRecord;
    } catch (err) {
        console.warn('saveResume (demo mode):', err);
        return {
            id: `demo-${Date.now()}`, user_id: userId, file_name: fileName,
            resume_text: resumeText, uploaded_at: new Date().toISOString(),
        };
    }
}

export async function getUserResumes(userId: string): Promise<ResumeRecord[]> {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .order('uploaded_at', { ascending: false });
        if (error) throw error;
        return (data || []) as ResumeRecord[];
    } catch {
        return [];
    }
}

// ─── Score / Analysis CRUD ─────────────────────────────────────

export async function saveScore(
    resumeId: string,
    analysis: AnalysisResult,
    jobTitle?: string,
    jobDescription?: string,
    requiredSkills?: string[]
): Promise<ScoreRecord | null> {
    try {
        const { data, error } = await supabase
            .from('scores')
            .insert({
                resume_id: resumeId,
                job_title: jobTitle,
                job_description: jobDescription,
                required_skills: requiredSkills || [],
                match_score: analysis.skill_match,
                experience_score: analysis.experience_score,
                ats_score: analysis.ats_score,
                keyword_density: analysis.keyword_density,
                missing_skills: analysis.missing_skills,
                suggestions: analysis.suggestions,
                strengths: analysis.strengths,
                skill_breakdown: analysis.skill_breakdown,
                feedback: {},
            })
            .select()
            .single();
        if (error) throw error;
        return data as ScoreRecord;
    } catch (err) {
        console.warn('saveScore (demo mode):', err);
        return {
            id: `demo-score-${Date.now()}`,
            resume_id: resumeId,
            job_title: jobTitle,
            match_score: analysis.skill_match,
            experience_score: analysis.experience_score,
            ats_score: analysis.ats_score,
            keyword_density: analysis.keyword_density,
            missing_skills: analysis.missing_skills,
            suggestions: analysis.suggestions,
            strengths: analysis.strengths,
            skill_breakdown: analysis.skill_breakdown,
            feedback: {},
            created_at: new Date().toISOString(),
        };
    }
}

export async function getUserScores(userId: string): Promise<ScoreRecord[]> {
    try {
        const { data, error } = await supabase
            .from('scores')
            .select('*, resumes!inner(user_id, file_name)')
            .eq('resumes.user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []) as ScoreRecord[];
    } catch {
        return [];
    }
}

export async function getScoreById(scoreId: string): Promise<ScoreRecord | null> {
    try {
        const { data, error } = await supabase
            .from('scores')
            .select('*')
            .eq('id', scoreId)
            .single();
        if (error) throw error;
        return data as ScoreRecord;
    } catch {
        return null;
    }
}

// ─── Supabase Storage — PDF Upload ────────────────────────────

export async function uploadResumePDF(
    userId: string,
    file: File
): Promise<string | null> {
    try {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
            .from('resumes')
            .upload(path, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data } = supabase.storage.from('resumes').getPublicUrl(path);
        return data.publicUrl;
    } catch (err) {
        console.warn('uploadResumePDF (demo mode or no bucket):', err);
        return null;
    }
}

// ─── Job CRUD ─────────────────────────────────────────────────

export async function saveJob(
    companyId: string,
    title: string,
    jobDescription: string,
    requiredSkills: string[],
    experienceLevel: string
) {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .insert({ company_id: companyId, title, job_description: jobDescription, required_skills: requiredSkills, experience_level: experienceLevel })
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.warn('saveJob (demo mode):', err);
        return { id: `demo-job-${Date.now()}`, title, created_at: new Date().toISOString() };
    }
}

export async function getCompanyJobs(companyId: string) {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch {
        return [];
    }
}
