"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, AlertCircle, Zap, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import { getApexAnalysis, ApexReportItem } from '@/app/actions/apex';

export default function ApexAnalysis() {
    const [reports, setReports] = useState<ApexReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                const data = await getApexAnalysis();
                setReports(data);
            } catch (err) {
                console.error('Apex fetch failed:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalysis();
    }, []);

    const getIcon = (category: string) => {
        switch (category) {
            case 'stock': return <AlertCircle size={16} />;
            case 'conversion': return <Activity size={16} />;
            case 'strategy': return <Zap size={16} />;
            default: return <TrendingUp size={16} />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return '#ef4444'; // Red
            case 'medium': return '#fbbf24'; // Amber
            case 'low': return '#10b981'; // Emerald
            default: return '#fff';
        }
    };

    if (loading) {
        return (
            <div className="glass rounded-[32px] p-8 border border-white/5 animate-pulse">
                <div className="w-48 h-4 bg-white/10 rounded-full mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/10 via-amber-600/10 to-blue-600/10 rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative glass rounded-[32px] border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-7 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center border border-white/10 shadow-glow">
                            <Cpu size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Apex Operasyonel Zeka</h2>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-0.5">7 Günlük Durum ve Aksiyon Raporu</p>
                        </div>
                    </div>
                </div>

                {/* Report Items */}
                <div className="p-4 space-y-3">
                    <AnimatePresence>
                        {reports.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group/item flex gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
                            >
                                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${getUrgencyColor(item.urgency)}15`, border: `1px solid ${getUrgencyColor(item.urgency)}30` }}>
                                    <span style={{ color: getUrgencyColor(item.urgency) }}>
                                        {getIcon(item.category)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: getUrgencyColor(item.urgency) }}>
                                            {item.title}
                                        </h3>
                                        {item.urgency === 'high' && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                        )}
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="shrink-0 self-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <ChevronRight size={14} className="text-white/20" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Footer / Status Badge */}
                <div className="px-7 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Sistem Durumu: Nominal</span>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">
                        Detaylı Analiz Paneli
                    </button>
                </div>
            </div>
        </section>
    );
}
