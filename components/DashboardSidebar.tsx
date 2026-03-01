'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brain, LayoutDashboard, Upload, History, LogOut, ChevronRight, Briefcase, Users, Plus, MessageSquare, Github, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface SidebarProps {
    role: 'student' | 'company';
}

const STUDENT_LINKS = [
    { href: '/dashboard/student', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { href: '/dashboard/student/analyze', icon: <Upload size={18} />, label: 'Analyze Resume' },
    { href: '/dashboard/student/history', icon: <History size={18} />, label: 'Scan History' },
    { href: '/dashboard/student/mock-interview', icon: <MessageSquare size={18} />, label: 'Mock Interview', badge: 'NEW' },
    { href: '/dashboard/student/github-analyzer', icon: <Github size={18} />, label: 'GitHub Analyzer', badge: 'NEW' },
];

const COMPANY_LINKS = [
    { href: '/dashboard/company', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { href: '/dashboard/company/jobs/new', icon: <Plus size={18} />, label: 'Post a Job' },
    { href: '/dashboard/company/candidates', icon: <Users size={18} />, label: 'Candidates' },
    { href: '/dashboard/company/shortlist', icon: <Zap size={18} />, label: 'AI Shortlist', badge: 'HOT' },
];

export default function DashboardSidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const links = role === 'company' ? COMPANY_LINKS : STUDENT_LINKS;

    const handleLogout = async () => {
        await supabase.auth.signOut().catch(() => { });
        toast.success('Logged out');
        router.push('/');
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '4px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={18} color="white" />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f0ff' }}>HireSense <span style={{ color: '#8b5cf6' }}>AI</span></span>
            </Link>

            {/* Role badge */}
            <div className={`badge ${role === 'company' ? 'badge-blue' : 'badge-purple'}`} style={{ marginBottom: '24px', alignSelf: 'flex-start' }}>
                {role === 'company' ? <Briefcase size={11} /> : <Users size={11} />}
                {role === 'company' ? 'Company' : 'Job Seeker'}
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b6b8a', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 14px', marginBottom: '8px' }}>
                    Main Menu
                </div>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                    >
                        {link.icon}
                        <span style={{ flex: 1 }}>{link.label}</span>
                        {'badge' in link && link.badge && (
                            <span className="badge badge-purple" style={{ fontSize: '9px', padding: '2px 6px' }}>{link.badge}</span>
                        )}
                        {pathname === link.href && <ChevronRight size={14} style={{ color: '#8b5cf6' }} />}
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#6b6b8a' }}>
                <LogOut size={18} />
                Logout
            </button>
        </aside>
    );
}
