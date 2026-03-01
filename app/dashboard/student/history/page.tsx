'use client';

import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

const HISTORY = [
    { id: '1', jobTitle: 'Frontend Developer Intern', ats: 82, match: 78, date: '2025-02-24', fileName: 'resume_v3.pdf' },
    { id: '2', jobTitle: 'React Developer', ats: 71, match: 65, date: '2025-02-22', fileName: 'resume_v3.pdf' },
    { id: '3', jobTitle: 'UI/UX Designer', ats: 58, match: 52, date: '2025-02-20', fileName: 'resume_v2.pdf' },
    { id: '4', jobTitle: 'Full Stack Internship', ats: 64, match: 59, date: '2025-02-18', fileName: 'resume_v2.pdf' },
    { id: '5', jobTitle: 'JavaScript Developer', ats: 45, match: 40, date: '2025-02-10', fileName: 'resume_v1.pdf' },
];

export default function HistoryPage() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="student" />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Scan History</h1>
                        <p style={{ color: '#9d9db8', fontSize: '14px' }}>All your previous resume analyses</p>
                    </div>
                    <Link href="/dashboard/student/analyze" className="btn-primary" style={{ fontSize: '14px' }}>
                        + New Analysis
                    </Link>
                </div>

                <div className="glass" style={{ padding: '24px' }}>
                    {/* Header row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px 36px', gap: '16px', padding: '0 16px 12px', borderBottom: '1px solid rgba(139,92,246,0.1)', fontSize: '12px', fontWeight: 600, color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <div>Job / File</div>
                        <div style={{ textAlign: 'center' }}>ATS Score</div>
                        <div style={{ textAlign: 'center' }}>Skill Match</div>
                        <div style={{ textAlign: 'center' }}>Date</div>
                        <div />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
                        {HISTORY.map((item) => (
                            <Link key={item.id} href={`/dashboard/student/results/${item.id}`} style={{
                                textDecoration: 'none', display: 'grid',
                                gridTemplateColumns: '1fr 100px 100px 120px 36px',
                                gap: '16px', alignItems: 'center',
                                padding: '14px 16px', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.08)', transition: 'all 0.2s',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            >
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f0ff', marginBottom: '3px' }}>{item.jobTitle}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b6b8a', fontSize: '12px' }}>
                                        <FileText size={12} />{item.fileName}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: item.ats >= 75 ? '#34d399' : item.ats >= 50 ? '#fbbf24' : '#f87171' }}>{item.ats}</div>
                                    <div style={{ fontSize: '10px', color: '#6b6b8a' }}>/100</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa' }}>{item.match}%</div>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#9d9db8' }}>{item.date}</div>
                                <ArrowRight size={16} color="#6b6b8a" />
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
