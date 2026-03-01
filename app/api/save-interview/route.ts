import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, role, difficulty, interviewScore, totalQuestions, feedback, qaLog } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('interviews')
            .insert({
                user_id: userId,
                role: role || 'General',
                difficulty: difficulty || 'Medium',
                interview_score: Math.round(interviewScore || 0),
                total_questions: totalQuestions || 5,
                feedback: feedback || '',
                qa_log: qaLog || [],
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: data.id });
    } catch (err) {
        console.error('Save interview error:', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to save interview' },
            { status: 500 }
        );
    }
}
