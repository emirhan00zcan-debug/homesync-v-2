"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Heart, ShoppingCart, TrendingUp, Package } from 'lucide-react';

type ProductStat = {
    id: string;
    name: string;
    view_count: number;
    like_count: number;
    order_count: number;
    revenue: number;
    status: string;
};

export default function VendorStatsClient({ products }: { products: ProductStat[] }) {
    if (products.length === 0) {
        return (
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Performans</p>
                    <h1 className="text-4xl font-black text-white tracking-tighter">İstatistikler</h1>
                </motion.div>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <BarChart3 size={56} className="text-white/10 mb-4" />
                    <p className="text-white/40 font-bold text-lg">Henüz ürün istatistiği yok</p>
                    <p className="text-white/20 text-sm mt-2">Ürün ekledikten sonra görüntülenme ve satış verileri burada görünecek.</p>
                </div>
            </div>
        );
    }

    const totalViews = products.reduce((s, p) => s + p.view_count, 0);
    const totalLikes = products.reduce((s, p) => s + p.like_count, 0);
    const totalOrders = products.reduce((s, p) => s + p.order_count, 0);
    const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);

    const summary = [
        { label: 'Toplam Görüntülenme', value: totalViews.toLocaleString('tr-TR'), icon: Eye, color: '#60a5fa' },
        { label: 'Toplam Beğeni', value: totalLikes.toLocaleString('tr-TR'), icon: Heart, color: '#f472b6' },
        { label: 'Toplam Sipariş', value: totalOrders.toLocaleString('tr-TR'), icon: ShoppingCart, color: '#a78bfa' },
        { label: 'Toplam Ciro', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, icon: TrendingUp, color: '#FFBF00' },
    ];

    const maxViews = Math.max(...products.map(p => p.view_count), 1);

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Performans</p>
                <h1 className="text-4xl font-black text-white tracking-tighter">İstatistikler</h1>
            </motion.div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="p-5 rounded-2xl border"
                            style={{ background: `${s.color}0d`, borderColor: `${s.color}30` }}
                        >
                            <Icon size={20} style={{ color: s.color }} className="mb-3" />
                            <p className="text-xl font-black text-white">{s.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Product breakdown table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
                <div className="p-5 border-b border-white/5">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Ürün Bazlı Performans</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-5 hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Package size={14} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-sm truncate">{product.name}</p>
                                    <span
                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${product.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                            product.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                'bg-yellow-500/10 text-yellow-400'}`}
                                    >
                                        {product.status === 'approved' ? 'Onaylı' : product.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-yellow-400 text-sm">₺{product.revenue.toLocaleString('tr-TR')}</p>
                                    <p className="text-[10px] text-white/30">{product.order_count} sipariş</p>
                                </div>
                            </div>
                            {/* View bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-white/30">
                                    <span className="flex items-center gap-1"><Eye size={10} /> {product.view_count}</span>
                                    <span className="flex items-center gap-1"><Heart size={10} /> {product.like_count}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(product.view_count / maxViews) * 100}%` }}
                                        transition={{ delay: i * 0.05 + 0.3, duration: 0.7, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
