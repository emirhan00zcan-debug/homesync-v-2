"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    CalendarDays,
    Bell,
    TrendingUp,
    MapPin,
    Phone,
    Bot,
    Wrench,
    ChevronRight,
    AlertTriangle,
    Clock,
    CheckCircle2,
    CheckCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

type TechStats = {
    fullName: string | null;
    toplam_puan: number;
    tamamlanan_is_sayisi: number;
    toplam_kazanc: number;
    kesilen_komisyon: number;
    pendingJobs: number;
    activeJobs: number;
    isVerified: boolean;
};

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

export default function TechnicianDashboardClient({
    stats,
    initialJobs = []
}: {
    stats: TechStats,
    initialJobs?: ServiceRequest[]
}) {
    const netEarnings = `₺${stats.toplam_kazanc.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`;

    // Use actual pending/accepted jobs for appointments
    const upcomingJobs = initialJobs
        .filter(j => j.status === 'accepted' || j.status === 'pending')
        .slice(0, 5);

    const statCards = [
        {
            id: 'today',
            icon: CalendarDays,
            iconColor: 'text-sky-400',
            bgColor: 'from-sky-500/10 to-sky-500/0',
            borderColor: 'border-sky-400/20',
            value: String(stats.activeJobs || 0),
            label: 'Aktif Montajlar',
            sub: stats.activeJobs > 0 ? `${stats.activeJobs} aktif randevunuz var` : 'Aktif randevu yok',
            urgent: false,
        },
        {
            id: 'pending',
            icon: Bell,
            iconColor: 'text-radiant-amber',
            bgColor: 'from-amber-500/15 to-amber-500/0',
            borderColor: 'border-radiant-amber/30',
            value: String(stats.pendingJobs || 0),
            label: 'Bekleyen Talepler',
            sub: stats.pendingJobs > 0 ? 'Onayınızı bekleyen yeni iş var' : 'Yeni talep bulunmuyor',
            urgent: stats.pendingJobs > 0,
        },
        {
            id: 'earnings',
            icon: TrendingUp,
            iconColor: 'text-emerald-400',
            bgColor: 'from-emerald-500/10 to-emerald-500/0',
            borderColor: 'border-emerald-400/20',
            value: netEarnings,
            label: 'Bu Ayki Kazanç',
            sub: `${stats.tamamlanan_is_sayisi} Başarılı Kurulum`,
            urgent: false,
        },
    ];

    function openMap(address: string) {
        if (!address) return;
        const query = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }

    return (
        <div className="p-6 md:p-10 space-y-10">

            {/* ── Header ── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <p className="text-radiant-amber text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                        Hoş Geldin, Sertifikalı Usta
                    </p>
                    <h1 className="text-4xl font-black text-white">{stats.fullName || 'Usta'}</h1>
                </div>
                {stats.isVerified ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 self-start sm:self-end">
                        <CheckCircle size={13} className="text-green-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Doğrulanmış Usta</span>
                    </div>
                ) : (
                    <Link
                        href="/dashboard/technician/verification"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 self-start sm:self-end hover:bg-yellow-500/20 transition-colors group"
                    >
                        <AlertCircle size={13} className="text-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Doğrulama Bekiyor</span>
                        <ArrowRight size={12} className="text-yellow-400/50 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                )}
            </header>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`relative overflow-hidden glass p-7 rounded-3xl border ${card.borderColor} bg-gradient-to-br ${card.bgColor}`}
                    >
                        {card.urgent && (
                            <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radiant-amber opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-radiant-amber" />
                            </span>
                        )}
                        <card.icon size={22} className={`${card.iconColor} mb-4`} />
                        <p className={`text-4xl font-black ${card.urgent ? 'text-radiant-amber' : 'text-white'}`}>
                            {card.value}
                        </p>
                        <p className="text-[11px] uppercase font-black tracking-widest text-white/50 mt-1">{card.label}</p>
                        <p className="text-[11px] text-white/30 mt-1">{card.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Bottom Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Appointments Table (2/3) ── */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="xl:col-span-2 glass rounded-[32px] border border-white/10 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-radiant-amber/10 flex items-center justify-center">
                                <Clock size={16} className="text-radiant-amber" />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-white/70">
                                Yaklaşan Görevler
                            </h2>
                        </div>
                        <a
                            href="/dashboard/technician/jobs"
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-radiant-amber/70 hover:text-radiant-amber transition-colors"
                        >
                            Tümü <ChevronRight size={12} />
                        </a>
                    </div>

                    <div className="divide-y divide-white/5">
                        {upcomingJobs.length === 0 ? (
                            <div className="p-10 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                                Yakın zamanda görev bulunmuyor
                            </div>
                        ) : upcomingJobs.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.03] transition-colors"
                            >
                                {/* Time badge */}
                                <div className="flex-shrink-0 text-center bg-white/5 rounded-2xl px-4 py-3 min-w-[80px]">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                        {job.scheduled_at ? new Date(job.scheduled_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '---'}
                                    </p>
                                    <p className="text-lg font-black text-white">
                                        {job.scheduled_at ? new Date(job.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </p>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-black text-white truncate">{job.customer_name}</p>
                                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-white/40">
                                            <MapPin size={10} /> {job.district || job.city || 'Konum Belirtilmemiş'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/40 truncate">{job.title}</p>
                                </div>

                                {/* Status */}
                                <div className="flex-shrink-0 hidden md:flex items-center gap-1.5">
                                    {job.status === 'accepted'
                                        ? <CheckCircle2 size={13} className="text-emerald-400" />
                                        : <Clock size={13} className="text-radiant-amber" />
                                    }
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${job.status === 'accepted' ? 'text-emerald-400' : 'text-radiant-amber'}`}>
                                        {job.status === 'accepted' ? 'Kabul Edildi' : 'Bekliyor'}
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => openMap(job.address || '')}
                                        disabled={!job.address}
                                        className="flex items-center gap-1.5 bg-radiant-amber text-cosmic-blue text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:brightness-110 transition-all shadow-glow disabled:opacity-50"
                                    >
                                        <MapPin size={12} /> Haritada Aç
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── AI Kurulum Asistanı (1/3) ── */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="xl:col-span-1 glass rounded-[32px] border border-white/10 flex flex-col overflow-hidden"
                >
                    <div className="p-6 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center border border-violet-400/20">
                                <Bot size={18} className="text-violet-300" />
                            </div>
                            <div>
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-white">AI Kurulum Asistanı</h2>
                                <p className="text-[9px] text-violet-300/70 uppercase tracking-widest font-bold">Sıradaki Montaj İçin AI İpuçları</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 space-y-4">
                        {/* Context pill */}
                        <div className="flex items-center gap-2 bg-radiant-amber/10 border border-radiant-amber/20 rounded-2xl px-4 py-2.5">
                            <Wrench size={13} className="text-radiant-amber flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[9px] text-radiant-amber/60 font-bold uppercase tracking-widest">Bugün 14:30</p>
                                <p className="text-[11px] font-black text-radiant-amber truncate">Zenith Serisi Akıllı TV Ünitesi</p>
                            </div>
                        </div>

                        {/* Warning tip */}
                        <div className="flex gap-3 p-4 bg-orange-500/10 border border-orange-400/20 rounded-2xl">
                            <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                Bu modelde <span className="text-orange-300 font-bold">C-Tipi vidalar</span> kronik olarak zor sıkılmaktadır. Şarjlı matkabınızın <span className="text-orange-300 font-bold">tork ayarını düşürün.</span>
                            </p>
                        </div>

                        {/* Info tip */}
                        <div className="flex gap-3 p-4 bg-sky-500/10 border border-sky-400/20 rounded-2xl">
                            <Clock size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                Kurulum ortalama <span className="text-sky-300 font-bold">45 dakika</span> sürmektedir. Ek vida seti yanınızda bulundurun.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 pt-2">
                        <button className="w-full group flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg">
                            <Bot size={14} className="group-hover:rotate-12 transition-transform" />
                            Kurulum Şemasını Özetle
                        </button>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
