'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Search, Filter, X, Github, MessageSquare, FileText, Star, ChevronDown, ExternalLink, TrendingUp, Award, AlertCircle } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    email?: string;
    ats_score: number;
    skill_match: number;
    interview_score: number;
    github_score: number;
    match_score?: number;
    top_languages: string[];
    matched_skills: string[];
    missing_skills: string[];
    ai_summary?: string;
    github_username?: string;
}

const DEMO_CANDIDATES: Candidate[] = [
    { id: '1', name: 'Arjun Sharma', email: 'arjun@email.com', ats_score: 88, skill_match: 92, interview_score: 78, github_score: 85, match_score: 87, top_languages: ['TypeScript', 'React', 'Node.js'], matched_skills: ['React', 'TypeScript', 'REST APIs'], missing_skills: ['Docker', 'Kubernetes'], ai_summary: 'Strong frontend profile with excellent ATS score. Highly recommended for React roles.', github_username: 'arjun-dev' },
    { id: '2', name: 'Priya Nair', email: 'priya@email.com', ats_score: 82, skill_match: 78, interview_score: 90, github_score: 70, match_score: 81, top_languages: ['Python', 'Django', 'React'], matched_skills: ['Python', 'REST APIs'], missing_skills: ['TypeScript', 'AWS'], ai_summary: 'Outstanding interview performance. Strong backend + Python skills.', github_username: 'priya-codes' },
    { id: '3', name: 'Rohit Verma', email: 'rohit@email.com', ats_score: 75, skill_match: 85, interview_score: 65, github_score: 92, match_score: 77, top_languages: ['JavaScript', 'Vue', 'Go'], matched_skills: ['JavaScript', 'TypeScript'], missing_skills: ['Testing', 'CI/CD'], ai_summary: 'Impressive GitHub — high-quality open source projects and strong commit history.', github_username: 'rohit-v' },
    { id: '4', name: 'Sneha Patel', email: 'sneha@email.com', ats_score: 70, skill_match: 72, interview_score: 72, github_score: 68, match_score: 71, top_languages: ['React', 'CSS', 'Node.js'], matched_skills: ['React', 'Node.js'], missing_skills: ['System Design', 'Cloud'], ai_summary: 'Well-rounded candidate. Consistent across ATS, interview, and GitHub.', github_username: 'sneha-p' },
    { id: '5', name: 'Kunal Mehta', email: 'kunal@email.com', ats_score: 65, skill_match: 60, interview_score: 58, github_score: 75, match_score: 64, top_languages: ['Java', 'Spring', 'React'], matched_skills: ['Java'], missing_skills: ['React', 'TypeScript', 'Node.js'], ai_summary: 'Good GitHub activity. Some upskilling needed in required areas.', github_username: 'kunal-m' },
    { id: '6', name: 'Ananya Roy', email: 'ananya@email.com', ats_score: 91, skill_match: 89, interview_score: 82, github_score: 78, match_score: 88, top_languages: ['TypeScript', 'Next.js', 'PostgreSQL'], matched_skills: ['TypeScript', 'Next.js', 'REST APIs', 'React'], missing_skills: ['DevOps'], ai_summary: 'Excellent all-round profile. Top pick for full-stack or frontend roles.', github_username: 'ananya-r' },
];

const ScoreBar = ({ score, color = '#3b82f6' }: { score: number; color?: string }) => (
    <div style={{ background: '#e8f1fc', borderRadius: 4, height: 6, flex: 1, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
    </div>
);

const ScorePill = ({ value, label }: { value: number; label: string }) => {
    const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <div style={{ textAlign: 'center', minWidth: 56 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
        </div>
    );
};

export default function CandidatesPage() {
    const [search, setSearch] = useState('');
    const [minATS, setMinATS] = useState(0);
    const [minInterview, setMinInterview] = useState(0);
    const [minGitHub, setMinGitHub] = useState(0);
    const [selectedLang, setSelectedLang] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selected, setSelected] = useState<Candidate | null>(null);

    const allLangs = Array.from(new Set(DEMO_CANDIDATES.flatMap((c) => c.top_languages)));

    const filtered = DEMO_CANDIDATES.filter((c) => {
        const q = search.toLowerCase();
        const matchSearch = !q || c.name.toLowerCase().includes(q) || c.top_languages.some((l) => l.toLowerCase().includes(q));
        const matchATS = c.ats_score >= minATS;
        const matchInterview = c.interview_score >= minInterview;
        const matchGH = c.github_score >= minGitHub;
        const matchLang = !selectedLang || c.top_languages.includes(selectedLang);
        return matchSearch && matchATS && matchInterview && matchGH && matchLang;
    }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f6ff' }}>
            <DashboardSidebar role="company" />
            <div style={{ marginLeft: 260, flex: 1, padding: '32px', minHeight: '100vh' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Candidate Pool</h1>
                    <p style={{ color: '#64748b', marginTop: 4 }}>{filtered.length} candidates match your filters</p>
                </div>

                {/* Search + Filter bar */}
                <div className="glass" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or skill..."
                            className="input-dark" style={{ paddingLeft: 36, margin: 0 }} />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary" style={{ fontSize: 13, padding: '9px 16px', gap: 6 }}>
                        <Filter size={14} /> Filters {showFilters ? <ChevronDown size={12} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={12} />}
                    </button>
                    {(minATS > 0 || minInterview > 0 || minGitHub > 0 || selectedLang) && (
                        <button onClick={() => { setMinATS(0); setMinInterview(0); setMinGitHub(0); setSelectedLang(''); }}
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <X size={13} /> Clear
                        </button>
                    )}
                </div>

                {/* Filter panel */}
                {showFilters && (
                    <div className="glass" style={{ padding: '20px 24px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        {[
                            { label: `Min ATS Score: ${minATS}`, val: minATS, set: setMinATS },
                            { label: `Min Interview Score: ${minInterview}`, val: minInterview, set: setMinInterview },
                            { label: `Min GitHub Score: ${minGitHub}`, val: minGitHub, set: setMinGitHub },
                        ].map(({ label, val, set }) => (
                            <div key={label}>
                                <div style={{ fontSize: 13, color: '#475569', fontWeight: 500, marginBottom: 8 }}>{label}</div>
                                <input type="range" min={0} max={100} step={5} value={val} onChange={(e) => set(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#3b82f6' }} />
                            </div>
                        ))}
                        <div>
                            <div style={{ fontSize: 13, color: '#475569', fontWeight: 500, marginBottom: 8 }}>Language / Skill</div>
                            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}
                                className="input-dark" style={{ margin: 0 }}>
                                <option value="">All Languages</option>
                                {allLangs.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* Candidate table */}
                <div className="glass" style={{ overflow: 'hidden' }}>
                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 80px', gap: 12, padding: '14px 20px', background: '#f8faff', borderBottom: '1px solid rgba(59,130,246,0.1)', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span>Candidate</span><span>ATS</span><span>Interview</span><span>GitHub</span><span>Top Skills</span><span></span>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                            <Search size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                            No candidates match your filters
                        </div>
                    ) : (
                        filtered.map((c, i) => (
                            <div key={c.id} onClick={() => setSelected(c)}
                                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 80px', gap: 12, padding: '16px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(59,130,246,0.07)' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f9ff')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{c.name}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.email}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 700, color: c.ats_score >= 80 ? '#10b981' : c.ats_score >= 60 ? '#f59e0b' : '#ef4444', fontSize: 15 }}>{c.ats_score}</span>
                                    <ScoreBar score={c.ats_score} color={c.ats_score >= 80 ? '#10b981' : c.ats_score >= 60 ? '#f59e0b' : '#ef4444'} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 700, color: c.interview_score >= 80 ? '#10b981' : c.interview_score >= 60 ? '#f59e0b' : '#ef4444', fontSize: 15 }}>{c.interview_score > 0 ? c.interview_score : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 700, color: c.github_score >= 80 ? '#10b981' : c.github_score >= 60 ? '#f59e0b' : '#ef4444', fontSize: 15 }}>{c.github_score > 0 ? c.github_score : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {c.top_languages.slice(0, 2).map((l) => (
                                        <span key={l} className="tag" style={{ fontSize: 11, padding: '2px 8px' }}>{l}</span>
                                    ))}
                                    {c.top_languages.length > 2 && <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>+{c.top_languages.length - 2}</span>}
                                </div>
                                <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>
                                    View
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Candidate Profile Modal */}
                {selected && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                        onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
                        <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(59,130,246,0.2)' }}>
                            {/* Modal header */}
                            <div style={{ padding: '24px 28px 0', borderBottom: '1px solid rgba(59,130,246,0.1)', paddingBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{selected.name}</h2>
                                        <p style={{ color: '#64748b', fontSize: 14 }}>{selected.email}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 12, padding: '8px 16px', color: 'white' }}>
                                            <div style={{ fontSize: 22, fontWeight: 900 }}>{selected.match_score || selected.ats_score}</div>
                                            <div style={{ fontSize: 11, opacity: 0.85 }}>Match %</div>
                                        </div>
                                        <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '24px 28px' }}>
                                {/* Score row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                                    {[
                                        { label: 'ATS Score', value: selected.ats_score, icon: <FileText size={16} color="#3b82f6" /> },
                                        { label: 'Interview', value: selected.interview_score, icon: <MessageSquare size={16} color="#6366f1" /> },
                                        { label: 'GitHub', value: selected.github_score, icon: <Github size={16} color="#1d4ed8" /> },
                                    ].map(({ label, value, icon }) => (
                                        <div key={label} style={{ background: '#f8faff', borderRadius: 12, padding: '14px', border: '1px solid rgba(59,130,246,0.12)', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#64748b' }}>{value > 0 ? value : '—'}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Summary */}
                                {selected.ai_summary && (
                                    <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <Star size={12} /> AI RECRUITER SUMMARY
                                        </div>
                                        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{selected.ai_summary}</p>
                                    </div>
                                )}

                                {/* Strengths */}
                                {selected.matched_skills.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <TrendingUp size={14} color="#10b981" /> Matched Skills
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {selected.matched_skills.map((s) => (
                                                <span key={s} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Missing skills */}
                                {selected.missing_skills.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <AlertCircle size={14} color="#f59e0b" /> Skill Gaps
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {selected.missing_skills.map((s) => (
                                                <span key={s} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#d97706', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top languages */}
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Top Languages</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {selected.top_languages.map((l) => <span key={l} className="tag" style={{ fontSize: 12 }}>{l}</span>)}
                                    </div>
                                </div>

                                {/* Score bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { label: 'ATS Score', val: selected.ats_score, color: '#3b82f6' },
                                        { label: 'Skill Match', val: selected.skill_match, color: '#6366f1' },
                                        { label: 'Interview Score', val: selected.interview_score, color: '#10b981' },
                                        { label: 'GitHub Score', val: selected.github_score, color: '#f59e0b' },
                                    ].map(({ label, val, color }) => (
                                        <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, color: '#475569', minWidth: 110 }}>{label}</span>
                                            <ScoreBar score={val} color={color} />
                                            <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28 }}>{val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                    {selected.github_username && (
                                        <a href={`https://github.com/${selected.github_username}`} target="_blank" rel="noreferrer"
                                            className="btn-secondary" style={{ textDecoration: 'none', fontSize: 13, padding: '9px 16px' }}>
                                            <Github size={14} /> GitHub Profile <ExternalLink size={11} />
                                        </a>
                                    )}
                                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                                        <Award size={14} /> Shortlist Candidate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
