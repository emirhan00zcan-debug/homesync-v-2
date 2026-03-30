"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeEffect } from '@/context/ThemeContext';

const InteractiveChandelier = () => {
    const { isLightOn, toggleLight } = useThemeEffect();

    return (
        <div className="relative flex flex-col items-center justify-center p-32 transition-all duration-1000 pointer-events-none perspective-[2000px]">

            {/* Floating Rings (Aura v2.0 Concept) */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotateX: [0, 5, 0],
                    rotateY: [0, -5, 0]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-20 pointer-events-auto cursor-pointer"
                onClick={toggleLight}
            >
                {/* 1. The Large Outer Ring */}
                <motion.div 
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className={`w-[300px] h-[300px] rounded-full border-[1px] transition-all duration-1000 relative flex items-center justify-center ${
                        isLightOn ? 'border-radiant-amber shadow-[0_0_50px_rgba(255,191,0,0.4)]' : 'border-white/10'
                    }`}
                >
                    <div className="absolute inset-0 rounded-full border-t border-white/20 blur-[1px]" />
                </motion.div>

                {/* 2. Middle Glass Ring */}
                <motion.div 
                    animate={{ rotateZ: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 m-auto w-[220px] h-[220px] rounded-full border-[12px] transition-all duration-1000 glass-premium-ultra ${
                        isLightOn ? 'border-radiant-amber/40 shadow-glow-amber' : 'border-white/5'
                    }`}
                >
                    <div className="absolute inset-0 rounded-full border-[1px] border-white/30 skew-x-12" />
                </motion.div>

                {/* 3. Core Emissive Crystal */}
                <div className="absolute inset-0 m-auto w-12 h-40 flex items-center justify-center">
                    <motion.div 
                        animate={isLightOn ? { 
                            scaleY: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8]
                        } : {}}
                        transition={{ duration: 4, repeat: Infinity }}
                        className={`w-3 h-full rounded-full blur-[2px] transition-all duration-1000 ${
                            isLightOn ? 'bg-radiant-amber shadow-[0_0_60px_#FFBF00]' : 'bg-white/10'
                        }`}
                    />
                </div>

                {/* Interactive Flare (Dark Mode Only) */}
                {!isLightOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
                    </div>
                )}
            </motion.div>

            {/* Volumetric Atmosphere Glow */}
            <AnimatePresence>
                {isLightOn && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
                    >
                        <div className="absolute w-[1200px] h-[1200px] bg-radiant-amber/[0.08] blur-[200px] rounded-full animate-pulse" />
                        <div className="absolute w-[600px] h-[600px] bg-radiant-amber/[0.12] blur-[100px] rounded-full" />
                        <div className="absolute w-[300px] h-[300px] bg-radiant-amber/[0.2] blur-[50px] rounded-full" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Technical Metadata */}
            <div className="mt-20 text-center opacity-10">
                <p className="text-[8px] font-black tracking-[1.5em] uppercase text-white">AURA SERIES • PROTOTYPE v2.0</p>
            </div>
        </div>
    );
};

export default InteractiveChandelier;
