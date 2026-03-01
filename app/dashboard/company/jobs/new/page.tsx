'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Plus, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = [
    { value: 'internship', label: 'Internship' },
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
];

export default function PostJobPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        jobDescription: '',
        experienceLevel: 'internship',
        skills: [] as string[],
    });
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            if (!form.skills.includes(skillInput.trim())) {
                setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
            }
            setSkillInput('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Please enter a job title');
        if (!form.jobDescription.trim()) return toast.error('Please enter a job description');

        setLoading(true);
        // Simulate saving (would normally POST to Supabase)
        await new Promise((r) => setTimeout(r, 1000));
        toast.success('Job posted successfully! 🎉');
        router.push('/dashboard/company');
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="company" />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#9d9db8', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', padding: 0 }}>
                        <ArrowLeft size={14} /> Back
                    </button>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Post a New Job</h1>
                    <p style={{ color: '#9d9db8', fontSize: '14px', marginBottom: '28px' }}>AI will auto-rank incoming resumes by match score</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Job Title *</label>
                                <input className="input-dark" placeholder="e.g. Frontend Developer Intern" value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Experience Level</label>
                                <select className="input-dark" value={form.experienceLevel}
                                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} style={{ cursor: 'pointer' }}>
                                    {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Required Skills — press Enter to add</label>
                                <input className="input-dark" placeholder="e.g. React, Node.js, TypeScript..."
                                    value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} />
                                {form.skills.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                        {form.skills.map((s) => (
                                            <span key={s} className="tag">
                                                {s}
                                                <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== s) })}
                                                    style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Job Description *</label>
                                <textarea className="input-dark" placeholder="Describe responsibilities, qualifications, and what you're looking for..."
                                    value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                                    rows={8} style={{ resize: 'vertical', lineHeight: 1.6 }} required />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', fontSize: '15px', padding: '14px' }}>
                            {loading ? <><span className="spinner" /> Posting...</> : <><Plus size={18} /> Post Job &amp; Enable AI Ranking</>}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
