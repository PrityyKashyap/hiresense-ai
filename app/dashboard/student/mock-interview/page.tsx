'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Mic, MicOff, Send, Bot, User, RefreshCw, Play, ChevronRight, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const ROLES = [
    'Frontend Developer Intern', 'Backend Developer Intern', 'Full Stack Developer',
    'React Developer', 'Python Developer', 'Data Analyst', 'UI/UX Designer',
    'DevOps Intern', 'Machine Learning Intern', 'Android Developer',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

interface Message {
    role: 'ai' | 'user';
    content: string;
    timestamp: string;
    feedback?: string;
    score?: number;
}

export default function MockInterviewPage() {
    const [selectedRole, setSelectedRole] = useState('Frontend Developer Intern');
    const [difficulty, setDifficulty] = useState('Medium');
    const [started, setStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startInterview = async () => {
        setStarted(true);
        setMessages([]);
        setQuestionCount(0);
        setTotalScore(0);
        setLoading(true);

        try {
            const res = await fetch('/api/mock-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole, difficulty, action: 'start' }),
            });
            const data = await res.json();
            setMessages([{
                role: 'ai', content: data.question || MOCK_QUESTIONS[selectedRole]?.[0] || MOCK_QUESTIONS.default[0],
                timestamp: new Date().toLocaleTimeString(),
            }]);
            setQuestionCount(1);
        } catch {
            const q = MOCK_QUESTIONS[selectedRole]?.[0] || MOCK_QUESTIONS.default[0];
            setMessages([{ role: 'ai', content: q, timestamp: new Date().toLocaleTimeString() }]);
            setQuestionCount(1);
        } finally {
            setLoading(false);
        }
    };

    const sendAnswer = async () => {
        if (!userInput.trim() || loading) return;
        const answer = userInput.trim();
        setUserInput('');

        // Add user message
        const userMsg: Message = { role: 'user', content: answer, timestamp: new Date().toLocaleTimeString() };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await fetch('/api/mock-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole, difficulty, action: 'answer', answer, questionCount }),
            });
            const data = await res.json();

            const aiFeedback: Message = {
                role: 'ai',
                content: data.feedback || 'Good answer! Let\'s move to the next question.',
                feedback: data.evaluation,
                score: data.score,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, aiFeedback]);
            setTotalScore((prev) => prev + (data.score || 7));

            if (questionCount < 5 && data.nextQuestion) {
                setTimeout(() => {
                    setMessages((prev) => [...prev, {
                        role: 'ai', content: data.nextQuestion,
                        timestamp: new Date().toLocaleTimeString(),
                    }]);
                    setQuestionCount((prev) => prev + 1);
                }, 1000);
            }
        } catch {
            // Demo fallback
            const mockFeedback = `Good attempt! Your answer shows ${difficulty === 'Easy' ? 'basic' : 'solid'} understanding. Focus on being more specific with examples. Score: 7/10`;
            setMessages((prev) => [...prev, { role: 'ai', content: mockFeedback, score: 7, timestamp: new Date().toLocaleTimeString() }]);
            setTotalScore((prev) => prev + 7);

            if (questionCount < 5) {
                const nextQ = (MOCK_QUESTIONS[selectedRole] || MOCK_QUESTIONS.default)[questionCount] || MOCK_QUESTIONS.default[0];
                setTimeout(() => {
                    setMessages((prev) => [...prev, { role: 'ai', content: nextQ, timestamp: new Date().toLocaleTimeString() }]);
                    setQuestionCount((prev) => prev + 1);
                }, 1000);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleVoice = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error('Voice input not supported in this browser. Use Chrome for best experience.');
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new SpeechRecognitionAPI() as any;
        recognition.lang = 'en-IN';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            setUserInput(event.results[0][0].transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        if (!isListening) { recognition.start(); setIsListening(true); }
        else { recognition.stop(); setIsListening(false); }
    };

    const avgScore = questionCount > 0 ? Math.round((totalScore / Math.max(questionCount - 1, 1)) * 10) : 0;

    const saveInterviewResult = async (finalScore: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await fetch('/api/save-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id, role: selectedRole, difficulty,
                    interviewScore: finalScore, totalQuestions: 5,
                    feedback: `Completed ${selectedRole} interview at ${difficulty} level.`,
                    qaLog: messages.map((m) => ({ role: m.role, content: m.content, score: m.score })),
                }),
            });
            toast.success('Interview result saved! 💾');
        } catch { /* non-fatal */ }
    };

    if (!started) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <DashboardSidebar role="student" />
                <main style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}>
                                <Brain size={32} color="white" />
                            </div>
                            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>AI Mock Interview</h1>
                            <p style={{ color: '#9d9db8', fontSize: '15px' }}>Practice with an AI interviewer · Get instant feedback on every answer</p>
                        </div>

                        <div className="glass" style={{ padding: '32px', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Role</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {ROLES.map((r) => (
                                        <button key={r} onClick={() => setSelectedRole(r)} style={{
                                            padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                                            border: selectedRole === r ? '2px solid #8b5cf6' : '1px solid rgba(139,92,246,0.2)',
                                            background: selectedRole === r ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
                                            color: selectedRole === r ? '#a78bfa' : '#9d9db8', fontWeight: 500, fontSize: '13px', transition: 'all 0.2s',
                                        }}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {DIFFICULTIES.map((d) => (
                                        <button key={d} onClick={() => setDifficulty(d)} style={{
                                            padding: '10px', borderRadius: '10px', cursor: 'pointer',
                                            border: difficulty === d ? `2px solid ${d === 'Easy' ? '#10b981' : d === 'Medium' ? '#f59e0b' : '#ef4444'}` : '1px solid rgba(139,92,246,0.2)',
                                            background: difficulty === d ? `${d === 'Easy' ? '#10b981' : d === 'Medium' ? '#f59e0b' : '#ef4444'}15` : 'rgba(255,255,255,0.02)',
                                            color: difficulty === d ? (d === 'Easy' ? '#34d399' : d === 'Medium' ? '#fbbf24' : '#f87171') : '#9d9db8',
                                            fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                                        }}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(139,92,246,0.05)' }}>
                            <p style={{ fontSize: '13px', color: '#9d9db8', lineHeight: 1.6 }}>
                                <strong style={{ color: '#a78bfa' }}>How it works:</strong> You&apos;ll answer 5 realistic interview questions for your chosen role. The AI evaluates each answer and provides instant feedback with scores. Voice input supported!
                            </p>
                        </div>

                        <button onClick={startInterview} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px' }}>
                            <Play size={18} /> Start Interview for {selectedRole}
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="student" />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>AI Mock Interview</h1>
                        <p style={{ color: '#9d9db8', fontSize: '13px' }}>{selectedRole} · {difficulty} · Q{Math.min(questionCount, 5)}/5</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {questionCount > 1 && (
                            <div className="glass" style={{ padding: '8px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: avgScore >= 70 ? '#34d399' : avgScore >= 50 ? '#fbbf24' : '#f87171' }}>{avgScore}</div>
                                <div style={{ fontSize: '10px', color: '#6b6b8a' }}>AVG SCORE</div>
                            </div>
                        )}
                        <button onClick={() => setStarted(false)} className="btn-secondary" style={{ fontSize: '13px' }}>
                            <RefreshCw size={14} /> Restart
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div className="progress-bar" style={{ marginBottom: '20px' }}>
                    <div className="progress-fill" style={{ width: `${(Math.min(questionCount, 5) / 5) * 100}%` }} />
                </div>

                {/* Chat window */}
                <div className="glass" style={{ flex: 1, padding: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            {msg.role === 'ai' && (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot size={16} color="white" />
                                </div>
                            )}
                            <div style={{ maxWidth: '75%' }}>
                                <div style={{
                                    padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.04)',
                                    border: msg.role === 'ai' ? '1px solid rgba(139,92,246,0.2)' : 'none',
                                    fontSize: '14px', lineHeight: 1.6, color: '#f1f0ff',
                                }}>
                                    {msg.content}
                                </div>
                                {msg.score && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                        <div className={`badge ${msg.score >= 8 ? 'badge-green' : msg.score >= 6 ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '11px' }}>
                                            Score: {msg.score}/10
                                        </div>
                                    </div>
                                )}
                                <div style={{ fontSize: '11px', color: '#6b6b8a', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.timestamp}</div>
                            </div>
                            {msg.role === 'user' && (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User size={16} color="#a78bfa" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: `pulse-glow 1s ease-in-out ${i * 0.2}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                {questionCount <= 5 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={toggleVoice} className={isListening ? 'btn-primary' : 'btn-secondary'} style={{ padding: '12px', flexShrink: 0 }} title="Voice input">
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <input
                            className="input-dark" placeholder="Type your answer here... (or use mic)" value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAnswer()}
                            style={{ flex: 1 }}
                        />
                        <button onClick={sendAnswer} disabled={loading || !userInput.trim()} className="btn-primary" style={{ padding: '12px 20px', flexShrink: 0 }}>
                            <Send size={18} />
                        </button>
                    </div>
                )}
                {questionCount > 5 && (
                    <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Interview Complete! 🎉</h2>
                        <p style={{ color: '#9d9db8', marginBottom: '16px' }}>Average score: <strong style={{ color: avgScore >= 70 ? '#34d399' : '#fbbf24' }}>{avgScore}/100</strong></p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button onClick={() => saveInterviewResult(avgScore)} className="btn-secondary" style={{ fontSize: '14px' }}>
                                💾 Save Result
                            </button>
                            <button onClick={() => setStarted(false)} className="btn-primary">
                                <RefreshCw size={16} /> Try Another Role <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Fallback questions per role
const MOCK_QUESTIONS: Record<string, string[]> = {
    'Frontend Developer Intern': [
        'Tell me about yourself and why you want to be a Frontend Developer.',
        'What is the difference between `var`, `let`, and `const` in JavaScript?',
        'Explain the concept of the Virtual DOM in React and why it is beneficial.',
        'How would you optimize a web page that loads slowly?',
        'Describe a project you built and what you learned from it.',
    ],
    'Backend Developer Intern': [
        'Tell me about yourself and your backend development experience.',
        'What is REST API? Can you explain the difference between GET and POST requests?',
        'How does authentication work? Explain JWT tokens.',
        'What is a database index and why is it useful?',
        'Explain the difference between SQL and NoSQL databases.',
    ],
    default: [
        'Tell me about yourself and your technical background.',
        'What are your strongest technical skills and how did you develop them?',
        'Describe a challenging project you worked on and how you solved problems.',
        'Where do you see yourself in 2 years? What skills do you want to develop?',
        'Why are you interested in this role and company?',
    ],
};
