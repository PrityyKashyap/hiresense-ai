import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
    try {
        const { jobDescription, jobTitle, requiredSkills, jobId } = await request.json();

        // Fetch all candidates with their latest scores
        const { data: candidates, error } = await supabase
            .from('profiles')
            .select(`
        id, name, email,
        resumes!inner(
          id,
          scores(ats_score, match_score, experience_score, missing_skills, strengths, skill_breakdown, job_title, created_at)
        ),
        interviews(interview_score, role, created_at),
        github_analysis(github_score, username, top_languages, activity_score, created_at)
      `)
            .eq('role', 'student')
            .limit(100);

        if (error) {
            // Demo fallback if tables don't exist yet
            return NextResponse.json({ candidates: getDemoCandidates(requiredSkills || []) });
        }

        if (!candidates || candidates.length === 0) {
            return NextResponse.json({ candidates: getDemoCandidates(requiredSkills || []) });
        }

        // Build candidate summaries for AI ranking
        const summaries = candidates.map((c) => {
            const latestScore = (c.resumes?.[0]?.scores || []).sort(
                (a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            const latestInterview = (c.interviews || []).sort(
                (a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            const latestGitHub = (c.github_analysis || []).sort(
                (a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            return {
                id: c.id,
                name: c.name || 'Anonymous',
                ats_score: latestScore?.ats_score || 0,
                skill_match: latestScore?.match_score || 0,
                experience_score: latestScore?.experience_score || 0,
                missing_skills: latestScore?.missing_skills || [],
                strengths: latestScore?.strengths || [],
                interview_score: latestInterview?.interview_score || 0,
                github_score: latestGitHub?.github_score || 0,
                top_languages: latestGitHub?.top_languages || [],
                github_username: latestGitHub?.username || '',
                match_score: 0,
                matched_skills: latestScore?.strengths || [],
                ai_summary: '',
            };
        }).filter((c) => c.ats_score > 0 || c.interview_score > 0 || c.github_score > 0);

        if (summaries.length === 0) {
            return NextResponse.json({ candidates: getDemoCandidates(requiredSkills || []) });
        }

        // Use GPT-4o-mini to rank candidates
        let rankedCandidates = summaries;
        try {
            const prompt = `You are an AI hiring assistant. Rank the following candidates for this job:

Job Title: ${jobTitle || 'Software Developer'}
Job Description: ${jobDescription || 'Looking for a skilled developer'}
Required Skills: ${(requiredSkills || []).join(', ')}

Candidates:
${summaries.map((c, i) => `${i + 1}. ${c.name} | ATS: ${c.ats_score}/100 | Skill Match: ${c.skill_match}/100 | Interview: ${c.interview_score}/100 | GitHub: ${c.github_score}/100 | Languages: ${c.top_languages.join(', ')} | Strengths: ${c.strengths.join(', ')}`).join('\n')}

Return a JSON array ranking ALL candidates from best to worst match. For each, include:
- id (from the candidate)
- match_score (0-100, your overall assessment)
- matched_skills (array of skills they likely have)
- missing_skills (key missing skills for THIS job)
- ai_summary (1-2 sentence recruiter-facing summary)

Return ONLY the JSON array, no markdown.`;

            const resp = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1500,
            });

            const raw = resp.choices[0].message.content?.trim() || '[]';
            const aiRanked = JSON.parse(raw.replace(/```json\n?|```/g, ''));

            rankedCandidates = aiRanked.map((r: { id: string; match_score: number; matched_skills: string[]; missing_skills: string[]; ai_summary: string }) => {
                const base = summaries.find((c) => c.id === r.id) || summaries[0];
                return { ...base, ...r };
            });
        } catch {
            // Fallback: simple score-based ranking
            rankedCandidates = summaries
                .map((c) => ({
                    ...c,
                    match_score: Math.round((c.ats_score * 0.4) + (c.skill_match * 0.3) + (c.interview_score * 0.2) + (c.github_score * 0.1)),
                    matched_skills: c.strengths,
                    ai_summary: `${c.name} has an ATS score of ${c.ats_score}/100 with ${c.interview_score > 0 ? `interview score ${c.interview_score}/100` : 'no interview data'}.`,
                }))
                .sort((a, b) => b.match_score - a.match_score);
        }

        // Optionally save to candidate_rankings table
        if (jobId) {
            try {
                await supabase.from('candidate_rankings').insert(
                    rankedCandidates.map((c) => ({
                        job_id: jobId,
                        candidate_id: c.id,
                        match_score: c.match_score,
                        ats_score: c.ats_score,
                        github_score: c.github_score,
                        interview_score: c.interview_score,
                        matched_skills: c.matched_skills || [],
                        missing_skills: c.missing_skills || [],
                        ai_summary: c.ai_summary || '',
                    }))
                );
            } catch { /* non-fatal */ }
        }

        return NextResponse.json({ candidates: rankedCandidates });
    } catch (err) {
        console.error('Shortlist error:', err);
        return NextResponse.json({ candidates: getDemoCandidates([]) });
    }
}

function getDemoCandidates(requiredSkills: string[]) {
    return [
        { id: '1', name: 'Arjun Sharma', ats_score: 88, skill_match: 92, interview_score: 78, github_score: 85, match_score: 87, top_languages: ['TypeScript', 'React', 'Node.js'], matched_skills: requiredSkills.slice(0, 3), missing_skills: ['Docker'], ai_summary: 'Strong frontend profile with excellent ATS score and solid interview performance.', github_username: 'arjun-dev' },
        { id: '2', name: 'Priya Nair', ats_score: 82, skill_match: 78, interview_score: 90, github_score: 70, match_score: 81, top_languages: ['Python', 'Django', 'React'], matched_skills: requiredSkills.slice(0, 2), missing_skills: ['TypeScript', 'AWS'], ai_summary: 'Outstanding interview performance. Strong backend skills with Python.', github_username: 'priya-codes' },
        { id: '3', name: 'Rohit Verma', ats_score: 75, skill_match: 85, interview_score: 65, github_score: 92, match_score: 77, top_languages: ['JavaScript', 'Vue', 'Go'], matched_skills: requiredSkills.slice(1, 3), missing_skills: ['Testing', 'CI/CD'], ai_summary: 'Impressive GitHub profile with high-quality open source projects.', github_username: 'rohit-v' },
        { id: '4', name: 'Sneha Patel', ats_score: 70, skill_match: 72, interview_score: 72, github_score: 68, match_score: 71, top_languages: ['React', 'CSS', 'Node.js'], matched_skills: requiredSkills.slice(0, 1), missing_skills: ['System Design', 'Cloud'], ai_summary: 'Well-rounded candidate with consistent scores across all areas.', github_username: 'sneha-p' },
        { id: '5', name: 'Kunal Mehta', ats_score: 65, skill_match: 60, interview_score: 58, github_score: 75, match_score: 64, top_languages: ['Java', 'Spring', 'React'], matched_skills: [], missing_skills: requiredSkills.slice(0, 2), ai_summary: 'Good GitHub activity. May need upskilling in some required areas.', github_username: 'kunal-m' },
    ];
}
