'use client';

import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, TrendingUp, Plus, Clock } from 'lucide-react';

const MOCK_JOBS = [
    { id: '1', title: 'Frontend Developer Intern', applicants: 47, top_match: 91, status: 'active', created: '2025-02-22' },
    { id: '2', title: 'React Native Developer', applicants: 23, top_match: 84, status: 'active', created: '2025-02-20' },
    { id: '3', title: 'UI/UX Designer', applicants: 35, top_match: 78, status: 'closed', created: '2025-02-15' },
];

const MOCK_TOP_CANDIDATES = [
    { name: 'Aryan Sharma', job: 'Frontend Developer Intern', score: 91, skills: ['React', 'TypeScript', 'CSS'] },
    { name: 'Priya Mehta', job: 'React Native Developer', score: 87, skills: ['React Native', 'Redux', 'API'] },
    { name: 'Rohit Kumar', job: 'Frontend Developer Intern', score: 82, skills: ['React', 'JavaScript', 'Git'] },
    { name: 'Anjali Singh', job: 'UI/UX Designer', score: 78, skills: ['Figma', 'CSS', 'Prototyping'] },
];

export default function CompanyDashboard() {
    const totalApplicants = MOCK_JOBS.reduce((sum, j) => sum + j.applicants, 0);
    const activeJobs = MOCK_JOBS.filter((j) => j.status === 'active').length;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="company" />

            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Company Dashboard</h1>
                        <p style={{ color: '#9d9db8', fontSize: '14px' }}>AI-powered candidate ranking at a glance</p>
                    </div>
                    <Link href="/dashboard/company/jobs/new" className="btn-primary">
                        <Plus size={16} /> Post a Job
                    </Link>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { label: 'Active Jobs', value: activeJobs, icon: <Briefcase size={20} />, color: '#8b5cf6' },
                        { label: 'Total Applicants', value: totalApplicants, icon: <Users size={20} />, color: '#3b82f6' },
                        { label: 'Avg Top Match', value: '84%', icon: <TrendingUp size={20} />, color: '#10b981' },
                        { label: 'Time Saved', value: '80%', icon: <Clock size={20} />, color: '#f59e0b' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass" style={{ padding: '22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ fontSize: '13px', color: '#9d9db8', fontWeight: 500 }}>{stat.label}</div>
                                <div style={{ color: stat.color }}>{stat.icon}</div>
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 900, color: '#f1f0ff' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Jobs table + Top Candidates */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
                    {/* Active jobs */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Your Job Postings</h2>
                            <Link href="/dashboard/company/jobs/new" style={{ color: '#8b5cf6', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>+ New Job</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {MOCK_JOBS.map((job) => (
                                <Link key={job.id} href={`/dashboard/company/candidates?job=${job.id}`} style={{
                                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 16px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.1)', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f0ff', marginBottom: '4px' }}>{job.title}</div>
                                        <div style={{ fontSize: '12px', color: '#6b6b8a' }}>{job.applicants} applicants • {job.created}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>{job.top_match}%</div>
                                            <div style={{ fontSize: '10px', color: '#6b6b8a' }}>Top Match</div>
                                        </div>
                                        <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '11px' }}>
                                            {job.status}
                                        </span>
                                        <ArrowRight size={16} color="#6b6b8a" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Candidates */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Top Candidates</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {MOCK_TOP_CANDIDATES.map((c, i) => (
                                <div key={i} style={{
                                    padding: '14px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.1)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                background: `hsl(${(i * 67) % 360}, 60%, 45%)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '13px', fontWeight: 700, color: 'white',
                                            }}>
                                                {c.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f0ff' }}>{c.name}</div>
                                                <div style={{ fontSize: '11px', color: '#6b6b8a' }}>{c.job}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: c.score >= 85 ? '#34d399' : '#fbbf24' }}>{c.score}%</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {c.skills.map((s) => (
                                            <span key={s} className="badge badge-purple" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
