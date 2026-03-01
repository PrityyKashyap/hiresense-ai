'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

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

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase');

        if (isDemoMode) {
            await new Promise((r) => setTimeout(r, 600));
            toast.success('Demo login successful! 🎉');
            router.push('/dashboard/student');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
            if (error) throw error;
            const role = data.user?.user_metadata?.role || 'student';
            toast.success('Welcome back! 👋');
            router.push(role === 'company' ? '/dashboard/company' : '/dashboard/student');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
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

    const demoLogin = async (role: 'student' | 'company') => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        toast.success(`Demo ${role} login! 🎉`);
        router.push(role === 'company' ? '/dashboard/company' : '/dashboard/student');
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0f6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Brain size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>HireSense <span style={{ color: '#3b82f6' }}>AI</span></span>
                </Link>

                <div className="glass" style={{ padding: '36px', boxShadow: '0 4px 32px rgba(59,130,246,0.12)' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: '#0f172a', textAlign: 'center' }}>Welcome back</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>Sign in to your HireSense AI account</p>

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
                        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(59,130,246,0.15)' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>or sign in with email</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(59,130,246,0.15)' }} />
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                                <input className="input-dark" type={showPw ? 'text' : 'password'} placeholder="Your password" value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: '40px', paddingRight: '44px' }} required />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '4px', padding: '13px' }}>
                            {loading ? <><span className="spinner" /> Signing in...</> : <>Sign In <ChevronRight size={16} /></>}
                        </button>
                    </form>

                    {/* Demo buttons */}
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(59,130,246,0.15)' }} />
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Try demo</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(59,130,246,0.15)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button onClick={() => demoLogin('student')} className="btn-secondary" style={{ fontSize: '13px', justifyContent: 'center', padding: '10px' }}>
                                Demo: Student
                            </button>
                            <button onClick={() => demoLogin('company')} className="btn-secondary" style={{ fontSize: '13px', justifyContent: 'center', padding: '10px' }}>
                                Demo: Company
                            </button>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
