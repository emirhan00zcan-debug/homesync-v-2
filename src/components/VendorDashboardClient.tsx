"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import VendorAIReport from './VendorAIReport';

type VendorStats = {
    productCount: number;
    orderCount: number;
    grossRevenue: number;
    netRevenue: number;
    commissionRate: number;
    vendorStatus: string;
    fullName: string | null;
};

const StatusIndicator = ({ status }: { status: string }) => {
    if (status === 'ACTIVE') return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <CheckCircle size={12} className="text-green-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Aktif</span>
        </div>
    );
    if (status === 'SUSPENDED') return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <AlertCircle size={12} className="text-red-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Askıya Alındı</span>
        </div>
    );
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(255,191,0,0.1)', borderColor: 'rgba(255,191,0,0.2)' }}>
            <Clock size={12} className="text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Onay Bekliyor</span>
        </div>
    );
};

export default function VendorDashboardClient({ stats }: { stats: VendorStats }) {
    const commissionAmount = stats.grossRevenue * (stats.commissionRate / 100);

    const cards = [
        {
            label: 'Aktif Ürünler',
            value: stats.productCount,
            icon: Package,
            color: '#60a5fa',
            bg: 'rgba(96,165,250,0.08)',
            border: 'rgba(96,165,250,0.2)',
            href: '/dashboard/vendor/products',
        },
        {
            label: 'Toplam Sipariş',
            value: stats.orderCount,
            icon: ShoppingCart,
            color: '#a78bfa',
            bg: 'rgba(167,139,250,0.08)',
            border: 'rgba(167,139,250,0.2)',
            href: '/dashboard/vendor/orders',
        },
        {
            label: 'Brüt Gelir',
            value: `₺${stats.grossRevenue.toLocaleString('tr-TR')}`,
            icon: TrendingUp,
            color: '#FFBF00',
            bg: 'rgba(255,191,0,0.08)',
            border: 'rgba(255,191,0,0.2)',
            href: '/dashboard/vendor/earnings',
        },
        {
            label: 'Net Kazanım',
            value: `₺${stats.netRevenue.toLocaleString('tr-TR')}`,
            icon: DollarSign,
            color: '#34d399',
            bg: 'rgba(52,211,153,0.08)',
            border: 'rgba(52,211,153,0.2)',
            href: '/dashboard/vendor/earnings',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Satıcı Paneli</p>
                    <h1 className="text-4xl font-black text-white tracking-tighter">{stats.fullName || 'Satıcı'}</h1>
                </motion.div>
                <StatusIndicator status={stats.vendorStatus} />
            </div>

            {/* Commission info bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{ background: 'rgba(255,191,0,0.04)', borderColor: 'rgba(255,191,0,0.15)' }}
            >
                <div>
                    <p className="text-sm font-bold text-white">Platform Komisyon Oranın</p>
                    <p className="text-xs text-white/40 mt-0.5">Süper Admin tarafından belirlendi</p>
                </div>
                <div className="text-right sm:text-right">
                    <p className="text-2xl font-black text-yellow-400">%{stats.commissionRate}</p>
                    {stats.grossRevenue > 0 && (
                        <p className="text-xs text-white/40">
                            ₺{commissionAmount.toLocaleString('tr-TR')} kesildi
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link
                                href={card.href}
                                className="block p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:border-white/20"
                                style={{ background: card.bg, borderColor: card.border }}
                            >
                                <Icon size={22} style={{ color: card.color }} className="mb-4" />
                                <p className="text-2xl font-black text-white mb-1">{card.value}</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{card.label}</p>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-4">Hızlı İşlemler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard/vendor/products/new"
                        className="flex items-center gap-4 p-5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.01] group"
                        style={{ background: 'rgba(96,165,250,0.04)' }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                            <Package size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">Yeni Ürün Ekle</p>
                            <p className="text-xs text-white/40">Kataloğunu genişlet</p>
                        </div>
                    </Link>
                    <Link
                        href="/dashboard/vendor/orders"
                        className="flex items-center gap-4 p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.01] group"
                        style={{ background: 'rgba(167,139,250,0.04)' }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                            <ShoppingCart size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">Siparişleri Gör</p>
                            <p className="text-xs text-white/40">Bekleyen {stats.orderCount} sipariş</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* AI Report */}
            <div className="mt-8">
                <VendorAIReport stats={stats} />
            </div>

            {/* Desktop-focused comprehensive features */}
            <div className="hidden lg:grid grid-cols-3 gap-6 mt-8">
                {/* Charts Section */}
                <div className="col-span-2 p-6 rounded-2xl border bg-white/[0.02] border-white/10 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black text-white">Satış Grafiği</h3>
                            <p className="text-xs text-white/40">Son 30 günlük ciro ve sipariş analizi</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                            <option>Son 30 Gün</option>
                            <option>Bu Yıl</option>
                        </select>
                    </div>
                    <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                        <div className="text-center text-white/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-50"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            <p className="text-sm font-bold">Satış Grafiği Yükleniyor...</p>
                            <p className="text-xs mt-1 text-white/20">Görselleştirme için yeterli veri bekleniyor</p>
                        </div>
                    </div>
                </div>

                {/* Quick Action / Top Products (Desktop Sidebar style) */}
                <div className="p-6 rounded-2xl border bg-white/[0.02] border-white/10 flex flex-col">
                    <h3 className="text-lg font-black text-white mb-6">Çok Satanlar</h3>
                    <div className="space-y-4 flex-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white line-clamp-1">Premium Aydınlatma {i}</p>
                                    <p className="text-xs text-white/40">{15 - i} Satış</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-400">₺{(2450 * (4 - i)).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/20 transition-colors">
                        Tüm Ürünleri Gör
                    </button>
                </div>
            </div>

            {/* Data Table (Desktop UX focus) */}
            <div className="mt-8 hidden sm:block">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-black text-white">Son Siparişler</h3>
                        <p className="text-xs text-white/40">Tüm sipariş operasyonlarını buradan detaylı yönetin</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition">
                            <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Filtrele</span>
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-400 hover:bg-green-500/20 transition">
                            <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Excel İndir</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="p-4 text-xs font-bold tracking-wider text-white/40 uppercase">Sipariş No</th>
                                <th className="p-4 text-xs font-bold tracking-wider text-white/40 uppercase">Müşteri</th>
                                <th className="p-4 text-xs font-bold tracking-wider text-white/40 uppercase">Tarih</th>
                                <th className="p-4 text-xs font-bold tracking-wider text-white/40 uppercase">Tutar</th>
                                <th className="p-4 text-xs font-bold tracking-wider text-white/40 uppercase">Durum</th>
                                <th className="p-4 text-xs font-bold tracking-wider text-white/40 uppercase text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                    <td className="p-4 text-sm font-medium text-white/80 group-hover:text-blue-400 transition-colors">#ORD-2026-{8473 + i}</td>
                                    <td className="p-4 text-sm text-white/60">Müşteri {i}</td>
                                    <td className="p-4 text-sm text-white/60">03.03.2026 14:{10 * i}</td>
                                    <td className="p-4 text-sm font-bold text-white">₺{(1250.50 * i).toLocaleString('tr-TR')}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                            Hazırlanıyor
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-xs font-bold text-blue-400 hover:text-blue-300">Detay Gör</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
