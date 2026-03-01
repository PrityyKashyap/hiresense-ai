'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Github, Search, Star, GitFork, Calendar, Code, TrendingUp, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface GitHubAnalysis {
    profile: {
        name: string;
        username: string;
        bio: string;
        followers: number;
        following: number;
        public_repos: number;
        avatar_url: string;
        location: string;
        company: string;
        blog: string;
        created_at: string;
    };
    repos: Array<{
        name: string;
        description: string;
        language: string;
        stars: number;
        forks: number;
        updated_at: string;
        url: string;
        topics: string[];
    }>;
    aiAnalysis: {
        overall_score: number;
        strengths: string[];
        improvements: string[];
        top_languages: string[];
        activity_score: number;
        project_quality: number;
        consistency_score: number;
        resume_tips: string[];
    };
}

const SKILL_COLORS: Record<string, string> = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', Go: '#00ADD8',
    Rust: '#dea584', HTML: '#e34c26', CSS: '#563d7c', React: '#61dafb',
};

export default function GitHubAnalyzerPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
    const [stage, setStage] = useState('');

    const handleAnalyze = async () => {
        if (!username.trim()) return toast.error('Enter a GitHub username');
        setLoading(true);
        setStage('Fetching GitHub profile...');

        try {
            const res = await fetch('/api/github-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to analyze GitHub profile');
            }

            const data = await res.json();
            setAnalysis(data);
            toast.success('GitHub profile analyzed! 🚀');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setLoading(false);
            setStage('');
        }
    };

    const saveToProfile = async () => {
        if (!analysis) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { toast.error('Please sign in to save'); return; }
            await fetch('/api/save-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    username: analysis.profile.username,
                    repoCount: analysis.profile.public_repos,
                    followers: analysis.profile.followers,
                    githubScore: analysis.aiAnalysis.overall_score,
                    activityScore: analysis.aiAnalysis.activity_score,
                    qualityScore: analysis.aiAnalysis.project_quality,
                    consistencyScore: analysis.aiAnalysis.consistency_score,
                    topLanguages: analysis.aiAnalysis.top_languages,
                    summary: analysis.aiAnalysis.strengths.join('. '),
                    resumeTips: analysis.aiAnalysis.resume_tips,
                }),
            });
            toast.success('GitHub analysis saved to your profile! 💾');
        } catch { toast.error('Failed to save'); }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="student" />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'linear-gradient(135deg, #1e1e2e, #2d2d3f)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Github size={26} color="#a78bfa" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>GitHub Analyzer</h1>
                            <p style={{ color: '#9d9db8', fontSize: '14px' }}>AI-powered analysis of your GitHub profile for recruiters</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
                        <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '10px', fontWeight: 500 }}>
                            GitHub Username
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Github size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b8a' }} />
                                <input
                                    className="input-dark"
                                    placeholder="e.g. torvalds, gaearon, your-username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                            <button onClick={handleAnalyze} disabled={loading} className="btn-primary" style={{ flexShrink: 0, padding: '12px 24px' }}>
                                {loading ? <><span className="spinner" /> {stage}</> : <><Search size={16} /> Analyze</>}
                            </button>
                        </div>
                    </div>

                    {analysis && (
                        <div className="animate-slide-up">
                            {/* Profile card */}
                            <div className="glass" style={{ padding: '24px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <img
                                    src={analysis.profile.avatar_url}
                                    alt={analysis.profile.name}
                                    style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.3)', flexShrink: 0 }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div>
                                            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '2px' }}>{analysis.profile.name || analysis.profile.username}</h2>
                                            <p style={{ color: '#8b5cf6', fontSize: '14px', fontWeight: 500 }}>@{analysis.profile.username}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <button onClick={saveToProfile} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px', gap: 6 }}>
                                                <Save size={13} /> Save to Profile
                                            </button>
                                            <div className="glass" style={{ padding: '8px 18px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '24px', fontWeight: 900, color: analysis.aiAnalysis.overall_score >= 75 ? '#34d399' : analysis.aiAnalysis.overall_score >= 50 ? '#fbbf24' : '#f87171' }}>
                                                    {analysis.aiAnalysis.overall_score}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#6b6b8a', fontWeight: 600 }}>PROFILE SCORE</div>
                                            </div>
                                        </div>
                                    </div>
                                    {analysis.profile.bio && <p style={{ color: '#9d9db8', fontSize: '13px', marginBottom: '12px' }}>{analysis.profile.bio}</p>}
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                        {[
                                            { label: 'Repositories', value: analysis.profile.public_repos },
                                            { label: 'Followers', value: analysis.profile.followers },
                                            { label: 'Following', value: analysis.profile.following },
                                        ].map((s) => (
                                            <div key={s.label}>
                                                <div style={{ fontSize: '18px', fontWeight: 800 }}>{s.value}</div>
                                                <div style={{ fontSize: '11px', color: '#6b6b8a' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* AI Score cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                                {[
                                    { label: 'Activity Score', value: analysis.aiAnalysis.activity_score, color: '#8b5cf6', desc: 'Commit frequency & consistency' },
                                    { label: 'Project Quality', value: analysis.aiAnalysis.project_quality, color: '#10b981', desc: 'Repo depth, stars, documentation' },
                                    { label: 'Consistency', value: analysis.aiAnalysis.consistency_score, color: '#3b82f6', desc: 'Language focus & contribution regularity' },
                                ].map((s) => (
                                    <div key={s.label} className="glass" style={{ padding: '20px' }}>
                                        <div style={{ fontSize: '30px', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.value}<span style={{ fontSize: '14px', color: '#6b6b8a' }}>/100</span></div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{s.label}</div>
                                        <div style={{ fontSize: '11px', color: '#6b6b8a' }}>{s.desc}</div>
                                        <div className="progress-bar" style={{ marginTop: '10px' }}>
                                            <div className="progress-fill" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Top languages */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="glass" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <Code size={16} color="#8b5cf6" />
                                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Top Languages</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {analysis.aiAnalysis.top_languages.map((lang) => (
                                            <span key={lang} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px',
                                                background: `${SKILL_COLORS[lang] || '#8b5cf6'}20`,
                                                border: `1px solid ${SKILL_COLORS[lang] || '#8b5cf6'}40`,
                                                color: SKILL_COLORS[lang] || '#a78bfa', fontSize: '12px', fontWeight: 600,
                                            }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: SKILL_COLORS[lang] || '#8b5cf6', display: 'inline-block' }} />
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <TrendingUp size={16} color="#10b981" />
                                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Resume Tips from GitHub</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {analysis.aiAnalysis.resume_tips.slice(0, 3).map((tip, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 }}>
                                                <span style={{ color: '#8b5cf6', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Strengths + Improvements */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="glass" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Strengths</h3>
                                    </div>
                                    {analysis.aiAnalysis.strengths.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                                            <span style={{ fontSize: '12px', color: '#c4b5fd', lineHeight: 1.5 }}>{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="glass" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                        <AlertCircle size={16} color="#f59e0b" />
                                        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Improvements</h3>
                                    </div>
                                    {analysis.aiAnalysis.improvements.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                                            <span style={{ fontSize: '12px', color: '#e5c88a', lineHeight: 1.5 }}>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Repos */}
                            <div className="glass" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Github size={16} color="#a78bfa" />
                                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Top Repositories</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                                    {analysis.repos.slice(0, 6).map((repo) => (
                                        <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" style={{
                                            textDecoration: 'none', padding: '14px', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.1)', display: 'block', transition: 'all 0.2s',
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        >
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>{repo.name}</div>
                                            {repo.description && <p style={{ fontSize: '11px', color: '#9d9db8', marginBottom: '8px', lineHeight: 1.4 }}>{repo.description.slice(0, 70)}{repo.description.length > 70 ? '...' : ''}</p>}
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {repo.language && (
                                                    <span style={{ fontSize: '11px', color: SKILL_COLORS[repo.language] || '#9d9db8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: SKILL_COLORS[repo.language] || '#6b6b8a', display: 'inline-block' }} />
                                                        {repo.language}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: '11px', color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Star size={10} /> {repo.stars}
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <GitFork size={10} /> {repo.forks}
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#6b6b8a', display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
                                                    <Calendar size={10} /> {new Date(repo.updated_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!analysis && !loading && (
                        <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                            <Github size={48} color="#6b6b8a" style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Enter a GitHub username to begin</h3>
                            <p style={{ color: '#9d9db8', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                                Get an AI-powered analysis of any GitHub profile — activity, language stack, project quality, and recruiter tips.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
