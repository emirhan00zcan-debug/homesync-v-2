"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Package, ShoppingBag, TrendingUp, Star, ChevronRight, Plus } from 'lucide-react';

export default function SellerDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Toplam Ürün', value: '0', icon: Package, color: 'text-radiant-amber' },
        { label: 'Toplam Sipariş', value: '0', icon: ShoppingBag, color: 'text-blue-400' },
        { label: 'Toplam Kazanç', value: '0 ₺', icon: TrendingUp, color: 'text-green-400' },
        { label: 'Mağaza Puanı', value: '-', icon: Star, color: 'text-yellow-400' },
    ];

    return (
        <div className="p-6 md:p-10 space-y-10">
            {/* Header */}
            <header className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-radiant-amber text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                        Satıcı Paneli
                    </p>
                    <h1 className="text-4xl font-black text-white">{user?.name || 'Satıcı'}</h1>
                </div>
                <a
                    href="/seller/products"
                    className="flex items-center gap-2 px-5 py-3 bg-radiant-amber text-cosmic-blue font-black rounded-2xl hover:scale-[1.02] transition-transform text-xs uppercase tracking-widest"
                >
                    <Plus size={16} /> Ürün Ekle
                </a>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="glass p-6 rounded-3xl border border-white/10 bg-white/5"
                    >
                        <stat.icon size={20} className={`${stat.color} mb-3`} />
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                        <p className="text-[10px] uppercase font-bold text-white/40 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Links */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Hızlı Erişim</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { href: '/seller/products', icon: Package, label: 'Ürünlerim', desc: 'Envanterinizi görüntüleyin ve yönetin' },
                        { href: '/seller/orders', icon: ShoppingBag, label: 'Siparişlerim', desc: 'Gelen siparişleri takip edin' },
                    ].map((item) => (
                        <motion.a
                            key={item.href}
                            href={item.href}
                            whileHover={{ y: -4 }}
                            className="glass p-6 rounded-3xl border border-white/10 bg-white/5 hover:border-radiant-amber/30 transition-all group flex items-start gap-4"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-radiant-amber/10 flex items-center justify-center flex-shrink-0 group-hover:bg-radiant-amber/20 transition-all">
                                <item.icon size={18} className="text-radiant-amber" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-sm mb-1">{item.label}</p>
                                <p className="text-[11px] text-white/40">{item.desc}</p>
                            </div>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-radiant-amber transition-all mt-0.5" />
                        </motion.a>
                    ))}
                </div>
            </section>

            {/* Recent Orders Placeholder */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Son Siparişler</h2>
                <div className="glass p-10 rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-radiant-amber/10 flex items-center justify-center mb-4">
                        <ShoppingBag className="text-radiant-amber" size={28} />
                    </div>
                    <p className="font-bold text-white mb-1">Henüz sipariş yok</p>
                    <p className="text-xs text-white/40 max-w-xs mx-auto mb-5">
                        İlk siparişiniz geldiğinde burada görünecek.
                    </p>
                    <a href="/seller/products" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-radiant-amber hover:underline">
                        Ürün ekleyerek başla <ChevronRight size={14} />
                    </a>
                </div>
            </section>
        </div>
    );
}
