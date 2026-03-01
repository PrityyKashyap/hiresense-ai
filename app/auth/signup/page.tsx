'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, Eye, EyeOff, User, Building2, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type Role = 'student' | 'company';

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.316 0-9.828-3.421-11.412-8.131l-6.515 5.022C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.021 35.625 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
        </svg>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>('student');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
        setLoading(true);

        const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase');

        if (isDemoMode) {
            await new Promise((r) => setTimeout(r, 800));
            toast.success('Demo mode: Account created! Welcome to HireSense AI 🎉');
            router.push(role === 'company' ? '/dashboard/company' : '/dashboard/student');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email: form.email, password: form.password,
                options: { data: { name: form.name, role } },
            });
            if (error) throw error;
            toast.success('Account created! Welcome to HireSense AI 🎉');
            router.push(role === 'company' ? '/dashboard/company' : '/dashboard/student');
        } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('rate limit') || msg.includes('too many')) {
                toast.error('Too many signups — please wait 1 minute and try again, or Sign In if you already have an account.');
            } else if (msg.includes('already registered') || msg.includes('already been registered')) {
                toast.error('This email is already registered. Please Sign In instead.');
            } else {
                toast.error(msg || 'Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Google sign-in failed.');
            setGoogleLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0f6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Brain size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>HireSense <span style={{ color: '#3b82f6' }}>AI</span></span>
                </Link>

                <div className="glass" style={{ padding: '36px', boxShadow: '0 4px 32px rgba(59,130,246,0.12)' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: '#0f172a', textAlign: 'center' }}>Create your account</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>Join thousands of students and companies</p>

                    {/* Google Sign-In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', padding: '12px', borderRadius: '10px', cursor: 'pointer',
                            background: 'white', border: '1.5px solid rgba(59,130,246,0.25)',
                            fontWeight: 600, fontSize: '14px', color: '#1e293b',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)', transition: 'all 0.2s',
                            marginBottom: '20px', opacity: googleLoading ? 0.7 : 1,
                        }}
                    >
                        {googleLoading ? <span className="spinner" /> : <GoogleIcon />}
                        {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(59,130,246,0.15)' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>or sign up with email</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(59,130,246,0.15)' }} />
                    </div>

                    {/* Role toggle */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                        {(['student', 'company'] as Role[]).map((r) => (
                            <button key={r} onClick={() => setRole(r)} style={{
                                padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                                border: role === r ? '2px solid #3b82f6' : '1.5px solid rgba(59,130,246,0.2)',
                                background: role === r ? 'rgba(59,130,246,0.08)' : 'white',
                                color: role === r ? '#2563eb' : '#64748b', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}>
                                {r === 'student' ? <User size={16} /> : <Building2 size={16} />}
                                {r === 'student' ? 'Job Seeker' : 'Company'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input className="input-dark" type="text" placeholder="Your name" value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ paddingLeft: '40px' }} required />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input className="input-dark" type="email" placeholder="you@example.com" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: '40px' }} required />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input className="input-dark" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: '40px', paddingRight: '44px' }} required minLength={8} />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '6px', padding: '13px' }}>
                            {loading ? <><span className="spinner" /> Creating account...</> : <>Create Account <ChevronRight size={16} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
