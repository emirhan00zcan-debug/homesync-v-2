"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useThemeEffect } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

const LightSlider = () => {
    const { theme, toggleTheme } = useThemeEffect();
    const isDark = theme === 'dark';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 group cursor-pointer" 
            onClick={toggleTheme}
        >
            {/* Status Label - Appears on Hover & Active */}
            <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-2 group-hover:translate-x-0 hidden sm:flex">
                <span className={`text-[8px] uppercase tracking-[0.3em] font-medium transition-colors duration-500
                    ${isDark ? 'text-white/40' : 'text-cosmic-blue/40'}`}>
                    Atmosphere
                </span>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-500
                    ${isDark ? 'text-radiant-amber' : 'text-cosmic-blue'}`}>
                    {isDark ? 'Starlight' : 'Daylight'}
                </span>
            </div>

            {/* The Glass Capsule */}
            <div className={`relative w-[72px] h-[36px] rounded-full p-1.5 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isDark 
                    ? 'bg-[#0A0F1A]/80 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_0_30px_rgba(255,191,0,0.15)] ring-1 ring-white/5' 
                    : 'bg-white/80 backdrop-blur-xl border border-cosmic-blue/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5'
                }`}
            >
                {/* Orbiting Ring Background */}
                <div className="absolute flex justify-between items-center inset-0 px-3 z-0 pointer-events-none">
                    <span className={`text-[8px] font-bold transition-opacity duration-700 ${isDark ? 'opacity-20 text-white' : 'opacity-80 text-cosmic-blue'}`}>DAY</span>
                    <span className={`text-[8px] font-bold transition-opacity duration-700 ${isDark ? 'opacity-80 text-radiant-amber' : 'opacity-20 text-cosmic-blue'}`}>NOX</span>
                </div>

                {/* The Celestial Sphere */}
                <motion.div
                    animate={{
                        x: isDark ? 36 : 0,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        mass: 1
                    }}
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all duration-700
                        ${isDark 
                            ? 'bg-gradient-to-tr from-radiant-amber via-[#FFBF00] to-[#FFE082] shadow-[0_0_25px_rgba(255,191,0,0.7),inset_0_-2px_5px_rgba(0,0,0,0.3)]' 
                            : 'bg-gradient-to-tr from-cosmic-blue via-[#112A4F] to-[#2B5488] shadow-[0_4px_15px_rgba(10,25,47,0.4),inset_0_2px_5px_rgba(255,255,255,0.4)]'
                        }`}
                >
                    {/* Inner core glow for anti-gravity feeling */}
                    <motion.div
                        animate={{ 
                            scale: isDark ? [1, 1.2, 1] : 1,
                            opacity: isDark ? [0.8, 1, 0.8] : 1
                        }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className={`w-2 h-2 rounded-full blur-[1px] transition-colors duration-700
                            ${isDark ? 'bg-white' : 'bg-[#E6F0FA]'}`}
                    />

                    {/* Orbital ring around the sphere inside the capsule */}
                    <motion.div 
                        className={`absolute inset-[-4px] rounded-full border border-dashed transition-all duration-1000 ${isDark ? 'border-radiant-amber/50 rotate-180' : 'border-white/30 rotate-0'}`}
                        animate={{ rotate: isDark ? 360 : 0 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    />
                </motion.div>

                {/* Stars / Ambient Dust */}
                <div className="absolute inset-0 pointer-events-none">
                    <AnimatePresence>
                        {isDark && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="w-full h-full"
                            >
                                <div className="absolute top-1.5 left-2 w-[1px] h-[1px] bg-white rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-80" />
                                <div className="absolute bottom-1.5 left-4 w-[1.5px] h-[1.5px] bg-white/60 rounded-full animate-pulse" />
                                <div className="absolute top-2 right-8 w-[1px] h-[1px] bg-radiant-amber/80 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default LightSlider;
