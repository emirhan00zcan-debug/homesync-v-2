"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Zap } from 'lucide-react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { Button } from '@/components/ui/Button';

interface CustomerDashboardClientProps {
    user: any;
    stats: {
        ordersCount: number;
        favoritesCount: number;
        installationsCount: number;
    };
    recentOrders: any[];
}

export default function CustomerDashboardClient({ user, stats, recentOrders }: CustomerDashboardClientProps) {
    const realTimeOrders = useOrderTracking(recentOrders, user?.id);

    return (
        <div className="p-8 lg:p-12">
            <header className="mb-12">
                <p className="text-radiant-amber text-[10px] font-black uppercase tracking-[0.4em] mb-3">Customer Portal</p>
                <h1 className="text-5xl font-black text-white tracking-tighter">Hoş Geldiniz, {user?.user_metadata?.name || user?.email?.split('@')[0]}</h1>
                <p className="text-white/40 text-sm mt-4 tracking-wide max-w-lg">Siparişlerinizi yönetin, tasarım tercihlerinizi inceleyin ve HomeSync deneyiminizi kişiselleştirin.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Aktif Siparişler", value: stats.ordersCount, icon: ShoppingBag, color: "text-blue-400" },
                    { label: "Kayıtlı Tasarımlar", value: stats.favoritesCount, icon: Heart, color: "text-red-400" },
                    { label: "Kurulumlar", value: stats.installationsCount, icon: Zap, color: "text-radiant-amber" },
                ].map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                        <stat.icon className={stat.color} size={32} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Son Siparişler</h4>
                    <div className="space-y-4">
                        {realTimeOrders.length > 0 ? realTimeOrders.map((order, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 10 }}
                                className="glass p-6 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer flex items-center gap-6"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <ShoppingBag className="text-white/20" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-white mb-1">Sipariş #{order.id.slice(0, 8)}</h5>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                        {new Date(order.created_at).toLocaleDateString('tr-TR')} tarihinde verildi
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-radiant-amber">{order.total_amount.toLocaleString('tr-TR')} ₺</p>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-green-400">{order.status}</span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="p-8 border border-dashed border-white/10 rounded-[32px] text-center opacity-30 text-xs font-bold uppercase tracking-widest">
                                Henüz siparişiniz bulunmuyor
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Stylist Suggestion Preview */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">AI Stil Danışmanı</h4>
                    <div className="glass p-8 rounded-[40px] border border-radiant-amber/10 bg-radiant-amber/[0.02] h-full flex flex-col justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-radiant-amber/10 flex items-center justify-center mb-6">
                            <Zap className="text-radiant-amber" size={28} />
                        </div>
                        <h5 className="text-xl font-bold text-white mb-2">Tercihleriniz Analiz Ediliyor...</h5>
                        <p className="text-sm text-white/40 mb-8 leading-relaxed italic">&quot;Favorilerinizdeki modern ve minimalist çizgiler, **Zenith Serisi** ile mükemmel bir uyum yakalayacaktır.&quot;</p>
                        <Button className="w-fit px-8 py-3 bg-white/5 hover:bg-radiant-amber hover:text-cosmic-blue font-black rounded-xl uppercase text-[10px] tracking-[0.2em] border border-white/10">
                            Detaylı Analizi Gör
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
