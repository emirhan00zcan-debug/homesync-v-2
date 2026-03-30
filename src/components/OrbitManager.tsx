"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, Timer, X, Sparkles, AlertCircle } from 'lucide-react';
import { useCartStore, useCartTotal } from '@/store';
import { useThemeEffect } from '@/context/ThemeContext';

export default function OrbitManager() {
    const cart = useCartStore((s) => s.cart);
    const activeDiscount = useCartStore((s) => s.activeDiscount);
    const applyDiscount = useCartStore((s) => s.applyDiscount);
    const toggleAssembly = useCartStore((s) => s.toggleAssembly);
    const cartTotal = useCartTotal();
    const { isLightOn } = useThemeEffect();
    const [showAssemblyNudge, setShowAssemblyNudge] = useState(false);
    const [showExitDiscount, setShowExitDiscount] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const [nudgeDismissed, setNudgeDismissed] = useState(false);

    // 1. Assembly Service Nudge Logic
    useEffect(() => {
        if (nudgeDismissed) return;

        // Check for products that don't have assembly included
        const needsAssembly = cart.some(item => !item.includeAssembly);

        if (needsAssembly && cart.length > 0) {
            const timer = setTimeout(() => setShowAssemblyNudge(true), 3000);
            return () => clearTimeout(timer);
        } else {
            setShowAssemblyNudge(false);
        }
    }, [cart, nudgeDismissed]);

    // 2. Exit Intent / Dwell Time Logic
    useEffect(() => {
        if (activeDiscount > 0) return;

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                setShowExitDiscount(true);
            }
        };

        const dwellTimer = setTimeout(() => {
            if (cart.length > 0) setShowExitDiscount(true);
        }, 60000); // 1 minute dwell

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(dwellTimer);
        };
    }, [activeDiscount, cart.length]);

    // 3. Countdown Timer
    useEffect(() => {
        if (activeDiscount > 0 && timeLeft > 0) {
            const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [activeDiscount, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddAssembly = () => {
        cart.forEach(item => {
            if (!item.includeAssembly) toggleAssembly(item.id, true);
        });
        setShowAssemblyNudge(false);
        setNudgeDismissed(true);
    };

    const handleApplyDiscount = () => {
        applyDiscount(15); // 15% discount
        setShowExitDiscount(false);
    };

    return (
        <>
            {/* Assembly Nudge */}
            <AnimatePresence>
                {showAssemblyNudge && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        className="fixed bottom-8 left-8 right-8 md:left-auto md:w-96 z-[100]"
                    >
                        <div className={`glass p-6 rounded-[32px] border ${isLightOn ? 'border-cosmic-blue/10 bg-ivory-white/80' : 'border-radiant-amber/20 bg-cosmic-blue/80'} shadow-2xl backdrop-blur-xl relative overflow-hidden group`}>
                            <button
                                onClick={() => { setShowAssemblyNudge(false); setNudgeDismissed(true); }}
                                className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex gap-4 items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-radiant-amber/10 border border-radiant-amber/20 flex items-center justify-center shrink-0 animate-pulse">
                                    <ShieldCheck className="text-radiant-amber" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-1">Yerçekimsiz Kurulum</h4>
                                    <p className="text-[10px] opacity-60 leading-relaxed uppercase font-bold text-sky-400">Orbit Tavsiyesi</p>
                                </div>
                            </div>

                            <p className="text-xs font-medium mb-6 opacity-80 leading-relaxed">
                                Görünüşe göre hassas teknoloji parçaları seçtiniz. Uzman ekibimizle profesyonel kurulumun keyfini çıkarın.
                            </p>

                            <button
                                onClick={handleAddAssembly}
                                className="w-full py-4 bg-radiant-amber text-cosmic-blue font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group-hover:shadow-glow"
                            >
                                <Zap size={14} /> Tüm Ürünlere Kurulum Ekle
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Exit Intent Discount Popup */}
            <AnimatePresence>
                {showExitDiscount && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-cosmic-blue/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`max-w-md w-full glass p-12 rounded-[64px] border border-radiant-amber/30 text-center relative overflow-hidden ${isLightOn ? 'bg-ivory-white shadow-2xl text-cosmic-blue' : 'bg-cosmic-blue shadow-glow'}`}
                        >
                            <button
                                onClick={() => setShowExitDiscount(false)}
                                className="absolute top-8 right-8 opacity-40 hover:opacity-100"
                            >
                                <X size={24} />
                            </button>

                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 bg-radiant-amber/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-radiant-amber/20 shadow-glow"
                            >
                                <Sparkles className="text-radiant-amber" size={40} />
                            </motion.div>

                            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">GİTMEYİN!</h2>
                            <p className="text-xs opacity-60 uppercase tracking-[0.3em] font-black mb-8">Yerçekimsiz İndiriminizi Rezerve Ettik</p>

                            <div className="text-6xl font-black text-radiant-amber mb-8 tracking-tighter">
                                %15 <span className="text-xl uppercase tracking-widest text-white/40 block">Extra İndirim</span>
                            </div>

                            <p className="text-sm font-medium mb-12 opacity-80 max-w-xs mx-auto">
                                Deneyiminizi başlatmak için size özel bir teklifimiz var. Bu kodu sadece önümüzdeki 15 dakika boyunca kullanabilirsiniz.
                            </p>

                            <button
                                onClick={handleApplyDiscount}
                                className="w-full py-6 bg-radiant-amber text-cosmic-blue font-black rounded-2xl text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-glow"
                            >
                                İNDİRİMİ KOLLAN
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Timer Badge (active when discount is on) */}
            <AnimatePresence>
                {activeDiscount > 0 && timeLeft > 0 && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="fixed bottom-8 right-8 z-[200] group"
                    >
                        <div className="flex items-center gap-4 bg-radiant-amber text-cosmic-blue px-6 py-4 rounded-2xl shadow-glow font-black border border-white/20">
                            <div className="flex flex-col">
                                <span className="text-[8px] uppercase tracking-widest opacity-60">Teklif Sona Eriyor</span>
                                <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-cosmic-blue/10" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black">%15 İndirim Aktif</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
