'use client';

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
    score: number;
    label: string;
    size?: number;
    color?: string;
}

export default function ScoreGauge({ score, label, size = 100, color = '#3b82f6' }: ScoreGaugeProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const progress = mounted ? (score / 100) * circumference : 0;
    const offset = circumference - progress;

    const getColor = () => {
        if (score >= 75) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const strokeColor = color || getColor();

    return (
        <div style={{ textAlign: 'center', width: size }}>
            <svg width={size} height={size} viewBox="0 0 100 100" className="score-ring" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background track */}
                <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="8" />
                {/* Progress */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 1.5s ease-out',
                        filter: `drop-shadow(0 0 6px ${strokeColor}55)`,
                    }}
                />
            </svg>
            <div style={{ marginTop: `-${size * 0.55}px`, fontSize: `${size * 0.22}px`, fontWeight: 900, color: strokeColor }}>
                {mounted ? score : 0}
            </div>
            <div style={{ fontSize: `${size * 0.12}px`, color: '#64748b', fontWeight: 500, marginTop: `${size * 0.25}px` }}>
                {label}
            </div>
        </div>
    );
}
