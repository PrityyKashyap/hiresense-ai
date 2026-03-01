import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisResult {
    skill_match: number;
    experience_score: number;
    ats_score: number;
    missing_skills: string[];
    suggestions: string[];
    skill_breakdown: {
        technical: number;
        communication: number;
        projects: number;
        education: number;
    };
    strengths: string[];
    keyword_density: number;
}

export const ANALYSIS_PROMPT = (
    resumeText: string,
    jobDescription: string,
    requiredSkills: string[]
) => `
You are an expert ATS (Applicant Tracking System) and HR analyst. Analyze the following resume against the job description and required skills.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS: ${requiredSkills.join(', ')}

Provide a detailed analysis in the following JSON format (no markdown, pure JSON):
{
  "skill_match": <0-100 integer, how well resume skills match required skills>,
  "experience_score": <0-100 integer, relevance and depth of experience>,
  "ats_score": <0-100 integer, overall ATS compatibility score>,
  "missing_skills": [<list of important skills from job description missing in resume>],
  "suggestions": [<5-7 specific, actionable resume improvement suggestions>],
  "skill_breakdown": {
    "technical": <0-100>,
    "communication": <0-100>,
    "projects": <0-100>,
    "education": <0-100>
  },
  "strengths": [<3-5 strong points from the resume>],
  "keyword_density": <0-100, how well keywords are used>
}

Be precise, fair, and constructive. Base scores on actual content match.
`;
