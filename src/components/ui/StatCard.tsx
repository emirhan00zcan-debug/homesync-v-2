"use client";

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number; // percentage, positive=up, negative=down
    trendLabel?: string;
    accentColor?: string; // tailwind bg class e.g. 'from-amber-400 to-orange-500'
    loading?: boolean;
    prefix?: string;
    suffix?: string;
    subtitle?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    accentColor = 'from-radiant-amber to-orange-500',
    loading = false,
    prefix = '',
    suffix = '',
    subtitle,
}: StatCardProps) {
    const TrendIcon = trend === undefined
        ? Minus
        : trend > 0
            ? TrendingUp
            : trend < 0
                ? TrendingDown
                : Minus;

    const trendColor = trend === undefined
        ? 'text-white/30'
        : trend > 0
            ? 'text-emerald-400'
            : trend < 0
                ? 'text-red-400'
                : 'text-white/30';

    if (loading) {
        return (
            <div className="rounded-3xl border border-white/10 p-6 animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="h-4 bg-white/10 rounded-full w-2/3 mb-4" />
                <div className="h-8 bg-white/10 rounded-full w-1/2 mb-3" />
                <div className="h-3 bg-white/5 rounded-full w-1/3" />
            </div>
        );
    }

    return (
        <div
            className="group rounded-3xl border border-white/10 p-6 hover:border-white/20 transition-all duration-500 hover:shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}
        >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(255,191,0,0.08) 0%, transparent 70%)' }} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                            {title}
                        </p>
                        {subtitle && (
                            <p className="text-[9px] text-white/20 uppercase tracking-wider">{subtitle}</p>
                        )}
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${accentColor} shadow-lg`}>
                        <Icon size={18} className="text-cosmic-blue" />
                    </div>
                </div>

                <p className="text-3xl font-black text-white tracking-tight mb-3">
                    {prefix}<span>{value}</span>{suffix}
                </p>

                {trend !== undefined && (
                    <div className={`flex items-center gap-1.5 ${trendColor}`}>
                        <TrendIcon size={13} />
                        <span className="text-[10px] font-bold">
                            {trend > 0 ? '+' : ''}{trend}%
                            {trendLabel && <span className="ml-1 text-white/20">{trendLabel}</span>}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
