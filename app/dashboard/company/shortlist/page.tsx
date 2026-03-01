'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Zap, BrainCircuit, Search, ArrowRight, Trophy, ChevronRight, Github, MessageSquare, FileText, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface RankedCandidate {
    id: string;
    name: string;
    ats_score: number;
    skill_match?: number;
    interview_score: number;
    github_score: number;
    match_score: number;
    top_languages: string[];
    matched_skills: string[];
    missing_skills: string[];
    ai_summary?: string;
    github_username?: string;
}

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#cd7c3a'];

export default function ShortlistPage() {
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
    const [done, setDone] = useState(false);

    const handleShortlist = async () => {
        if (!jobTitle || !jobDescription) {
            toast.error('Please fill in the job title and description');
            return;
        }
        setLoading(true);
        setDone(false);
        try {
            const res = await fetch('/api/shortlist-candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle,
                    jobDescription,
                    requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
                }),
            });
            const data = await res.json();
            setCandidates(data.candidates || []);
            setDone(true);
            toast.success(`Ranked ${data.candidates?.length || 0} candidates with AI! 🎯`);
        } catch {
            toast.error('Shortlisting failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getMedalLabel = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f6ff' }}>
            <DashboardSidebar role="company" />
            <div style={{ marginLeft: 260, flex: 1, padding: '32px' }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>
                        <BrainCircuit size={13} /> AI-Powered Candidate Ranking
                    </div>
                    <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a' }}>AI Candidate Shortlist</h1>
                    <p style={{ color: '#64748b', marginTop: 6 }}>Paste a job description — our AI ranks your entire candidate pool by fit.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: done ? '1fr 1.6fr' : '1fr', gap: 24, alignItems: 'start' }}>
                    {/* Input form */}
                    <div className="glass" style={{ padding: 28 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Job Details</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: '#475569', fontWeight: 500, display: 'block', marginBottom: 6 }}>Job Title *</label>
                                <input className="input-dark" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Frontend Developer Intern" />
                            </div>

                            <div>
                                <label style={{ fontSize: 13, color: '#475569', fontWeight: 500, display: 'block', marginBottom: 6 }}>Required Skills</label>
                                <input className="input-dark" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)}
                                    placeholder="React, TypeScript, Node.js, Git" />
                                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Comma-separated</p>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, color: '#475569', fontWeight: 500, display: 'block', marginBottom: 6 }}>Job Description *</label>
                                <textarea className="input-dark" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="We are looking for a passionate frontend developer with strong React skills..."
                                    rows={7} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                            </div>

                            <button onClick={handleShortlist} disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '13px' }}>
                                {loading ? (
                                    <><span className="spinner" /> AI is ranking candidates...</>
                                ) : (
                                    <><Zap size={16} /> Rank Candidates with AI <ArrowRight size={15} /></>
                                )}
                            </button>
                        </div>

                        {/* How it works */}
                        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.12)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>HOW IT WORKS</div>
                            {['Extract required skills from your JD', 'Compare against all candidates\' ATS, interview & GitHub scores', 'GPT-4o ranks each candidate and generates a recruiter summary'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, fontSize: 12, color: '#475569' }}>
                                    <span style={{ minWidth: 18, height: 18, background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    {done && (
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                                {candidates.length} Candidates Ranked
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {candidates.map((c, i) => (
                                    <div key={c.id} className="glass glass-hover" style={{ padding: '18px 20px', borderLeft: i < 3 ? `4px solid ${MEDAL_COLORS[i]}` : '4px solid transparent' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                            {/* Rank */}
                                            <div style={{ fontSize: i < 3 ? 22 : 14, fontWeight: 900, color: i < 3 ? MEDAL_COLORS[i] : '#94a3b8', minWidth: 28 }}>
                                                {getMedalLabel(i)}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 16 }}>{c.name}</div>
                                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                                            {c.top_languages.slice(0, 3).map((l) => (
                                                                <span key={l} className="tag" style={{ fontSize: 11, padding: '2px 8px' }}>{l}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 10, padding: '6px 14px', color: 'white' }}>
                                                        <div style={{ fontSize: 20, fontWeight: 900 }}>{c.match_score}%</div>
                                                        <div style={{ fontSize: 10, opacity: 0.85 }}>Match</div>
                                                    </div>
                                                </div>

                                                {/* Scores */}
                                                <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                                                    {[
                                                        { icon: <FileText size={12} />, label: 'ATS', val: c.ats_score },
                                                        { icon: <MessageSquare size={12} />, label: 'Interview', val: c.interview_score },
                                                        { icon: <Github size={12} />, label: 'GitHub', val: c.github_score },
                                                    ].map(({ icon, label, val }) => (
                                                        <div key={label} style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: '#64748b' }}>
                                                            {icon} {label}: <strong style={{ color: '#334155' }}>{val > 0 ? val : '—'}</strong>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* AI summary */}
                                                {c.ai_summary && (
                                                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 10, display: 'flex', gap: 6 }}>
                                                        <Star size={12} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                                                        {c.ai_summary}
                                                    </p>
                                                )}

                                                {/* Matched skills chips */}
                                                {c.matched_skills.length > 0 && (
                                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                        {c.matched_skills.map((s) => (
                                                            <span key={s} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ {s}</span>
                                                        ))}
                                                        {c.missing_skills.slice(0, 2).map((s) => (
                                                            <span key={s} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✗ {s}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
