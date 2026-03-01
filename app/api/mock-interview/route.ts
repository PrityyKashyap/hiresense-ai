import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

const MOCK_QUESTIONS: Record<string, string[]> = {
    'Frontend Developer Intern': [
        'Tell me about yourself and why you want to be a Frontend Developer.',
        'What is the difference between `var`, `let`, and `const` in JavaScript?',
        'Explain the concept of the Virtual DOM in React and why it is beneficial.',
        'How would you optimize a web page that loads slowly?',
        'Describe a project you built and what you learned from it.',
    ],
    default: [
        'Tell me about yourself and your technical background.',
        'What are your strongest technical skills and how did you develop them?',
        'Describe a challenging project you worked on and how you solved problems.',
        'Where do you see yourself in 2 years? What skills do you want to develop?',
        'Why are you interested in this role?',
    ],
};

function getQuestion(role: string, index: number): string {
    const questions = MOCK_QUESTIONS[role] || MOCK_QUESTIONS.default;
    return questions[index] || questions[0];
}

export async function POST(request: NextRequest) {
    try {
        const { role, difficulty, action, answer, questionCount } = await request.json();

        const useAI = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai');

        if (action === 'start') {
            if (useAI) {
                try {
                    const completion = await openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{
                            role: 'user',
                            content: `You are an interviewer for a ${role} position. Ask the first ${difficulty}-level interview question. Be concise. Only output the question, no preamble.`,
                        }],
                        max_tokens: 200, temperature: 0.7,
                    });
                    return NextResponse.json({ question: completion.choices[0]?.message?.content });
                } catch {
                    // fall through to mock
                }
            }
            return NextResponse.json({ question: getQuestion(role, 0) });
        }

        if (action === 'answer') {
            const nextQ = getQuestion(role, questionCount);

            if (useAI) {
                try {
                    const completion = await openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{
                            role: 'user',
                            content: `You are an expert technical interviewer evaluating a candidate for ${role} (${difficulty} level).

Candidate's answer: "${answer}"

Provide a JSON response with:
{
  "score": <1-10 integer>,
  "evaluation": "<2-3 sentence evaluation>",
  "feedback": "<encouraging feedback + 1 tip>",
  "nextQuestion": "<next interview question>"
}

Be fair, constructive, and professional. Score 8-10 for excellent, 5-7 for good, 1-4 for needs improvement.`,
                        }],
                        max_tokens: 400, temperature: 0.4,
                    });
                    const content = completion.choices[0]?.message?.content || '';
                    const parsed = JSON.parse(content);
                    return NextResponse.json(parsed);
                } catch {
                    // fall through
                }
            }

            // Mock fallback
            const score = answer.length > 100 ? 8 : answer.length > 50 ? 6 : 4;
            return NextResponse.json({
                score,
                evaluation: `Your answer shows ${score >= 7 ? 'good' : 'basic'} understanding of the topic.`,
                feedback: score >= 7
                    ? 'Great answer! You covered the key concepts clearly. Consider adding a real-world example next time.'
                    : `Good start! Try to be more specific and include examples from your projects. Structure: what it is → how it works → when to use it.`,
                nextQuestion: questionCount < 5 ? nextQ : 'That concludes the interview. Great effort!',
            });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Interview API error' }, { status: 500 });
    }
}
