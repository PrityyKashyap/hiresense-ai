'use client';

import Link from 'next/link';
import { Brain, Zap, Target, TrendingUp, CheckCircle2, ArrowRight, Star, Users, BarChart3, Upload } from 'lucide-react';

const FEATURES = [
  { icon: <Target size={22} color="#3b82f6" />, title: 'AI ATS Scoring', desc: 'Instant ATS compatibility score with a breakdown of keywords, formatting, and structure.' },
  { icon: <TrendingUp size={22} color="#06b6d4" />, title: 'Skill Gap Analysis', desc: 'Pinpoint exactly which skills you\'re missing compared to the job requirements.' },
  { icon: <Zap size={22} color="#6366f1" />, title: 'Resume Suggestions', desc: 'GPT‑4o-powered, specific tips to improve your resume for each job you apply to.' },
  { icon: <BarChart3 size={22} color="#3b82f6" />, title: 'Company Ranking', desc: 'Companies get AI-ranked candidate shortlists — saving hours of manual screening.' },
  { icon: <Users size={22} color="#06b6d4" />, title: 'Mock Interview', desc: 'Practice with an AI interviewer and get scored answers before the real thing.' },
  { icon: <Brain size={22} color="#6366f1" />, title: 'GitHub Analyzer', desc: 'AI evaluates your GitHub profile and generates recruiter‑facing insights.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Your Resume', desc: 'Drag and drop your PDF. We extract and parse your text instantly.', color: '#3b82f6' },
  { step: '02', title: 'Paste the Job Description', desc: 'Add the JD and required skills to get a precision match analysis.', color: '#06b6d4' },
  { step: '03', title: 'Get Your AI Report', desc: 'ATS score, missing skills, radar chart, and actionable improvement tips.', color: '#6366f1' },
];

const STUDENT_PRICING = [
  { plan: 'Free', price: '₹0', period: 'forever', features: ['5 resume scans/month', 'ATS score + skill gaps', 'AI suggestions', 'Scan history'], cta: 'Get Started Free', primary: false },
  { plan: 'Premium', price: '₹199', period: '/month', features: ['Unlimited scans', 'PDF export report', 'AI Mock Interview', 'GitHub Analyzer', 'Priority support'], cta: 'Start Premium', primary: true },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f6ff', color: '#0f172a' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,130,246,0.12)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', boxShadow: '0 2px 12px rgba(59,130,246,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>HireSense <span style={{ color: '#3b82f6' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/auth/login" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '14px', padding: '8px 16px', borderRadius: '8px', transition: 'color 0.2s' }}>Sign In</Link>
          <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '14px', padding: '9px 20px', textDecoration: 'none' }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', maxWidth: '900px', margin: '0 auto', padding: '120px 20px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 600, color: '#2563eb', marginBottom: '24px' }}>
          <Star size={13} fill="#2563eb" /> India&apos;s #1 AI Resume Intelligence Platform
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', color: '#0f172a' }}>
          Land Your Dream Job{' '}
          <span className="gradient-text">Faster with AI</span>
        </h1>

        <p style={{ fontSize: '18px', color: '#475569', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.65 }}>
          Upload your resume. Paste the job description. Get an instant ATS score, skill gap report, and AI-powered tips to get past the bots.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', textDecoration: 'none' }}>
            <Upload size={18} /> Analyze My Resume <ArrowRight size={16} />
          </Link>
          <Link href="/auth/login" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px', textDecoration: 'none' }}>
            Try Demo →
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {[['10K+', 'Resumes Analyzed'], ['94%', 'ATS Pass Rate'], ['3 min', 'Avg Analysis Time'], ['50+', 'Skills Tracked']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#3b82f6' }}>{v}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Everything you need to get hired</h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>One platform for students, freshers, and companies hiring in India.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="glass glass-hover" style={{ padding: '28px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 40px', background: '#f0f6ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>How it works</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Three steps. Less than 3 minutes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="glass" style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, color: s.color, opacity: 0.12, position: 'absolute', top: '16px', right: '20px', lineHeight: 1 }}>{s.step}</div>
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${s.color}15`, border: `2px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '20px', fontWeight: 900, color: s.color }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Simple pricing for students</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '660px', margin: '0 auto' }}>
            {STUDENT_PRICING.map((p) => (
              <div key={p.plan} style={{
                padding: '32px', borderRadius: '20px',
                background: p.primary ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'white',
                border: p.primary ? 'none' : '1.5px solid rgba(59,130,246,0.2)',
                boxShadow: p.primary ? '0 8px 32px rgba(59,130,246,0.35)' : '0 2px 12px rgba(59,130,246,0.07)',
                color: p.primary ? 'white' : '#0f172a',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.primary && <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>MOST POPULAR</div>}
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', opacity: p.primary ? 0.9 : 1, color: p.primary ? 'white' : '#64748b' }}>{p.plan}</div>
                <div style={{ fontSize: '40px', fontWeight: 900, marginBottom: '4px' }}>{p.price}</div>
                <div style={{ fontSize: '13px', opacity: 0.75, marginBottom: '24px' }}>{p.period}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px' }}>
                      <CheckCircle2 size={16} style={{ color: p.primary ? 'rgba(255,255,255,0.9)' : '#3b82f6', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/signup" style={{
                  textDecoration: 'none', display: 'block', textAlign: 'center', padding: '12px',
                  borderRadius: '10px', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s',
                  background: p.primary ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  color: 'white', border: p.primary ? '1px solid rgba(255,255,255,0.3)' : 'none',
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Company CTA */}
          <div style={{ marginTop: '32px', textAlign: 'center', padding: '32px', background: '#f0f6ff', borderRadius: '16px', border: '1.5px solid rgba(59,130,246,0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Hiring? Use HireSense for your company 🏢</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Post jobs and get AI-ranked candidates automatically.</p>
            <Link href="/auth/signup" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Start Hiring with AI <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1e293b', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={16} color="white" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>HireSense AI</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>AI-powered resume intelligence for India&apos;s job seekers.</p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}>{l}</a>
          ))}
        </div>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '24px' }}>© 2025 HireSense AI. Made with ♥ for India.</p>
      </footer>
    </div>
  );
}
