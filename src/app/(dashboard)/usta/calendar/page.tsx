"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2 } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

/** Returns 0=Mon … 6=Sun for the first day of a month */
function getFirstDayOfWeek(year: number, month: number) {
    const d = new Date(year, month, 1).getDay(); // 0=Sun
    return (d + 6) % 7; // shift to Mon=0
}

// Mock: days that have appointments
const MOCK_APPOINTMENTS: Record<string, number> = {
    '2026-03-05': 2,
    '2026-03-10': 1,
    '2026-03-15': 3,
    '2026-03-18': 1,
};

// Mock: days the usta marked as unavailable
const INITIAL_UNAVAILABLE = new Set<string>(['2026-03-22', '2026-03-23']);

type Appointment = { id: string; time: string; customer: string; service: string };
const MOCK_DETAIL: Record<string, Appointment[]> = {
    '2026-03-05': [
        { id: '1', time: '10:00', customer: 'Ayşe Kara', service: 'Aydınlatma Montajı' },
        { id: '2', time: '14:30', customer: 'Mehmet Er', service: 'LED Panel' },
    ],
    '2026-03-10': [
        { id: '3', time: '09:00', customer: 'Fatma Yıldız', service: 'Akıllı Kilit' },
    ],
};

export default function UstaCalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selected, setSelected] = useState<string | null>(null);
    const [unavailable, setUnavailable] = useState<Set<string>>(INITIAL_UNAVAILABLE);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDow = getFirstDayOfWeek(year, month);
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
        setSelected(null);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
        setSelected(null);
    };

    const dayKey = (d: number) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const toggleUnavailable = (key: string) => {
        setUnavailable(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const selectedApps = selected ? (MOCK_DETAIL[selected] ?? []) : [];

    return (
        <div className="p-5 md:p-8 space-y-8 max-w-2xl mx-auto">
            {/* ── Header ────────────────────────────────────────────────── */}
            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5">
                    Müsaitlik & Randevular
                </p>
                <h1 className="text-3xl font-black text-white">Takvim</h1>
            </motion.header>

            {/* ── Legend ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider">
                {[
                    { color: 'bg-orange-400', label: 'Randevu Var' },
                    { color: 'bg-red-500/40 border border-red-500/30', label: 'Müsait Değil' },
                    { color: 'bg-white/20', label: 'Bugün' },
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-white/50">
                        <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                        {l.label}
                    </div>
                ))}
            </div>

            {/* ── Calendar ──────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass rounded-3xl border border-white/10 bg-white/5 p-5"
            >
                {/* Month nav */}
                <div className="flex items-center justify-between mb-5">
                    <button onClick={prevMonth} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <h2 className="text-white font-black text-base">
                        {MONTHS_TR[month]} {year}
                    </h2>
                    <button onClick={nextMonth} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                    {DAYS_TR.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-white/30 uppercase pb-2">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: firstDow }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const d = i + 1;
                        const key = dayKey(d);
                        const isToday = key === today;
                        const hasApp = !!MOCK_APPOINTMENTS[key];
                        const isUnavail = unavailable.has(key);
                        const isSelected = selected === key;
                        const isPast = new Date(key) < new Date(today);

                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setSelected(isSelected ? null : key);
                                }}
                                onDoubleClick={() => !isPast && toggleUnavailable(key)}
                                title={isUnavail ? 'Müsait Değil' : hasApp ? `${MOCK_APPOINTMENTS[key]} randevu` : 'Boş gün (2x tıkla = müsait değil)'}
                                className={`
                                    relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                                    ${isSelected ? 'ring-2 ring-orange-400 scale-105' : ''}
                                    ${isToday ? 'bg-white/20 text-white' : ''}
                                    ${isUnavail ? 'bg-red-500/20 border border-red-500/30 text-red-400' : ''}
                                    ${hasApp && !isUnavail ? 'bg-orange-400/20 text-orange-400' : ''}
                                    ${!isToday && !isUnavail && !hasApp ? 'text-white/60 hover:bg-white/10' : ''}
                                    ${isPast ? 'opacity-40' : ''}
                                `}
                            >
                                {d}
                                {hasApp && !isUnavail && (
                                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="text-center text-[10px] text-white/20 mt-4 font-bold">
                    Bir güne çift tıkla → Müsait Değil işaretle
                </p>
            </motion.div>

            {/* ── Selected Day Appointments ─────────────────────────────── */}
            {selected && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-orange-400" />
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                            {selected} — Randevular
                        </h2>
                    </div>

                    {selectedApps.length === 0 ? (
                        <div className="glass p-6 rounded-2xl border border-white/10 text-center">
                            <p className="text-white/40 text-sm">Bu gün için randevu bulunmuyor.</p>
                            {unavailable.has(selected) && (
                                <p className="text-red-400 text-xs mt-2 font-bold">Bu gün müsait değil olarak işaretli.</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedApps.map((app) => (
                                <div key={app.id} className="glass flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center shrink-0">
                                        <Clock size={17} className="text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-sm">{app.customer}</p>
                                        <p className="text-white/40 text-[11px]">{app.service}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-orange-400 font-black text-sm shrink-0">
                                        <CheckCircle2 size={14} />
                                        {app.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.section>
            )}
        </div>
    );
}
