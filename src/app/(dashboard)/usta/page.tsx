"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
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
} from 'lucide-react';

/* ───────────────────────── mock data ───────────────────────── */
const appointments = [
    {
        id: 1,
        dateLabel: 'Bugün',
        time: '14:30',
        customer: 'Ahmet Y.',
        district: 'Kadıköy',
        address: 'Moda Cad. No:12, Kadıköy/İstanbul',
        product: 'Zenith Serisi Akıllı TV Ünitesi',
        status: 'Bekliyor',
    },
    {
        id: 2,
        dateLabel: 'Bugün',
        time: '17:00',
        customer: 'Elif S.',
        district: 'Beşiktaş',
        address: 'Barbaros Blv. No:34, Beşiktaş/İstanbul',
        product: 'Aurora Pro Akıllı Ayna',
        status: 'Bekliyor',
    },
    {
        id: 3,
        dateLabel: 'Yarın',
        time: '10:00',
        customer: 'Mert K.',
        district: 'Ataşehir',
        address: 'Emaar Bulvarı, Ataşehir/İstanbul',
        product: 'Orbit 360° Akıllı Aydınlatma Seti',
        status: 'Onaylandı',
    },
];

const statCards = [
    {
        id: 'today',
        icon: CalendarDays,
        iconColor: 'text-sky-400',
        bgColor: 'from-sky-500/10 to-sky-500/0',
        borderColor: 'border-sky-400/20',
        value: '3',
        label: 'Bugünkü Montajlar',
        sub: 'Bekleyen randevunuz var',
        urgent: false,
    },
    {
        id: 'pending',
        icon: Bell,
        iconColor: 'text-radiant-amber',
        bgColor: 'from-amber-500/15 to-amber-500/0',
        borderColor: 'border-radiant-amber/30',
        value: '1',
        label: 'Bekleyen Talepler',
        sub: 'Onayınızı bekleyen yeni iş var',
        urgent: true,
    },
    {
        id: 'earnings',
        icon: TrendingUp,
        iconColor: 'text-emerald-400',
        bgColor: 'from-emerald-500/10 to-emerald-500/0',
        borderColor: 'border-emerald-400/20',
        value: '₺12.450',
        label: 'Bu Ayki Kazanç',
        sub: '14 Başarılı Kurulum',
        urgent: false,
    },
];

/* ────────────────────────── component ──────────────────────── */
export default function UstaDashboard() {
    const { user } = useAuth();

    function openMap(address: string) {
        const query = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }

    return (
        <div className="p-6 md:p-10 space-y-10">

            {/* ── Header ── */}
            <header>
                <p className="text-radiant-amber text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                    Hoş Geldin, Sertifikalı Usta
                </p>
                <h1 className="text-4xl font-black text-white">{user?.name || 'Usta'}</h1>
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
                    {/* Table header */}
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-radiant-amber/10 flex items-center justify-center">
                                <Clock size={16} className="text-radiant-amber" />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-widest text-white/70">
                                Yaklaşan Randevular
                            </h2>
                        </div>
                        <a
                            href="/dashboard/technician/jobs"
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-radiant-amber/70 hover:text-radiant-amber transition-colors"
                        >
                            Tümü <ChevronRight size={12} />
                        </a>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/5">
                        {appointments.map((appt, i) => (
                            <motion.div
                                key={appt.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.03] transition-colors"
                            >
                                {/* Time badge */}
                                <div className="flex-shrink-0 text-center bg-white/5 rounded-2xl px-4 py-3 min-w-[80px]">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{appt.dateLabel}</p>
                                    <p className="text-lg font-black text-white">{appt.time}</p>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-black text-white truncate">{appt.customer}</p>
                                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-white/40">
                                            <MapPin size={10} /> {appt.district}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/40 truncate">{appt.product}</p>
                                </div>

                                {/* Status */}
                                <div className="flex-shrink-0 hidden md:flex items-center gap-1.5">
                                    {appt.status === 'Onaylandı'
                                        ? <CheckCircle2 size={13} className="text-emerald-400" />
                                        : <Clock size={13} className="text-radiant-amber" />
                                    }
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${appt.status === 'Onaylandı' ? 'text-emerald-400' : 'text-radiant-amber'}`}>
                                        {appt.status}
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => openMap(appt.address)}
                                        className="flex items-center gap-1.5 bg-radiant-amber text-cosmic-blue text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:brightness-110 transition-all shadow-glow"
                                    >
                                        <MapPin size={12} /> Haritada Aç
                                    </button>
                                    <a
                                        href="tel:"
                                        className="flex items-center gap-1.5 border border-white/20 text-white/60 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:border-white/40 hover:text-white transition-all"
                                    >
                                        <Phone size={12} /> Ara
                                    </a>
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
                    {/* Header */}
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

                    {/* AI tip content */}
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

                    {/* CTA */}
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
