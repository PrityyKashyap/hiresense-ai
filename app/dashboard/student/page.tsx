'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import ScoreGauge from '@/components/ScoreGauge';
import Link from 'next/link';
import { Upload, FileText, TrendingUp, Zap, ArrowRight, Clock, MessageSquare, Github, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MOCK_HISTORY = [
    { id: '1', jobTitle: 'Frontend Developer Intern', ats: 82, match: 78, date: '2025-02-24' },
    { id: '2', jobTitle: 'React Developer', ats: 71, match: 65, date: '2025-02-22' },
    { id: '3', jobTitle: 'UI/UX Designer', ats: 58, match: 52, date: '2025-02-20' },
];

export default function StudentDashboard() {
    const [latestATS, setLatestATS] = useState(82);
    const [latestMatch, setLatestMatch] = useState(78);
    const [interviewScore, setInterviewScore] = useState(0);
    const [githubScore, setGithubScore] = useState(0);
    const [latestJob, setLatestJob] = useState('Frontend Developer Intern');

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch latest ATS score
                const { data: resumes } = await supabase
                    .from('resumes')
                    .select('id, scores(ats_score, match_score, job_title, created_at)')
                    .eq('user_id', user.id)
                    .limit(1);

                if (resumes?.[0]?.scores?.[0]) {
                    const s = resumes[0].scores[0] as { ats_score: number; match_score: number; job_title: string };
                    setLatestATS(s.ats_score || 82);
                    setLatestMatch(s.match_score || 78);
                    if (s.job_title) setLatestJob(s.job_title);
                }

                // Fetch latest interview score
                const { data: interviews } = await supabase
                    .from('interviews')
                    .select('interview_score')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (interviews?.[0]) setInterviewScore(interviews[0].interview_score || 0);

                // Fetch latest GitHub score
                const { data: github } = await supabase
                    .from('github_analysis')
                    .select('github_score')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (github?.[0]) setGithubScore(github[0].github_score || 0);
            } catch {
                // Show mock data if DB not ready
            }
        };
        fetchScores();
    }, []);

    const latest = MOCK_HISTORY[0];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f6ff' }}>
            <DashboardSidebar role="student" />

            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>Student Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Track your resume performance and skill growth</p>
                </div>

                {/* 3 Score Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { label: 'ATS Score', value: latestATS, icon: <FileText size={20} />, color: '#3b82f6', desc: 'Resume scan score', href: '/dashboard/student/analyze' },
                        { label: 'Interview Score', value: interviewScore, icon: <MessageSquare size={20} />, color: '#6366f1', desc: interviewScore > 0 ? 'Last mock interview' : 'No interview yet', href: '/dashboard/student/mock-interview' },
                        { label: 'GitHub Score', value: githubScore, icon: <Github size={20} />, color: '#10b981', desc: githubScore > 0 ? 'Profile analyzed' : 'Not analyzed yet', href: '/dashboard/student/github-analyzer' },
                    ].map(({ label, value, icon, color, desc, href }) => (
                        <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                            <div className="glass glass-hover" style={{ padding: '22px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
                                    {value > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444', background: value >= 75 ? 'rgba(16,185,129,0.1)' : value >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: 20 }}>
                                        {value >= 75 ? '🟢 Good' : value >= 50 ? '🟡 Fair' : '🔴 Low'}
                                    </div>}
                                </div>
                                <div style={{ fontSize: value > 0 ? 32 : 22, fontWeight: 900, color: value > 0 ? color : '#94a3b8', marginBottom: 4 }}>
                                    {value > 0 ? value : '—'}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{label}</div>
                                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick action cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                    {[
                        { icon: <Upload size={20} />, title: 'Analyze Resume', desc: 'Get your ATS score instantly', href: '/dashboard/student/analyze', color: '#8b5cf6', badge: 'NEW' },
                        { icon: <FileText size={20} />, title: 'Scan History', desc: `${MOCK_HISTORY.length} previous scans`, href: '/dashboard/student/history', color: '#3b82f6', badge: null },
                        { icon: <TrendingUp size={20} />, title: 'Skill Roadmap', desc: 'Close your skill gaps', href: '/dashboard/student/analyze', color: '#10b981', badge: 'SOON' },
                    ].map((card) => (
                        <Link key={card.href + card.title} href={card.href} style={{ textDecoration: 'none' }}>
                            <div className="glass glass-hover" style={{ padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                                {card.badge && (
                                    <span className={`badge ${card.badge === 'NEW' ? 'badge-purple' : 'badge-yellow'}`} style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px' }}>
                                        {card.badge}
                                    </span>
                                )}
                                <div style={{ width: 40, height: 40, borderRadius: '12px', marginBottom: '12px', background: `${card.color}20`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                    {card.icon}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>{card.title}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{card.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Latest score + CTA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                    {/* Latest result card */}
                    <div className="glass" style={{ padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Latest Analysis</h2>
                            <span className="badge badge-green" style={{ fontSize: '11px' }}>
                                <Clock size={10} /> {latest.date}
                            </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{latestJob}</div>
                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '20px' }}>
                            <ScoreGauge score={latestATS} label="ATS Score" size={110} />
                            <ScoreGauge score={latestMatch} label="Skill Match" size={110} color="#3b82f6" />
                        </div>
                        <Link href={`/dashboard/student/results/${latest.id}`} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '10px' }}>
                            View Full Report <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Run new analysis CTA */}
                    <div className="glass" style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <div style={{ width: 60, height: 60, borderRadius: '18px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59,130,246,0.35)' }}>
                            <Zap size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Run New Analysis</h3>
                            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>Upload your resume and paste a new job description to get your updated ATS score and skill gaps.</p>
                        </div>
                        <Link href="/dashboard/student/analyze" className="btn-primary" style={{ fontSize: '14px' }}>
                            Start Analysis <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Recent scans */}
                <div className="glass" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Recent Scans</h2>
                        <Link href="/dashboard/student/history" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {MOCK_HISTORY.map((item) => (
                            <Link key={item.id} href={`/dashboard/student/results/${item.id}`} style={{
                                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 16px', borderRadius: '10px', background: 'rgba(59,130,246,0.03)',
                                border: '1px solid rgba(59,130,246,0.10)', transition: 'all 0.2s',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.03)'}
                            >
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{item.jobTitle}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: item.ats >= 75 ? '#10b981' : item.ats >= 50 ? '#f59e0b' : '#ef4444' }}>{item.ats}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ATS</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>{item.match}%</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Match</div>
                                    </div>
                                    <ArrowRight size={16} color="#94a3b8" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
