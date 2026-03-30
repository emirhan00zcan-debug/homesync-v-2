"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeEffect } from '@/context/ThemeContext';
import AIStylistModal from './AIStylistModal';
import { Product } from '@/types';
import { usePathname } from 'next/navigation';

interface AIStylistProps {
    products?: Product[];
}

const AIStylist = ({ products = [] }: AIStylistProps) => {
    const { theme } = useThemeEffect();
    const isLightOn = theme === 'light';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pathname = usePathname();

    if (pathname?.startsWith('/katalog') || pathname?.startsWith('/koleksiyonlar') || pathname?.startsWith('/magazalar')) {
        return null;
    }

    return (
        <React.Fragment>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: "easeOut" }
                }}
                className="fixed bottom-[6rem] md:bottom-[7rem] left-6 xl:left-12 z-[100] group flex flex-col items-start"
            >
                {/* Drifting Background Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute inset-0 blur-2xl rounded-full -z-10 ${isLightOn ? 'bg-radiant-amber/20' : 'bg-radiant-amber/40'}`}
                />

                {/* Floating Bubble */}
                <motion.button
                    onClick={() => setIsModalOpen(true)}
                    animate={{
                        y: [-5, 5, -5],
                        rotate: [-1, 1, -1]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`relative group flex items-center gap-3 px-6 py-4 rounded-full border transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl ${isLightOn
                        ? 'bg-white border-black/10 text-cosmic-blue shadow-black/10'
                        : 'bg-[#0A192F] border-white/20 text-ivory-white shadow-black/50'
                        }`}
                >
                    {/* HS AI Logo */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-radiant-amber rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                        <span className="text-xs font-black tracking-tighter text-radiant-amber">HS</span>

                        {/* Pulsing Core */}
                        <div className="absolute w-1 h-1 bg-radiant-amber rounded-full animate-ping" />
                    </div>

                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 leading-none mb-1">
                            Yapay Zeka Stilisti
                        </span>
                        <span className="text-xs font-bold whitespace-nowrap">
                            Odamı Tasarla
                        </span>
                    </div>

                    {/* Hover Indicator */}
                    <div className="ml-2 w-1.5 h-1.5 rounded-full bg-radiant-amber shadow-[0_0_8px_#FFBF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                {/* Tooltip/Hint */}
                <div className={`absolute bottom-full left-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 pointer-events-none`}>
                    <div className={`glass px-4 py-2 rounded-2xl border text-[10px] whitespace-nowrap uppercase tracking-widest font-bold ${isLightOn ? 'bg-white/80 border-black/5 text-cosmic-blue/60' : 'bg-black/80 border-white/10 text-ivory-white/60'
                        }`}>
                        Yapay Zeka tasarımı için oda fotoğrafı yükleyin
                    </div>
                </div>
            </motion.div>

            <AIStylistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={products}
            />
        </React.Fragment>
    );
};

export default AIStylist;
