"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, RefreshCcw } from 'lucide-react';

export default function VendorAIReport({ stats }: { stats: any }) {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/ai/vendor-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stats),
            });
            const data = await res.json();
            if (data.report) {
                setReport(data.report);
            }
        } catch (error) {
            console.error('Error fetching AI report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (stats) {
            fetchReport();
        }
    }, [stats]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(255,191,0,0.05), rgba(255,191,0,0.01))',
                borderColor: 'rgba(255,191,0,0.2)'
            }}
        >
            {/* Background glowing effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-radiant-amber/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-radiant-amber" />
                    <h3 className="text-lg font-black text-white">AI Performans Analizi</h3>
                </div>
                <button
                    onClick={fetchReport}
                    disabled={isLoading}
                    className="p-2 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                    title="Analizi Yenile"
                >
                    <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="relative z-10 min-h-[80px] flex flex-col justify-center">
                {isLoading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-white/5 rounded w-full"></div>
                        <div className="h-4 bg-white/5 rounded w-5/6"></div>
                        <div className="h-4 bg-white/5 rounded w-4/6"></div>
                    </div>
                ) : report ? (
                    <div className="space-y-4">
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                            {report.split('Aksiyon Önerisi:')[0]}
                        </p>
                        {report.includes('Aksiyon Önerisi:') && (
                            <div className="p-3 bg-radiant-amber/10 border border-radiant-amber/20 rounded-xl flex items-start gap-3">
                                <TrendingUp className="text-radiant-amber shrink-0 mt-0.5" size={16} />
                                <p className="text-sm font-bold text-radiant-amber">
                                    <span className="opacity-80">Aksiyon: </span>
                                    {report.split('Aksiyon Önerisi:')[1]}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-white/50">Analiz şu anda oluşturulamıyor.</p>
                )}
            </div>
        </motion.div>
    );
}
