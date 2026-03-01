import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

const GITHUB_API = 'https://api.github.com';

async function fetchGitHub(path: string) {
    const res = await fetch(`${GITHUB_API}${path}`, {
        headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
}

export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();
        if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

        // Fetch profile + repos in parallel
        const [profile, allRepos] = await Promise.all([
            fetchGitHub(`/users/${username}`),
            fetchGitHub(`/users/${username}/repos?sort=stars&per_page=30&type=public`),
        ]);

        // Top repos by stars
        const repos = (allRepos as Array<Record<string, unknown>>)
            .sort((a, b) => ((b.stargazers_count as number) || 0) - ((a.stargazers_count as number) || 0))
            .slice(0, 10)
            .map((r) => ({
                name: r.name,
                description: r.description || '',
                language: r.language || null,
                stars: r.stargazers_count || 0,
                forks: r.forks_count || 0,
                updated_at: r.updated_at,
                url: r.html_url,
                topics: r.topics || [],
            }));

        // Compute top languages
        const langCount: Record<string, number> = {};
        (allRepos as Array<Record<string, unknown>>).forEach((r) => {
            if (r.language) langCount[r.language as string] = (langCount[r.language as string] || 0) + 1;
        });
        const topLanguages = Object.entries(langCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([lang]) => lang);

        // Activity score based on recent updates + repo count
        const recentRepos = (allRepos as Array<Record<string, unknown>>).filter((r) => {
            const updated = new Date(r.updated_at as string);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return updated > sixMonthsAgo;
        }).length;

        const activityScore = Math.min(100, Math.round(
            (recentRepos / Math.max(profile.public_repos, 1)) * 60 +
            Math.min(profile.followers, 100) * 0.3 +
            10
        ));

        const projectQuality = Math.min(100, Math.round(
            repos.reduce((sum: number, r) => sum + (r.stars as number) * 2 + (r.forks as number), 0) / 10 +
            (repos.filter((r) => r.description).length / Math.max(repos.length, 1)) * 30 +
            20
        ));

        const consistencyScore = Math.min(100, Math.round(
            topLanguages.length * 10 +
            (profile.public_repos > 10 ? 30 : profile.public_repos * 3) +
            (recentRepos > 5 ? 40 : recentRepos * 5)
        ));

        const overallScore = Math.round((activityScore + projectQuality + consistencyScore) / 3);

        // AI analysis
        let aiAnalysis = {
            overall_score: overallScore,
            activity_score: activityScore,
            project_quality: projectQuality,
            consistency_score: consistencyScore,
            top_languages: topLanguages,
            strengths: [
                `Active GitHub profile with ${profile.public_repos} public repositories`,
                topLanguages.length > 0 ? `Strong expertise in ${topLanguages.slice(0, 2).join(' and ')}` : 'Diverse project experience',
                repos.some((r) => (r.stars as number) > 0) ? 'Projects receiving community recognition (stars)' : 'Hands-on project building experience',
            ],
            improvements: [
                'Add README files to all repositories with setup instructions',
                `Only ${repos.filter((r) => r.description).length}/${repos.length} repos have descriptions — add descriptions to all`,
                profile.followers < 10 ? 'Engage more with the open source community to grow your network' : 'Consider contributing to popular open source projects',
            ],
            resume_tips: [
                `Highlight your ${topLanguages[0] || 'primary'} projects with quantified impact (users, performance gains)`,
                'Star your best 3 projects and list them in your resume with GitHub links',
                'Add a GitHub profile README.md to showcase your skills and projects',
                `Your top repo "${repos[0]?.name || 'project'}" could be a strong portfolio highlight — add live demo link`,
            ],
        };

        // Optionally enhance with GPT
        if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai')) {
            try {
                const prompt = `You are a technical recruiter analyzing a GitHub profile for hiring.

Profile: ${profile.name || username}, ${profile.public_repos} repos, ${profile.followers} followers
Top languages: ${topLanguages.join(', ')}
Top repos: ${repos.slice(0, 5).map((r) => `${r.name} (${r.language || 'misc'}, ${r.stars}⭐)`).join(', ')}
Bio: ${profile.bio || 'none'}

Provide JSON with:
{
  "strengths": [3 specific strength observations],
  "improvements": [3 actionable improvement suggestions],
  "resume_tips": [4 specific resume tips based on their GitHub]
}`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }],
                    max_tokens: 600, temperature: 0.4,
                });
                const aiText = completion.choices[0]?.message?.content || '';
                const aiData = JSON.parse(aiText);
                aiAnalysis = { ...aiAnalysis, ...aiData };
            } catch {
                // keep the rule-based analysis
            }
        }

        return NextResponse.json({ profile, repos, aiAnalysis });
    } catch (err) {
        console.error('GitHub analyze error:', err);
        const msg = err instanceof Error ? err.message : 'Failed to analyze GitHub profile';
        if (msg.includes('GitHub API error: 404')) {
            return NextResponse.json({ error: 'GitHub user not found. Please check the username.' }, { status: 404 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
