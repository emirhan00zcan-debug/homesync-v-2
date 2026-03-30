"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Clock, CheckCircle, XCircle, AlertCircle,
    MapPin, Tag, CreditCard, Zap, ChevronRight
} from 'lucide-react';

type ServiceRequest = {
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    payment_type: string;
    price_offered: number | null;
    final_price: number | null;
    scheduled_at: string | null;
    address: string | null;
    city: string | null;
    district: string | null;
    created_at: string;
    customer_name: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    pending: { label: 'Bekliyor', color: '#FFBF00', bg: 'rgba(255,191,0,0.08)', border: 'rgba(255,191,0,0.2)', icon: Clock },
    accepted: { label: 'Kabul Edildi', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', icon: CheckCircle },
    rejected: { label: 'Reddedildi', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: XCircle },
    in_progress: { label: 'Aktif', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', icon: Zap },
    completed: { label: 'Tamamlandı', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', icon: CheckCircle },
    cancelled: { label: 'İptal', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', icon: XCircle },
};

const FILTERS = ['all', 'pending', 'accepted', 'in_progress', 'completed'] as const;
const FILTER_LABELS: Record<string, string> = {
    all: 'Tümü',
    pending: 'Bekleyen',
    accepted: 'Kabul Edildi',
    in_progress: 'Aktif',
    completed: 'Tamamlanan',
};

export default function TechnicianJobsClient({
    jobs,
    onAccept,
    onStart,
    onReject,
    onComplete,
}: {
    jobs: ServiceRequest[];
    onAccept: (id: string) => void;
    onStart: (id: string) => void;
    onReject: (id: string) => void;
    onComplete: (id: string) => void;
}) {
    const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
    const [loading, setLoading] = useState<string | null>(null);

    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

    const handleAction = async (action: (id: string) => void, id: string) => {
        setLoading(id);
        await action(id);
        setLoading(null);
    };

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">İş Yönetimi</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Görevlerim</h1>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${filter === f
                            ? 'bg-amber-400 text-cosmic-blue shadow-lg'
                            : 'text-white/40 bg-white/5 hover:text-white hover:bg-white/8'
                            }`}
                    >
                        {FILTER_LABELS[f]}
                        {f !== 'all' && (
                            <span className="ml-2 opacity-70">
                                ({jobs.filter(j => j.status === f).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Job List */}
            <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <Briefcase size={56} className="text-white/10 mb-4" />
                        <p className="text-white/40 font-bold text-lg">Bu kategoride iş yok</p>
                        <p className="text-white/20 text-sm mt-2">Hizmet bölgenizi ve kategorilerinizi güncelleyerek daha fazla talep alabilirsiniz.</p>
                    </motion.div>
                ) : (
                    <motion.div key="list" className="space-y-3">
                        {filtered.map((job, i) => {
                            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            return (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-5 rounded-2xl border transition-all hover:border-white/15"
                                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{job.title}</p>
                                            {job.customer_name && (
                                                <p className="text-xs text-white/40 mt-0.5">Müşteri: {job.customer_name}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0"
                                            style={{ background: cfg.bg, borderColor: cfg.border }}>
                                            <StatusIcon size={11} style={{ color: cfg.color }} />
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>

                                    {job.description && (
                                        <p className="text-xs text-white/50 mb-3 leading-relaxed line-clamp-2">{job.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/30 mb-4">
                                        <span className="flex items-center gap-1"><Tag size={10} /> {job.category}</span>
                                        {job.city && <span className="flex items-center gap-1"><MapPin size={10} /> {job.district ? `${job.district}, ${job.city}` : job.city}</span>}
                                        {job.payment_type && (
                                            <span className="flex items-center gap-1">
                                                <CreditCard size={10} />
                                                {job.payment_type === 'cash' ? 'Nakit' : 'Online'}
                                            </span>
                                        )}
                                        {(job.price_offered ?? job.final_price) && (
                                            <span className="text-amber-400 font-bold">
                                                ₺{(job.final_price ?? job.price_offered)?.toLocaleString('tr-TR')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {job.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAction(onAccept, job.id)}
                                                disabled={loading === job.id}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                                                style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
                                            >
                                                {loading === job.id ? '...' : '✓ Kabul Et'}
                                            </button>
                                            <button
                                                onClick={() => handleAction(onReject, job.id)}
                                                disabled={loading === job.id}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all disabled:opacity-50"
                                            >
                                                ✕ Reddet
                                            </button>
                                        </div>
                                    )}
                                    {job.status === 'accepted' && (
                                        <button
                                            onClick={() => handleAction(onStart, job.id)}
                                            disabled={loading === job.id}
                                            className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}
                                        >
                                            {loading === job.id ? '...' : '⚡ İşe Başla'}
                                        </button>
                                    )}
                                    {job.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleAction(onComplete, job.id)}
                                            disabled={loading === job.id}
                                            className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-all disabled:opacity-50"
                                        >
                                            {loading === job.id ? '...' : '✓ İşi Tamamla'}
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
