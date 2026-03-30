"use client";

import React from 'react';

type BadgeVariant =
    | 'active'
    | 'pending'
    | 'inactive'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'default';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    dot?: boolean;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pending: 'bg-radiant-amber/15 text-radiant-amber border-radiant-amber/30',
    inactive: 'bg-white/5 text-white/40 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    default: 'bg-white/10 text-white/60 border-white/15',
};

const dotColors: Record<BadgeVariant, string> = {
    active: 'bg-emerald-400',
    pending: 'bg-radiant-amber',
    inactive: 'bg-white/30',
    success: 'bg-emerald-400',
    warning: 'bg-orange-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    default: 'bg-white/40',
};

export default function Badge({
    variant = 'default',
    children,
    dot = false,
    className = '',
}: BadgeProps) {
    return (
        <span
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                text-[10px] font-black uppercase tracking-widest
                border ${variantStyles[variant]} ${className}
            `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
            )}
            {children}
        </span>
    );
}
