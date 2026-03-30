"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Activity, LucideIcon } from 'lucide-react';

interface Stat {
    label: string;
    value: string;
    icon: LucideIcon;
    trend: string;
}

interface AdminDashboardProps {
    stats: Stat[];
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div>
                <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Genel Bakış</h1>
                <p className="text-white/60">Platform üzerindeki tüm aktivitelerin global özeti.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className="glass p-6 rounded-3xl border border-white/10 hover:border-radiant-amber/30 transition-colors duration-500 relative overflow-hidden group"
                        >
                            <div className="absolute -inset-x-0 -bottom-10 h-1/2 bg-gradient-to-t from-radiant-amber/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-radiant-amber/10 group-hover:border-radiant-amber/20 transition-colors">
                                    <Icon className="text-white/60 group-hover:text-radiant-amber transition-colors" size={24} />
                                </div>
                                <span className="text-green-400 text-sm font-bold bg-green-400/10 px-2 py-1 rounded-lg">
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-white/60 text-sm font-medium mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-white px-0.5">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dashboard Visual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 min-h-[400px] flex flex-col relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider relative z-10">Satış Performansı</h3>
                        <div className="flex gap-2">
                            {['Haftalık', 'Aylık', 'Yıllık'].map((tab) => (
                                <button key={tab} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'Aylık' ? 'bg-radiant-amber text-cosmic-blue shadow-glow' : 'bg-white/5 text-white/40 hover:text-white'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-3 px-4 pb-4">
                        {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="flex-1 bg-gradient-to-t from-radiant-amber/40 to-radiant-amber/10 rounded-t-xl relative group/bar"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold text-radiant-amber">
                                    ₺{(height * 1000).toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="glass p-8 rounded-3xl border border-white/10 min-h-[400px] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Son Aktiviteler</h3>
                        <Activity size={18} className="text-radiant-amber animate-pulse" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        {[
                            { user: 'Ahmet Y.', action: 'Yeni Sipariş', time: '2 dk önce', amount: '₺12,500' },
                            { user: 'Zeynep K.', action: 'Üye Kaydı', time: '15 dk önce', amount: null },
                            { user: 'Mehmet A.', action: 'Yorum Yazdı', time: '1 sa önce', amount: null },
                            { user: 'Sistem', action: 'Stok Güncelleme', time: '2 sa önce', amount: null },
                            { user: 'Elif S.', action: 'Yeni Sipariş', time: '3 sa önce', amount: '₺8,400' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                                <div className="w-10 h-10 rounded-full bg-cosmic-blue border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <ShoppingCart size={14} className="text-radiant-amber" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-white font-medium truncate">{activity.action}</p>
                                        {activity.amount && <span className="text-[10px] font-black text-radiant-amber">{activity.amount}</span>}
                                    </div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{activity.user} • {activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
