"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Percent, Wallet,
    ArrowUpRight, ArrowDownRight, Calendar, BarChart3
} from 'lucide-react';

type MonthlyData = {
    month: string;
    gross: number;
    net: number;
    commission: number;
};

type EarningsData = {
    totalGross: number;
    totalNet: number;
    totalCommission: number;
    pendingPayout: number;
    commissionRate: number;
    monthlyBreakdown: MonthlyData[];
    topProducts: { name: string; revenue: number; orders: number }[];
};

export default function VendorEarningsClient({ data }: { data: EarningsData }) {
    const [view, setView] = useState<'monthly' | 'products'>('monthly');

    const statCards = [
        {
            label: 'Brüt Ciro',
            value: `₺${data.totalGross.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: '#FFBF00',
            bg: 'rgba(255,191,0,0.08)',
            border: 'rgba(255,191,0,0.2)',
            sub: 'Toplam satış hasılatı',
        },
        {
            label: 'Net Kazanım',
            value: `₺${data.totalNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.08)',
            border: 'rgba(52,211,153,0.2)',
            sub: `%${data.commissionRate} komisyon sonrası`,
        },
        {
            label: 'Komisyon Kesintisi',
            value: `₺${data.totalCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            icon: Percent,
            color: '#f87171',
            bg: 'rgba(248,113,113,0.08)',
            border: 'rgba(248,113,113,0.2)',
            sub: `%${data.commissionRate} platform payı`,
        },
        {
            label: 'Bekleyen Ödeme',
            value: `₺${data.pendingPayout.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
            icon: Wallet,
            color: '#60a5fa',
            bg: 'rgba(96,165,250,0.08)',
            border: 'rgba(96,165,250,0.2)',
            sub: 'Hesabınıza aktarılacak',
        },
    ];

    const maxGross = Math.max(...data.monthlyBreakdown.map(m => m.gross), 1);

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Finans & Hakediş</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">Kazançlarım</h1>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="p-6 rounded-2xl border"
                            style={{ background: card.bg, borderColor: card.border }}
                        >
                            <Icon size={22} style={{ color: card.color }} className="mb-4" />
                            <p className="text-2xl font-black text-white mb-1">{card.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{card.label}</p>
                            <p className="text-[10px] text-white/30 mt-1">{card.sub}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl border border-white/10 w-fit" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {(['monthly', 'products'] as const).map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${view === v
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'text-white/40 hover:text-white'
                            }`}
                    >
                        {v === 'monthly' ? (
                            <span className="flex items-center gap-2"><Calendar size={12} /> Aylık</span>
                        ) : (
                            <span className="flex items-center gap-2"><BarChart3 size={12} /> Ürünler</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Monthly Breakdown */}
            {view === 'monthly' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border p-6 space-y-4"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Aylık Ciro Dağılımı</h2>
                    {data.monthlyBreakdown.length === 0 ? (
                        <div className="py-12 text-center">
                            <BarChart3 size={40} className="mx-auto mb-3 text-white/10" />
                            <p className="text-white/30 text-sm font-medium">Henüz satış verisi yok</p>
                            <p className="text-white/20 text-xs mt-1">İlk siparişiniz geldiğinde burada görünecek</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.monthlyBreakdown.map((month, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-white/70">{month.month}</span>
                                        <div className="flex items-center gap-4 text-right">
                                            <span className="text-yellow-400 font-bold">₺{month.gross.toLocaleString('tr-TR')}</span>
                                            <span className="text-green-400 font-bold">₺{month.net.toLocaleString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(month.gross / maxGross) * 100}%` }}
                                            transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: 'linear-gradient(90deg, #60a5fa, #FFBF00)' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Top Products */}
            {view === 'products' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border p-6"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4">En Çok Satanlar</h2>
                    {data.topProducts.length === 0 ? (
                        <div className="py-12 text-center">
                            <TrendingUp size={40} className="mx-auto mb-3 text-white/10" />
                            <p className="text-white/30 text-sm font-medium">Henüz ürün satışı yok</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.topProducts.map((product, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5"
                                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white' }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-white/40">{product.orders} sipariş</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-yellow-400 text-sm">₺{product.revenue.toLocaleString('tr-TR')}</p>
                                        {i === 0 && (
                                            <div className="flex items-center gap-1 justify-end">
                                                <ArrowUpRight size={10} className="text-green-400" />
                                                <span className="text-[9px] text-green-400 font-bold">EN İYİ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
