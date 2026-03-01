import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, username, repoCount, followers, githubScore, activityScore, qualityScore, consistencyScore, topLanguages, summary, resumeTips } = body;

        if (!userId || !username) {
            return NextResponse.json({ error: 'userId and username required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('github_analysis')
            .insert({
                user_id: userId,
                username,
                repo_count: repoCount || 0,
                followers: followers || 0,
                github_score: githubScore || 0,
                activity_score: activityScore || 0,
                quality_score: qualityScore || 0,
                consistency_score: consistencyScore || 0,
                top_languages: topLanguages || [],
                summary: summary || '',
                resume_tips: resumeTips || [],
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: data.id });
    } catch (err) {
        console.error('Save GitHub analysis error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to save GitHub analysis' },
            { status: 500 }
        );
    }
}
