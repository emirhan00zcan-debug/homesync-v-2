"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    ChevronRight,
    Calendar,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Transaction = {
    id: string;
    label: string;
    amount: number;
    type: 'income' | 'payout';
    date: string;
    status: 'completed' | 'pending';
};

// In a real app, this data comes from Supabase queries
const mockTransactions: Transaction[] = [
    { id: '1', label: 'Aydınlatma Montajı Hakediş', amount: 450, type: 'income', date: '03 Mar 2026', status: 'completed' },
    { id: '2', label: 'Akıllı Kamera Kurulumu Hakediş', amount: 780, type: 'income', date: '01 Mar 2026', status: 'completed' },
    { id: '3', label: 'Bakiye Çekme', amount: -500, type: 'payout', date: '28 Şub 2026', status: 'completed' },
    { id: '4', label: 'LED Panel Montajı Hakediş', amount: 320, type: 'income', date: '25 Şub 2026', status: 'pending' },
];

const periods = ['Bu Hafta', 'Bu Ay', 'Tüm Zamanlar'];

export default function UstaWalletPage() {
    const [activePeriod, setActivePeriod] = useState('Bu Ay');

    const totalBalance = 1050;
    const pendingBalance = 320;
    const totalEarned = 1550;

    return (
        <div className="p-5 md:p-8 space-y-8 max-w-2xl mx-auto">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5">
                    Finansal Özet
                </p>
                <h1 className="text-3xl font-black text-white">Cüzdanım</h1>
            </motion.header>

            {/* ── Balance Card ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-8"
            >
                {/* Glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-400/20 flex items-center justify-center">
                            <Wallet size={16} className="text-orange-400" />
                        </div>
                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Kullanılabilir Bakiye</span>
                    </div>
                    <p className="text-5xl font-black text-white mb-1">
                        {totalBalance.toLocaleString('tr-TR')} <span className="text-orange-400 text-3xl">₺</span>
                    </p>
                    <p className="text-white/40 text-sm mt-2">
                        <Clock size={12} className="inline mr-1.5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">{pendingBalance} ₺</span> onay bekliyor
                    </p>
                </div>
                <button className="mt-6 w-full py-3.5 bg-orange-400 hover:bg-orange-500 active:scale-[0.98] text-cosmic-blue font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
                    <ArrowUpRight size={18} />
                    Bakiye Çek
                </button>
            </motion.div>

            {/* ── Stats Row ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Toplam Kazanç', value: `${totalEarned.toLocaleString('tr-TR')} ₺`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Tamamlanan İş', value: '3', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="glass p-5 rounded-2xl border border-white/10 bg-white/5"
                    >
                        <div className={`${stat.bg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon size={17} className={stat.color} />
                        </div>
                        <p className="text-xl font-black text-white">{stat.value}</p>
                        <p className="text-[10px] uppercase font-bold text-white/40 mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Period Filter ────────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
                <Calendar size={14} className="text-white/30" />
                <div className="flex gap-2">
                    {periods.map((p) => (
                        <button
                            key={p}
                            onClick={() => setActivePeriod(p)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePeriod === p
                                ? 'bg-orange-400 text-cosmic-blue'
                                : 'bg-white/5 text-white/40 hover:text-white'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Transactions ─────────────────────────────────────────────── */}
            <section className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/30">İşlem Geçmişi</h2>
                {mockTransactions.length === 0 ? (
                    <div className="glass p-10 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                        <Wallet size={28} className="text-orange-400 mb-3" />
                        <p className="font-bold text-white mb-1">Henüz işlem yok</p>
                        <p className="text-xs text-white/40">İşleriniz tamamlandıkça buraya eklenecek.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {mockTransactions.map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="glass flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-orange-400/20 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                                        {tx.type === 'income'
                                            ? <ArrowDownLeft size={18} className="text-green-400" />
                                            : <ArrowUpRight size={18} className="text-red-400" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-bold leading-tight">{tx.label}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-white/40 text-[11px]">{tx.date}</p>
                                            {tx.status === 'pending' && (
                                                <span className="text-[9px] font-black uppercase text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-md tracking-widest">
                                                    Bekliyor
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className={`font-black text-base ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('tr-TR')} ₺
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
