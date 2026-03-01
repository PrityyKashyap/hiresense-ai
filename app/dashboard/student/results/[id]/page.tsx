'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import ScoreGauge from '@/components/ScoreGauge';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle2, AlertTriangle, Lightbulb, Star, ArrowLeft, Download, Database } from 'lucide-react';
import { exportReportAsPDF } from '@/lib/exportPDF';
import { getScoreById } from '@/lib/db';
import toast from 'react-hot-toast';

interface AnalysisResult {
    skill_match: number;
    experience_score: number;
    ats_score: number;
    missing_skills: string[];
    suggestions: string[];
    skill_breakdown: { technical: number; communication: number; projects: number; education: number };
    strengths: string[];
    keyword_density: number;
    jobTitle: string;
    fileName: string;
    analyzedAt: string;
    savedToDb?: boolean;
    scoreId?: string;
}

const MOCK_RESULT: AnalysisResult = {
    skill_match: 78,
    experience_score: 65,
    ats_score: 72,
    missing_skills: ['Node.js', 'REST APIs', 'System Design', 'Docker'],
    suggestions: [
        'Add measurable achievements with specific numbers (e.g., "Improved performance by 40%")',
        'Include more action verbs at the start of each bullet point',
        'Add a dedicated Skills section grouping technical skills by category',
        'Quantify project impact with user counts, performance metrics, or business outcomes',
        'Include relevant certifications (AWS, Google, Meta) to strengthen your profile',
        'Tailor your professional summary to match this job description\'s keywords',
    ],
    skill_breakdown: { technical: 82, communication: 60, projects: 75, education: 88 },
    strengths: ['Strong educational background with relevant coursework', 'Good project portfolio with real-world applications', 'Clear and well-structured resume format'],
    keyword_density: 68,
    jobTitle: 'Frontend Developer Intern',
    fileName: 'resume.pdf',
    analyzedAt: new Date().toISOString(),
};

function getScoreLabel(score: number) {
    if (score >= 80) return { label: 'Excellent', color: '#10b981' };
    if (score >= 65) return { label: 'Good', color: '#f59e0b' };
    if (score >= 50) return { label: 'Needs Work', color: '#f97316' };
    return { label: 'Critical', color: '#ef4444' };
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [mounted, setMounted] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
        const load = async () => {
            // Resolve params
            const { id } = await params;

            // Try to load from Supabase if it's a real UUID
            if (id && id !== 'latest' && !id.startsWith('demo-') && !id.startsWith('local-')) {
                const dbScore = await getScoreById(id);
                if (dbScore) {
                    setResult({
                        ...dbScore,
                        skill_match: dbScore.match_score,
                        jobTitle: dbScore.job_title || 'Job Analysis',
                        fileName: 'resume.pdf',
                        analyzedAt: dbScore.created_at,
                        savedToDb: true,
                        skill_breakdown: dbScore.skill_breakdown as AnalysisResult['skill_breakdown'],
                    });
                    return;
                }
            }
            // Fallback to sessionStorage
            const stored = sessionStorage.getItem('analysis_result');
            if (stored) {
                try { setResult(JSON.parse(stored)); } catch { setResult(MOCK_RESULT); }
            } else {
                setResult(MOCK_RESULT);
            }
        };
        load();
    }, [params]);

    const handleExport = async () => {
        if (!result) return;
        setExporting(true);
        try {
            await exportReportAsPDF(result);
            toast.success('Report downloaded! 📄');
        } catch (err) {
            console.error(err);
            toast.error('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (!mounted || !result) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <DashboardSidebar role="student" />
                <main style={{ marginLeft: '260px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, margin: '0 auto 16px' }} />
                        <p style={{ color: '#9d9db8' }}>Loading your results...</p>
                    </div>
                </main>
            </div>
        );
    }

    const atsLabel = getScoreLabel(result.ats_score);
    const radarData = [
        { skill: 'Technical', score: result.skill_breakdown.technical },
        { skill: 'Projects', score: result.skill_breakdown.projects },
        { skill: 'Education', score: result.skill_breakdown.education },
        { skill: 'Communication', score: result.skill_breakdown.communication },
        { skill: 'Keywords', score: result.keyword_density },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="student" />

            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <div>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#9d9db8', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: 0 }}>
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Analysis Report</h1>
                        <p style={{ color: '#9d9db8', fontSize: '13px' }}>{result.jobTitle} • {result.fileName} • {new Date(result.analyzedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="btn-secondary"
                        style={{ fontSize: '13px', gap: '6px' }}
                    >
                        {exporting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Download size={15} />}
                        {exporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>

                {/* Overall ATS score banner */}
                <div className="glass" style={{
                    padding: '28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: `linear-gradient(135deg, ${atsLabel.color}10 0%, rgba(59,130,246,0.05) 100%)`,
                    border: `1px solid ${atsLabel.color}30`,
                }}>
                    <div>
                        <div style={{ fontSize: '13px', color: '#9d9db8', marginBottom: '6px', fontWeight: 500 }}>Overall ATS Compatibility</div>
                        <div style={{ fontSize: '44px', fontWeight: 900, color: atsLabel.color, lineHeight: 1 }}>{result.ats_score}<span style={{ fontSize: '20px', color: '#6b6b8a' }}>/100</span></div>
                        <div className={`badge`} style={{ marginTop: '10px', background: `${atsLabel.color}20`, color: atsLabel.color, border: `1px solid ${atsLabel.color}40` }}>
                            {atsLabel.label}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <ScoreGauge score={result.skill_match} label="Skill Match" size={110} color="#8b5cf6" />
                        <ScoreGauge score={result.experience_score} label="Experience" size={110} color="#3b82f6" />
                        <ScoreGauge score={result.keyword_density} label="Keywords" size={110} color="#06b6d4" />
                    </div>
                </div>

                {/* Grid: Radar + Missing Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Radar chart */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Skill Breakdown</h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: '#9d9db8', fontSize: 12, fontWeight: 500 }} />
                                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                                <Tooltip contentStyle={{ background: '#13131f', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#f1f0ff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Missing skills */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <AlertTriangle size={16} color="#f59e0b" />
                            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Missing Skills</h2>
                            <span className="badge badge-yellow" style={{ fontSize: '11px', marginLeft: 'auto' }}>{result.missing_skills.length} gaps</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#9d9db8', marginBottom: '16px', lineHeight: 1.5 }}>
                            These skills are mentioned in the job description but not found in your resume. Prioritize learning them to improve your match score.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                            {result.missing_skills.map((s) => (
                                <span key={s} className="badge badge-red" style={{ fontSize: '12px' }}>
                                    ✕ {s}
                                </span>
                            ))}
                        </div>
                        {/* Skill bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.entries(result.skill_breakdown).map(([key, val]) => (
                                <div key={key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9d9db8', marginBottom: '6px' }}>
                                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{key}</span>
                                        <span style={{ fontWeight: 700, color: val >= 70 ? '#34d399' : val >= 50 ? '#fbbf24' : '#f87171' }}>{val}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${val}%`, background: val >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : val >= 50 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strengths + Suggestions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Strengths */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Star size={16} color="#10b981" />
                            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Your Strengths</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {result.strengths.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span style={{ fontSize: '13px', color: '#c4b5fd', lineHeight: 1.5 }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Lightbulb size={16} color="#f59e0b" />
                            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>AI Improvement Tips</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {result.suggestions.map((s, i) => (
                                <div key={i} style={{
                                    padding: '12px 14px', borderRadius: '8px',
                                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                                    fontSize: '13px', color: '#e5c88a', lineHeight: 1.5,
                                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                                }}>
                                    <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <button onClick={() => router.push('/dashboard/student/analyze')} className="btn-primary" style={{ fontSize: '15px' }}>
                        Analyze Another Resume →
                    </button>
                </div>
            </main>
        </div>
    );
}
