"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-cosmic-blue">
            <div className="relative">
                {/* Background Glows */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-radiant-amber blur-[100px] rounded-full -m-20"
                />

                <div className="relative flex flex-col items-center gap-8">
                    {/* Floating Core */}
                    <motion.div
                        animate={{
                            y: [-20, 0, -20],
                            rotate: 360
                        }}
                        transition={{
                            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                        }}
                        className="w-24 h-24 glass rounded-[40px] border border-white/20 flex items-center justify-center shadow-glow-amber scale-125"
                    >
                        <Sparkles className="text-radiant-amber" size={40} />
                    </motion.div>

                    {/* Text Sequence */}
                    <div className="flex flex-col items-center">
                        <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[10px] font-black uppercase tracking-[0.5em] text-radiant-amber text-center"
                        >
                            Anti-Gravity
                        </motion.span>
                        <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">
                            Sistem Hazırlanıyor
                        </span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                        <motion.div
                            animate={{ x: [-200, 200] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-radiant-amber to-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
