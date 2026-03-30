"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useThemeEffect } from '@/context/ThemeContext';

export default function NotFound() {
    const { isLightOn } = useThemeEffect();

    return (
        <main className={`min-h-screen flex items-center justify-center p-6 overflow-hidden relative transition-colors duration-1000 ${isLightOn ? 'bg-ivory-white text-cosmic-blue' : 'bg-cosmic-blue text-ivory-white'}`}>

            {/* Drifting Background Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 top-1/4 h-[500px] bg-radiant-amber blur-[150px] -z-10"
            />

            <div className="max-w-2xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="mb-12 relative inline-block">
                        <motion.span
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="text-[180px] md:text-[240px] font-black leading-none tracking-tighter opacity-10 select-none block"
                        >
                            404
                        </motion.span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 glass rounded-3xl border border-white/20 flex items-center justify-center shadow-glow animate-float">
                                <Sparkles className="text-radiant-amber" size={48} />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">
                        Yörüngeden Çıktınız.
                    </h1>
                    <p className="text-lg md:text-xl font-light opacity-60 mb-12 max-w-lg mx-auto leading-relaxed">
                        Aradığınız sayfa yerçekimsiz ortamda kaybolmuş olabilir veya henüz keşfedilmemiştir.
                    </p>

                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-radiant-amber text-cosmic-blue font-black uppercase tracking-[0.3em] text-[11px] rounded-full shadow-glow flex items-center gap-4 mx-auto"
                        >
                            <ArrowLeft size={16} /> Merkeze Dön
                        </motion.button>
                    </Link>
                </motion.div>
            </div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        top: `${20 + (i * 15)}%`,
                        left: `${10 + (i * 15)}%`,
                    }}
                />
            ))}
        </main>
    );
}
