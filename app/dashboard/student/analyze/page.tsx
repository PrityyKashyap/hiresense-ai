'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Upload, X, FileText, Sparkles, AlertCircle, CheckCircle2, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { saveResume, uploadResumePDF, saveScore } from '@/lib/db';

export default function AnalyzePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [drag, setDrag] = useState(false);
    const [jobTitle, setJobTitle] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('entry');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDrag(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped?.type === 'application/pdf') { setFile(dropped); }
        else toast.error('Please upload a PDF file');
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s));

    const handleAnalyze = async () => {
        if (!file) return toast.error('Please upload your resume first');
        if (!jobDesc.trim()) return toast.error('Please enter a job description');

        setLoading(true);
        setUploadProgress(0);

        try {
            let resumeText = '';
            let fileUrl: string | undefined;

            // Step 1: Upload PDF to Supabase Storage
            setStage('Uploading PDF to cloud...');
            setUploadProgress(15);
            if (user) {
                fileUrl = (await uploadResumePDF(user.id, file)) || undefined;
            }
            setUploadProgress(30);

            // Step 2: Extract text from PDF
            setStage('Extracting resume text...');
            const formData = new FormData();
            formData.append('file', file);
            try {
                const pdfRes = await fetch('/api/extract-pdf', { method: 'POST', body: formData });
                const pdfData = await pdfRes.json();
                resumeText = pdfData.text || '';
            } catch {
                resumeText = `Resume from ${file.name}`;
            }
            setUploadProgress(55);

            // Step 3: Save resume record to DB
            setStage('Saving resume record...');
            let resumeId = `local-${Date.now()}`;
            if (user) {
                const resumeRecord = await saveResume(user.id, file.name, resumeText, fileUrl);
                if (resumeRecord) resumeId = resumeRecord.id;
            }
            setUploadProgress(65);

            // Step 4: Run AI analysis
            setStage('Running AI analysis...');
            const analysisRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, jobDescription: jobDesc, requiredSkills: skills }),
            });
            const analysis = await analysisRes.json();
            setUploadProgress(85);

            // Step 5: Save score to DB
            setStage('Saving results...');
            let scoreId = 'latest';
            if (user) {
                const scoreRecord = await saveScore(resumeId, analysis, jobTitle || 'Job Analysis', jobDesc, skills);
                if (scoreRecord) scoreId = scoreRecord.id;
            }
            setUploadProgress(100);

            // Step 6: Store in session and navigate
            const result = {
                ...analysis, jobTitle: jobTitle || 'Job Analysis',
                fileName: file.name, analyzedAt: new Date().toISOString(),
                scoreId, resumeId, savedToDb: !!user,
            };
            sessionStorage.setItem('analysis_result', JSON.stringify(result));

            toast.success(user ? 'Analysis saved to your account! 🎉' : 'Analysis complete! 🎉');
            router.push(`/dashboard/student/results/${scoreId}`);
        } catch (err) {
            console.error(err);
            toast.error('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
            setStage('');
            setUploadProgress(0);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <DashboardSidebar role="student" />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 260px)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Analyze Resume</h1>
                        <p style={{ color: '#9d9db8', fontSize: '14px' }}>
                            Upload your PDF and get your AI-powered report · {user ? (
                                <span style={{ color: '#34d399' }}><CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />Results auto-saved to your account</span>
                            ) : (
                                <span style={{ color: '#f59e0b' }}>Sign in to save results permanently</span>
                            )}
                        </p>
                    </div>

                    {/* Step 1: Upload */}
                    <div className="glass" style={{ padding: '28px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span className="badge badge-purple">Step 1</span>
                            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Upload Resume (PDF)</h2>
                            {user && <span className="badge badge-green" style={{ fontSize: '11px', marginLeft: 'auto' }}><Cloud size={10} /> Cloud Storage Active</span>}
                        </div>

                        {!file ? (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={onDrop}
                                style={{
                                    border: `2px dashed ${drag ? '#8b5cf6' : 'rgba(139,92,246,0.3)'}`,
                                    borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
                                    background: drag ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onClick={() => document.getElementById('fileInput')?.click()}
                            >
                                <input id="fileInput" type="file" accept=".pdf" style={{ display: 'none' }} onChange={onFileChange} />
                                <Upload size={40} color={drag ? '#8b5cf6' : '#6b6b8a'} style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                                    Drop your PDF here or click to browse
                                </p>
                                <p style={{ color: '#6b6b8a', fontSize: '13px' }}>PDF files up to 10MB · {user ? 'Stored securely in your account' : 'Log in to enable cloud storage'}</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 20px', background: 'rgba(139,92,246,0.1)',
                                border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FileText size={24} color="#8b5cf6" />
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{file.name}</div>
                                        <div style={{ fontSize: '12px', color: '#9d9db8' }}>
                                            {(file.size / 1024).toFixed(0)} KB · Ready to analyze
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#6b6b8a', cursor: 'pointer', padding: '4px' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Job Description */}
                    <div className="glass" style={{ padding: '28px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span className="badge badge-blue">Step 2</span>
                            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Job Details</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Job Title (optional)</label>
                                <input className="input-dark" placeholder="e.g. Frontend Developer Intern" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Job Description *</label>
                                <textarea className="input-dark" placeholder="Paste the full job description here..." value={jobDesc}
                                    onChange={(e) => setJobDesc(e.target.value)} rows={6} style={{ resize: 'vertical', lineHeight: 1.5 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Required Skills — press Enter to add</label>
                                <input className="input-dark" placeholder="e.g. React, Node.js, TypeScript..." value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} />
                                {skills.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                        {skills.map((s) => (
                                            <span key={s} className="tag">
                                                {s}
                                                <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: '#9d9db8', display: 'block', marginBottom: '8px', fontWeight: 500 }}>Experience Level</label>
                                <select className="input-dark" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} style={{ cursor: 'pointer' }}>
                                    <option value="entry">Entry Level / Fresher</option>
                                    <option value="internship">Internship</option>
                                    <option value="mid">Mid Level (2-5 years)</option>
                                    <option value="senior">Senior (5+ years)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tip */}
                    <div style={{ display: 'flex', gap: '12px', padding: '14px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
                        <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '13px', color: '#d4a017', lineHeight: 1.5 }}>
                            <strong>Tip:</strong> Paste the complete job description and add all listed skills for the most accurate AI analysis.
                        </p>
                    </div>

                    {/* Progress bar (only while loading) */}
                    {loading && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9d9db8', marginBottom: '6px' }}>
                                <span>{stage}</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="progress-bar" style={{ height: '6px' }}>
                                <div className="progress-fill" style={{ width: `${uploadProgress}%`, transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px' }}
                    >
                        {loading ? <><span className="spinner" /> {stage || 'Analyzing...'}</> : <><Sparkles size={18} /> Analyze with AI</>}
                    </button>
                </div>
            </main>
        </div>
    );
}
